declare module "xlsx/xlsx.mjs" {
  export interface WorkBook {
    SheetNames: string[];
    Sheets: { [key: string]: WorkSheet };
  }

  export interface WorkSheet {
    [key: string]: any;
  }

  export interface Range {
    s: { c: number; r: number };
    e: { c: number; r: number };
  }

  export interface AOAOpts {
    origin?: string | number | { r: number; c: number };
    dateNF?: string;
  }

  export function read(filename: string, opts?: any): WorkBook;
  export const utils: {
    sheet_to_json<T>(worksheet: WorkSheet, opts?: any): T[];
    json_to_sheet<T>(data: T[], opts?: any): WorkSheet;
    book_new(): WorkBook;
    book_append_sheet(
      workbook: WorkBook,
      worksheet: WorkSheet,
      name: string
    ): void;
    sheet_add_aoa(
      worksheet: WorkSheet,
      data: any[][],
      opts?: AOAOpts
    ): WorkSheet;
  };
  export function writeFile(workbook: WorkBook, filename: string): void;
}
