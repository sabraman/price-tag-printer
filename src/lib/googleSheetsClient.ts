import type {
	GoogleSheetsConfig,
	GoogleSheetsResponse,
} from "./googleSheetsTypes";

interface GoogleSheetsApiResponse {
	success?: boolean;
	data?: GoogleSheetsResponse;
	error?: string;
}

/**
 * Fetches Google Sheets data through the server API.
 *
 * The Google Sheets integration is server-only, so browser components must
 * call the API boundary instead of importing it directly.
 */
export async function fetchGoogleSheetsData(
	configs: GoogleSheetsConfig[],
): Promise<GoogleSheetsResponse> {
	const response = await fetch("/api/import/google-sheets/data", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ configs }),
	});

	let payload: GoogleSheetsApiResponse;
	try {
		payload = (await response.json()) as GoogleSheetsApiResponse;
	} catch (error) {
		throw new Error(
			`Google Sheets API returned an invalid response (${response.status})`,
			{ cause: error },
		);
	}

	if (!response.ok || !payload.success || !payload.data) {
		throw new Error(
			payload.error ||
				`Google Sheets request failed with status ${response.status}`,
		);
	}

	return payload.data;
}
