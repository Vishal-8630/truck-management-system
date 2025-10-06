import handleExportToExcel from "../../utils/exportToExcel";
import styles from './ExcelButton.module.scss';

interface ExcelButtonProps {
  data: any[];
  fileNamePrefix: string;
}

const ExcelButton: React.FC<ExcelButtonProps> = ({ data, fileNamePrefix }) => {
  return (
    <div className={styles.excelBtnWrapper}>
      <button
        className={styles.excelBtn}
        onClick={() =>
          handleExportToExcel({
            data: data,
            fileNamePrefix: fileNamePrefix,
          })
        }
      >
        Download Excel
      </button>
    </div>
  );
};

export default ExcelButton;
