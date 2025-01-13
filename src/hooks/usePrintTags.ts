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
        margin: 0;
        }
        
        @media print {
          html, body {
          height: 100%;
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact;
          }
          
          .print-page {
            break-inside: avoid;
            page-break-after: always;
            margin: 0;
            padding-top: 36px;
            height: 100%;
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            align-items: center;
            justify-items: center;
            justify-content: center;
          transform: scale(1.4);
          transform-origin: top center;
        }
        
        .price-tag {
          margin: 0;
        }
        
        .print-page:last-child {
          page-break-after: auto;
        }
      }
    `,
  });

  return {
    componentRef,
    handlePrint,
  };
};
