import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

interface UsePrintTagsOptions {
  documentTitle?: string;
  onError?: (error: Error) => void;
}

export const usePrintTags = ({ onError }: UsePrintTagsOptions = {}) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    onPrintError: (errorLocation: "onBeforePrint" | "print", error: Error) => {
      console.error(`Print failed at ${errorLocation}:`, error);
      onError?.(error);
    },
    pageStyle: `
      @page {
        size: A4 portrait;
        margin-top: 45px;
        margin-bottom: 45px;
        margin-left: 36px;
        margin-right: 36px;
      }
      @media print {
        html, body {
          height: 100vh !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          -webkit-print-color-adjust: exact;
        }
        .print-content {
          display: flex !important;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          width: 100%;
        }
        .price-tags {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          gap: 0;
          width: fit-content;
          margin: auto;
          transform: scale(1.4); // 140% or 1.4x original size (513px becomes 718.2px)
          transform-origin: center center;
        }
      }
    `,
  });

  return {
    componentRef,
    handlePrint,
  };
};
