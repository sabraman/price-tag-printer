export interface BrowserInfo {
	name: string;
	isChromium: boolean;
	isMobile: boolean;
	supportsNativePrint: boolean;
	recommendedMethod: "browser" | "pdf";
	version?: string;
}

export function detectBrowser(): BrowserInfo {
	// Server-side fallback
	if (typeof window === "undefined") {
		return {
			name: "Unknown",
			isChromium: false,
			isMobile: false,
			supportsNativePrint: false,
			recommendedMethod: "pdf",
		};
	}

	const userAgent = navigator.userAgent.toLowerCase();
	const isMobile =
		/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
			userAgent,
		);

	// Detect browser types
	const isChrome =
		/chrome/.test(userAgent) &&
		!/edg/.test(userAgent) &&
		!/opr/.test(userAgent);
	const isEdge = /edg/.test(userAgent);
	const isOpera = /opr/.test(userAgent);
	const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
	const isFirefox = /firefox/.test(userAgent);

	// Chromium-based browsers generally have better print support
	const isChromium = isChrome || isEdge || isOpera;

	let browserName = "Unknown";
	if (isChrome) browserName = "Chrome";
	else if (isEdge) browserName = "Edge";
	else if (isOpera) browserName = "Opera";
	else if (isSafari) browserName = "Safari";
	else if (isFirefox) browserName = "Firefox";

	// Desktop browsers (Chrome, Edge, Opera, Safari, Firefox) support native print, mobile gets PDF
	const supportsNativePrint =
		!isMobile && (isChromium || isSafari || isFirefox);
	const recommendedMethod: "browser" | "pdf" = supportsNativePrint
		? "browser"
		: "pdf";

	return {
		name: browserName,
		isChromium,
		isMobile,
		supportsNativePrint,
		recommendedMethod,
	};
}

export function getBrowserWarningMessage(
	browserInfo: BrowserInfo,
): string | null {
	if (browserInfo.supportsNativePrint) {
		return null; // No warning needed
	}

	if (browserInfo.isMobile) {
		return "Мобильные браузеры будут генерировать PDF для загрузки. Для лучшего качества печати используйте Chrome или Edge на компьютере.";
	}

	return "Ваш браузер будет генерировать PDF файл для загрузки. Для оптимального опыта печати используйте Chrome или Edge.";
}
