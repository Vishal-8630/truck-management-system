import handleExportToExcel from "@/utils/exportToExcel";
import { Download } from "lucide-react";

interface ExcelButtonProps {
  data: any[];
  fileNamePrefix: string;
}

const ExcelButton: React.FC<ExcelButtonProps> = ({ data, fileNamePrefix }) => {
  return (
    <button
      onClick={() =>
        handleExportToExcel({
          data: data,
          fileNamePrefix: fileNamePrefix,
        })
      }
      className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold font-heading shadow-lg shadow-emerald-100 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all active:translate-y-0"
    >
      <Download size={18} />
      Export Excel
    </button>
  );
};

export default ExcelButton;
