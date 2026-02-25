import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  deleteTruckEntryAsync,
  fetchTrucksEntriesAsync,
  selectTruckLoading,
  truckSelectors,
  updateTruckEntryAsync,
} from "../../../features/truck";
import type { AppDispatch } from "../../../app/store";
import Loading from "../../../components/Loading";
import { type TruckType } from "../../../types/truck";
import { formatDate } from "../../../utils/formatDate";
import EditHeader from "../../../components/EditHeader";
import DetailBlock from "../JourneyDetail/components/DetailBlock";
import FormInputImage from "../../../components/FormInputImage";
import { addMessage } from "../../../features/message";
import Overlay from "../../../components/Overlay";
import {
  ArrowLeft,
  Truck,
  Settings,
  FileText,
  Calendar,
  ShieldCheck,
  AlertCircle,
  Download,
  Clock
} from "lucide-react";

const TruckDetail = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(selectTruckLoading);
  const trucks = useSelector(truckSelectors.selectAll);
  const [isEditMode, setIsEditMode] = useState(false);
  const [backupTruck, setBackupTruck] = useState<TruckType | null>(null);
  const [localTruck, setLocalTruck] = useState<TruckType | null>(null);
  const [changedDocuments, setChangedDocuments] = useState<Set<string>>(
    new Set()
  );
  const emptyFieldValue = "----------";
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  useEffect(() => {
    if (trucks.length === 0) dispatch(fetchTrucksEntriesAsync());
  }, [dispatch, trucks.length]);

  const truck = trucks.find((t) => t._id === id);

  useEffect(() => {
    if (truck && !loading) setLocalTruck(truck);
  }, [truck, loading, id]);

  if (loading || !localTruck) return <Loading />;

  const isDirty = JSON.stringify(truck) !== JSON.stringify(localTruck);

  const handleFileSelect = (file: File | null, field: keyof TruckType) => {
    setLocalTruck((prev) => (prev ? { ...prev, [field]: file } : prev));
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();

      Object.entries(localTruck).forEach(([key, value]) => {
        if (!value) return;

        if (value instanceof File) {
          formData.append(key, value);
        } else if (typeof value === "string") {
          formData.append(key, value);
        } else if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === "object") {
          formData.append(key, JSON.stringify(value));
        }
      });

      if (changedDocuments.size > 0) {
        formData.append(
          "changedDocuments",
          JSON.stringify([...changedDocuments])
        );
      }

      const resultAction = await dispatch(
        updateTruckEntryAsync({
          id: localTruck._id,
          updatedTruck: formData,
        })
      );
      if (updateTruckEntryAsync.fulfilled.match(resultAction)) {
        dispatch(
          addMessage({ type: "success", text: "Truck updated successfully" })
        );
      } else if (updateTruckEntryAsync.rejected.match(resultAction)) {
        const error = resultAction.payload;
        if (error) {
          dispatch(
            addMessage({ type: "error", text: "Failed to update truck" })
          );
        }
      }
    } catch (error: any) {
      dispatch(addMessage({ type: "error", text: "Something went wrong" }));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const resultAction = await dispatch(deleteTruckEntryAsync(id));
      if (deleteTruckEntryAsync.fulfilled.match(resultAction)) {
        dispatch(
          addMessage({ type: "success", text: "Truck deleted successfully" })
        );
        navigate("/journey/all-truck-entries");
      } else if (deleteTruckEntryAsync.rejected.match(resultAction)) {
        const error = resultAction.payload;
        if (error) {
          dispatch(
            addMessage({ type: "error", text: "Failed to delete truck" })
          );
        }
      }
    } catch (error: any) {
      dispatch(addMessage({ type: "error", text: "Something went wrong" }));
    }
  };

  const safeDate = (date?: string) =>
    date ? formatDate(new Date(date)) : emptyFieldValue;

  const getExpiryStatus = (date?: string) => {
    if (!date) return 'neutral';
    const expiry = new Date(date);
    const today = new Date();
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'expired';
    if (diffDays < 30) return 'warning';
    return 'active';
  };

  return (
    <div className="flex flex-col gap-10 pb-20 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-colors w-fit"
        >
          <ArrowLeft size={14} />
          Back to Fleet
        </button>
        <EditHeader
          heading="Vehicle Profile"
          isDirty={isDirty}
          onEditClick={() => {
            setBackupTruck(localTruck);
            setIsEditMode(true);
          }}
          onCancelClick={() => {
            setLocalTruck(backupTruck);
            setIsEditMode(false);
          }}
          onSaveClick={() => {
            setIsEditMode(false);
            handleSave();
          }}
          onDeleteClick={() => {
            handleDelete(localTruck?._id);
          }}
          onDiscardClick={() => {
            setLocalTruck(backupTruck);
            setIsEditMode(false);
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="card-premium p-8 flex flex-col items-center text-center gap-6 bg-slate-900 border-slate-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-all duration-500"></div>

            <div className="w-24 h-24 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-inner group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-500">
              <Truck size={40} strokeWidth={2.5} />
            </div>

            <div className="flex flex-col gap-2 relative z-10">
              <h2 className="text-3xl font-black italic tracking-tight text-white uppercase">{localTruck.truck_no}</h2>
              <div className="flex items-center justify-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                <Settings size={12} className="text-indigo-400 animate-spin-slow" />
                Heavy Load Carrier • BSVI
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Status</span>
                <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Premium</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Type</span>
                <span className="text-xs font-black text-indigo-400 uppercase tracking-widest italic">12-Wheeler</span>
              </div>
            </div>
          </div>

          <div className="card-premium p-6 flex flex-col gap-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <Clock size={14} className="text-indigo-500" />
              Renewal Reminders
            </h3>
            <div className="flex flex-col gap-4">
              {[
                { label: 'Insurance', date: localTruck.insurance_doc_expiry },
                { label: 'National Permit', date: localTruck.national_permit_doc_expiry },
                { label: 'Pollution (PUCC)', date: localTruck.pollution_doc_expiry },
              ].map((item, i) => {
                const status = getExpiryStatus(item.date);
                return (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700">{item.label}</span>
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{safeDate(item.date)}</span>
                    </div>
                    <div className={`
                                    w-2 h-2 rounded-full 
                                    ${status === 'expired' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse' :
                        status === 'warning' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
                          'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}
                                `}></div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-10">
          <DetailBlock
            title="Operational Records"
            icon={<FileText size={18} />}
            isEditMode={isEditMode}
            onChange={(key, value) => {
              setLocalTruck((prev) => (prev ? { ...prev, [key]: value } : prev));
            }}
            fields={[
              {
                key: "truck_no",
                label: "Truck Registration",
                value: localTruck.truck_no,
                isEditable: true,
              },
              {
                key: "fitness_doc_expiry",
                label: "Fitness Validity",
                value: safeDate(localTruck.fitness_doc_expiry),
                isEditable: true,
              },
              {
                key: "insurance_doc_expiry",
                label: "Insurance Expiry",
                value: safeDate(localTruck.insurance_doc_expiry),
                isEditable: true,
              },
              {
                key: "national_permit_doc_expiry",
                label: "National Permit",
                value: safeDate(localTruck.national_permit_doc_expiry),
                isEditable: true,
              },
              {
                key: "state_permit_doc_expiry",
                label: "State Permit",
                value: safeDate(localTruck.state_permit_doc_expiry),
                isEditable: true,
              },
              {
                key: "tax_doc_expiry",
                label: "Tax Validity",
                value: safeDate(localTruck.tax_doc_expiry),
                isEditable: true,
              },
              {
                key: "pollution_doc_expiry",
                label: "Pollution (PUCC)",
                value: safeDate(localTruck.pollution_doc_expiry),
                isEditable: true,
              },
            ]}
          />

          <DetailBlock
            title="Compliance Vault"
            icon={<ShieldCheck size={18} />}
            fields={[]}
            isEditMode={isEditMode}
            childs={
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                <FormInputImage
                  label="Fitness Certificate"
                  id="fitness_doc"
                  name="fitness_doc"
                  isEditMode={isEditMode}
                  value={typeof localTruck.fitness_doc === "string" ? localTruck.fitness_doc : ""}
                  onFileSelect={(file) => {
                    handleFileSelect(file, "fitness_doc");
                    setChangedDocuments((prev) => new Set([...prev, "fitness_doc"]));
                  }}
                  onFileClick={(preview) => setPreviewImg(preview)}
                />
                <FormInputImage
                  label="Insurance Policy"
                  id="insurance_doc"
                  name="insurance_doc"
                  isEditMode={isEditMode}
                  value={typeof localTruck.insurance_doc === "string" ? localTruck.insurance_doc : ""}
                  onFileSelect={(file) => {
                    handleFileSelect(file, "insurance_doc");
                    setChangedDocuments((prev) => new Set([...prev, "insurance_doc"]));
                  }}
                  onFileClick={(preview) => setPreviewImg(preview)}
                />
                <FormInputImage
                  label="National Permit"
                  id="national_permit_doc"
                  name="national_permit_doc"
                  isEditMode={isEditMode}
                  value={typeof localTruck.national_permit_doc === "string" ? localTruck.national_permit_doc : ""}
                  onFileSelect={(file) => {
                    handleFileSelect(file, "national_permit_doc");
                    setChangedDocuments((prev) => new Set([...prev, "national_permit_doc"]));
                  }}
                  onFileClick={(preview) => setPreviewImg(preview)}
                />
                <FormInputImage
                  label="State Permit"
                  id="state_permit_doc"
                  name="state_permit_doc"
                  isEditMode={isEditMode}
                  value={typeof localTruck.state_permit_doc === "string" ? localTruck.state_permit_doc : ""}
                  onFileSelect={(file) => {
                    handleFileSelect(file, "state_permit_doc");
                    setChangedDocuments((prev) => new Set([...prev, "state_permit_doc"]));
                  }}
                  onFileClick={(preview) => setPreviewImg(preview)}
                />
                <FormInputImage
                  label="Road Tax Receipt"
                  id="tax_doc"
                  name="tax_doc"
                  isEditMode={isEditMode}
                  value={typeof localTruck.tax_doc === "string" ? localTruck.tax_doc : ""}
                  onFileSelect={(file) => {
                    handleFileSelect(file, "tax_doc");
                    setChangedDocuments((prev) => new Set([...prev, "tax_doc"]));
                  }}
                  onFileClick={(preview) => setPreviewImg(preview)}
                />
                <FormInputImage
                  label="Pollution (PUC)"
                  id="pollution_doc"
                  name="pollution_doc"
                  isEditMode={isEditMode}
                  value={typeof localTruck.pollution_doc === "string" ? localTruck.pollution_doc : ""}
                  onFileSelect={(file) => {
                    handleFileSelect(file, "pollution_doc");
                    setChangedDocuments((prev) => new Set([...prev, "pollution_doc"]));
                  }}
                  onFileClick={(preview) => setPreviewImg(preview)}
                />
              </div>
            }
          />
        </div>
      </div>

      {previewImg && (
        <Overlay onCancel={() => setPreviewImg("")}>
          <div className="relative group max-w-4xl max-h-[90vh] overflow-hidden rounded-[2.5rem] bg-white p-4 shadow-2xl">
            <img
              src={previewImg}
              alt="Preview Image"
              className="w-full h-full object-contain rounded-3xl"
            />
            <button
              className="absolute top-8 right-8 p-4 bg-indigo-600 text-white rounded-2xl shadow-xl hover:bg-indigo-700 hover:scale-110 active:scale-95 transition-all flex items-center gap-2 font-black uppercase tracking-widest text-[10px]"
              onClick={() => {
                const link = document.createElement("a");
                link.href = previewImg;
                link.download = "truck-document.jpg";
                link.click();
              }}
            >
              <Download size={18} />
              Download High Res
            </button>
          </div>
        </Overlay>
      )}
    </div>
  );
};

export default TruckDetail;
