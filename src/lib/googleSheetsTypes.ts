export interface GoogleSheetsConfig {
	sheetId: string;
	subSheetsIds: string[];
}

export interface GoogleSheetsColumn {
	id: string;
	label: string;
	type: string;
	rows: {
		[rowKey: string]: { id: number; data: string | number };
	};
}

export interface GoogleSheetsResponse {
	[columnKey: string]: GoogleSheetsColumn;
}
