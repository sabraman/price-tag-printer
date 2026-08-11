import "server-only";

import type {
	GoogleSheetsConfig,
	GoogleSheetsResponse,
} from "./googleSheetsTypes";

const GOOGLE_VISUALIZATION_RESPONSE_PREFIX =
	"google.visualization.Query.setResponse(";

interface GoogleVisualizationCell {
	v?: string | number;
}

interface GoogleVisualizationColumn {
	id?: string;
	label?: string;
	type?: string;
}

interface GoogleVisualizationResponse {
	table?: {
		cols?: GoogleVisualizationColumn[];
		rows?: Array<{ c?: Array<GoogleVisualizationCell | null> }>;
	};
}

function parseVisualizationResponse(body: string): GoogleVisualizationResponse {
	const prefixIndex = body.indexOf(GOOGLE_VISUALIZATION_RESPONSE_PREFIX);
	const closingIndex = body.lastIndexOf(")");

	if (prefixIndex === -1 || closingIndex <= prefixIndex) {
		throw new Error("Google Sheets returned an invalid response");
	}

	const json = body.slice(
		prefixIndex + GOOGLE_VISUALIZATION_RESPONSE_PREFIX.length,
		closingIndex,
	);

	return JSON.parse(json) as GoogleVisualizationResponse;
}

async function fetchSheet(
	sheetId: string,
	subSheetId: string,
): Promise<GoogleSheetsResponse> {
	const url = new URL(
		`https://docs.google.com/a/google.com/spreadsheets/d/${sheetId}/gviz/tq`,
	);
	url.searchParams.set("tqx", "out:json");
	url.searchParams.set("tq", "");
	url.searchParams.set("gid", subSheetId);

	const response = await fetch(url, {
		headers: { Accept: "application/json" },
		signal: AbortSignal.timeout(10_000),
	});

	if (!response.ok) {
		throw new Error(`Google Sheets returned HTTP ${response.status}`);
	}

	const payload = parseVisualizationResponse(await response.text());
	const columns = payload.table?.cols ?? [];
	const rows = payload.table?.rows ?? [];
	const result: GoogleSheetsResponse = {};

	for (const [columnIndex, column] of columns.entries()) {
		const id = column.id || String(columnIndex);
		result[id] = {
			id,
			label: column.label || id,
			type: column.type || "string",
			rows: {},
		};

		for (const [rowIndex, row] of rows.entries()) {
			result[id].rows[String(rowIndex)] = {
				id: rowIndex,
				data: row.c?.[columnIndex]?.v as string | number,
			};
		}
	}

	return result;
}

/**
 * Fetches public Google Sheets data without pulling a second HTTP client into
 * the server bundle. The response shape remains compatible with the previous
 * JSON_COLUMNS integration.
 */
export async function fetchGoogleSheetsData(
	configs: GoogleSheetsConfig[],
): Promise<GoogleSheetsResponse> {
	try {
		const results = await Promise.all(
			configs.map(async (config) => {
				const subSheetIds =
					config.subSheetsIds.length > 0 ? config.subSheetsIds : ["0"];
				const sheets = await Promise.all(
					subSheetIds.map((subSheetId) =>
						fetchSheet(config.sheetId, subSheetId),
					),
				);

				if (sheets.length === 1) {
					return sheets[0];
				}

				return Object.fromEntries(
					subSheetIds.map((subSheetId, index) => [subSheetId, sheets[index]]),
				);
			}),
		);

		if (results.length === 1) {
			return results[0] as GoogleSheetsResponse;
		}

		return Object.fromEntries(
			configs.map((config, index) => [config.sheetId, results[index]]),
		) as unknown as GoogleSheetsResponse;
	} catch (error) {
		throw new Error(
			`Failed to fetch Google Sheets data: ${
				error instanceof Error ? error.message : "Unknown error"
			}. Make sure the Google Sheet is published to the web or publicly accessible.`,
			{ cause: error },
		);
	}
}

/**
 * Extracts sheet ID from a Google Sheets URL.
 */
export function extractSheetIdFromUrl(url: string): string {
	const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
	return match ? match[1] : "";
}

/**
 * Extracts GID (sheet tab ID) from a Google Sheets URL.
 */
export function extractGidFromUrl(url: string): string {
	const match = url.match(/[#&]gid=([0-9]+)/);
	return match ? match[1] : "0";
}
