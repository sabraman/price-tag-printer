import type React from "react";
import { useDropzone } from "react-dropzone";
import { read, type WorkBook } from "xlsx";

interface ExcelUploaderProps {
  onUpload: (data: WorkBook) => void;
}

const ExcelUploader: React.FC<ExcelUploaderProps> = ({ onUpload }) => {
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = read(
            new Uint8Array((e.target as FileReader).result as ArrayBuffer),
            {
              type: "array",
            }
          ) as WorkBook;
          onUpload(data);
        } catch (error) {
          console.error("Error reading Excel file:", error);
        }
      };

      reader.readAsArrayBuffer(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
        ".xls",
      ], // Accept Excel files only
    }, // Accept string with comma-separated file types
  });

  return (
    <div className="mb-4">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? "active" : ""}`}
        style={{
          border: "2px dashed #ccc", // Dashed border style
          borderRadius: "4px", // Optional: Add some border-radius
          padding: "20px",
          cursor: "pointer", // Change cursor to pointer when hovering
        }}
      >
        <input {...getInputProps()} />
        <p>Перетащите Excel файл сюда или кликни, чтобы выбрать</p>
      </div>
    </div>
  );
};

export default ExcelUploader;
