import { formatDate } from "@/utils/formatDate";
import type { HistoryItem } from "@/types/history";
import { useState } from "react";
import Overlay from "@/components/Overlay";
import { Download, Search } from "lucide-react";

interface HistoryTimelineProps {
  items: HistoryItem[];
}

const toDisplay = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const isImageUrl = (value: string, fieldName?: string) => {
  if (!value) return false;
  if (value.startsWith("data:image/")) return true;
  const lowerField = (fieldName || "").toLowerCase();
  const imageFieldHint =
    lowerField.includes("img") ||
    lowerField.includes("image") ||
    lowerField.includes("photo") ||
    lowerField.includes("avatar") ||
    lowerField.includes("_doc");

  try {
    const url = new URL(value);
    const pathname = url.pathname.toLowerCase();
    const byExt = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp", ".svg"].some((ext) =>
      pathname.endsWith(ext)
    );
    const byQueryHint = /image|img|avatar|photo|s3/i.test(url.search);
    return byExt || byQueryHint || imageFieldHint;
  } catch {
    const lowerValue = value.toLowerCase();
    const byExt = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp", ".svg"].some((ext) =>
      lowerValue.includes(ext)
    );
    const pathLike = lowerValue.startsWith("/") || lowerValue.startsWith("./") || lowerValue.startsWith("../");
    return byExt || (imageFieldHint && pathLike);
  }
};

const ImagePreview = ({ src, label, onPreview }: { src: string; label: "From" | "To"; onPreview: (s: string) => void }) => {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="inline-flex h-24 w-24 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-500">
        {label} image unavailable
      </div>
    );
  }

  return (
    <div className="relative group/img h-24 w-24 cursor-pointer" onClick={() => onPreview(src)}>
      <img
        src={src}
        alt={`${label} preview`}
        className="h-full w-full rounded-lg border border-slate-200 object-cover group-hover/img:brightness-75 transition-all"
        loading="lazy"
        onError={() => setFailed(true)}
      />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
        <Search className="text-white" size={20} />
      </div>
    </div>
  );
};

const HistoryTimeline = ({ items }: HistoryTimelineProps) => {
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  if (!items.length) {
    return <p className="text-sm font-semibold text-slate-500">No history found for this record yet.</p>;
  }

  const getValueMeta = (value: unknown) => {
    if (value === null || value === undefined || value === "") {
      return { kind: "empty" as const, summary: "—", pretty: "" };
    }

    if (typeof value === "object") {
      const pretty = JSON.stringify(value, null, 2);
      if (Array.isArray(value)) {
        return { kind: "json" as const, summary: `Array (${value.length} items)`, pretty };
      }
      const keys = Object.keys(value as Record<string, unknown>).length;
      return { kind: "json" as const, summary: `Object (${keys} keys)`, pretty };
    }

    const text = String(value);
    const summary = text.length > 80 ? `${text.slice(0, 80)}...` : text;
    return { kind: "text" as const, summary, pretty: text };
  };

  const renderValue = (
    label: "From" | "To",
    value: unknown,
    tone: "muted" | "strong",
    fieldName?: string
  ) => {
    const textClass = tone === "muted" ? "text-slate-500" : "text-slate-900";
    const raw = typeof value === "string" ? value : "";

    if (raw && isImageUrl(raw, fieldName)) {
      return (
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-2">
          <p className={`mb-2 ${textClass}`}>{label}: Image updated</p>
          <ImagePreview src={raw} label={label} onPreview={setPreviewImg} />
        </div>
      );
    }

    return (
      <p>
        {label}: <span className={textClass}>{toDisplay(value)}</span>
      </p>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => (
        <div key={item._id} className="rounded-2xl border border-slate-100 bg-slate-50/40 p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
              {item.action.replace("_", " ")}
            </span>
            <span className="text-[11px] font-bold text-slate-500">
              {formatDate(new Date(item.createdAt))}
            </span>
          </div>
          <p className="mb-3 text-xs font-semibold text-slate-600">
            By {item.actor?.fullname || item.actor?.username || "System"}
          </p>
          <div className="flex flex-col gap-2">
            {item.changedFields?.length ? (
              item.changedFields.map((field) => {
                const beforeMeta = getValueMeta(item.before?.[field]);
                const afterMeta = getValueMeta(item.after?.[field]);
                return (
                  <div key={field} className="rounded-xl bg-white p-3 border border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{field}</p>
                    <div className="mt-1 grid grid-cols-1 gap-1 text-xs font-semibold text-slate-700">
                      {beforeMeta.kind === "json" ? (
                        <details className="rounded-lg border border-slate-100 bg-slate-50 p-2">
                          <summary className="cursor-pointer text-slate-600">From: {beforeMeta.summary}</summary>
                          <pre className="mt-2 overflow-x-auto rounded bg-white p-2 text-[11px] text-slate-700">{beforeMeta.pretty}</pre>
                        </details>
                      ) : (
                        renderValue("From", item.before?.[field], "muted", field)
                      )}
                      {afterMeta.kind === "json" ? (
                        <details className="rounded-lg border border-slate-100 bg-slate-50 p-2">
                          <summary className="cursor-pointer text-slate-800">To: {afterMeta.summary}</summary>
                          <pre className="mt-2 overflow-x-auto rounded bg-white p-2 text-[11px] text-slate-900">{afterMeta.pretty}</pre>
                        </details>
                      ) : (
                        renderValue("To", item.after?.[field], "strong", field)
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-xs font-semibold text-slate-500">No field-level diff captured.</p>
            )}
          </div>
        </div>
      ))}

      {previewImg && (
        <Overlay onCancel={() => setPreviewImg(null)}>
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-[2.5rem] bg-white p-4 shadow-2xl">
            <img src={previewImg} alt="Preview" className="w-full h-full object-contain rounded-3xl" />
            <button
              className="absolute top-8 right-8 p-4 bg-indigo-600 text-white rounded-2xl shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-2 font-black text-[10px] uppercase"
              onClick={() => {
                const a = document.createElement("a");
                a.href = previewImg;
                a.download = "history-document.jpg";
                a.click();
              }}
            >
              <Download size={18} /> Download
            </button>
          </div>
        </Overlay>
      )}
    </div>
  );
};

export default HistoryTimeline;
