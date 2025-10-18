import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Build a safe date-time stamp for filenames: YYYY-MM-DD_HH-mm-ss
function buildDateTimeStamp(): string {
	const d = new Date();
	const pad = (n: number) => n.toString().padStart(2, "0");
	const yyyy = d.getFullYear();
	const mm = pad(d.getMonth() + 1);
	const dd = pad(d.getDate());
	const hh = pad(d.getHours());
	const mi = pad(d.getMinutes());
	const ss = pad(d.getSeconds());
	return `${yyyy}-${mm}-${dd}_${hh}-${mi}-${ss}`;
}

// Returns a standardized filename like: "pricetags-YYYY-MM-DD_HH-mm-ss.pdf"
export function buildPriceTagsFilename(ext: "pdf" | "html" = "pdf"): string {
	const stamp = buildDateTimeStamp();
	return `pricetags-${stamp}.${ext}`;
}
