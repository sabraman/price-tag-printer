// Google Sheets API integration using google-sheets-data-fetcher package
import { fetchGoogleSheetsData as originalFetchGoogleSheetsData } from "google-sheets-data-fetcher";

interface GoogleSheetsConfig {
	sheetId: string;
	subSheetsIds: string[];
}

interface GoogleSheetsResponse {
	[columnKey: string]: {
		id: string;
		label: string;
		type: string;
		rows: {
			[rowKey: string]: { id: number; data: string | number };
		};
	};
}

/**
 * Fetches data from Google Sheets using the reliable google-sheets-data-fetcher package
 * @param configs Array of sheet configurations
 * @returns Promise resolving to Google Sheets data in the expected format
 */
export async function fetchGoogleSheetsData(
	configs: GoogleSheetsConfig[],
): Promise<GoogleSheetsResponse> {
	try {
		console.log("Fetching Google Sheets data with configs:", configs);

		// Use the google-sheets-data-fetcher package
		const result = await originalFetchGoogleSheetsData(
			configs,
			["JSON_COLUMNS"], // Use JSON_COLUMNS format which is what we expect
		);

		console.log("Raw Google Sheets data received:", result);

		// The package returns the data directly in the format we expect
		// No need for conversion as it should already be in the correct format
		return result as GoogleSheetsResponse;
	} catch (error) {
		console.error("Error fetching Google Sheets data:", error);
		throw new Error(
			`Failed to fetch Google Sheets data: ${
				error instanceof Error ? error.message : "Unknown error"
			}. Make sure the Google Sheet is published to the web or publicly accessible.`,
		);
	}
}

/**
 * Extracts sheet ID from a Google Sheets URL
 * @param url Google Sheets URL
 * @returns Sheet ID string
 */
export function extractSheetIdFromUrl(url: string): string {
	const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
	return match ? match[1] : "";
}

/**
 * Extracts GID (sheet tab ID) from a Google Sheets URL
 * @param url Google Sheets URL
 * @returns GID string or '0' as default
 */
export function extractGidFromUrl(url: string): string {
	const match = url.match(/[#&]gid=([0-9]+)/);
	return match ? match[1] : "0";
}
