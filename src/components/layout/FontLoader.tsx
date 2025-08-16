"use client";

import { useEffect } from "react";

// Global font loading state
declare global {
	interface Window {
		__fontsLoaded?: boolean;
		__fontLoadPromise?: Promise<void>;
	}
}

const FontLoader = () => {
	useEffect(() => {
		// Load Google Fonts
		const link = document.createElement("link");
		link.href =
			"https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;900&family=Roboto:wght@300;400;500;700;900&family=Inter:wght@300;400;500;600;700;900&family=Open+Sans:wght@300;400;500;600;700;900&family=Nunito:wght@300;400;500;600;700;900&display=swap";
		link.rel = "stylesheet";
		document.head.appendChild(link);

		// Create a promise that resolves when fonts are loaded
		const fontLoadPromise = new Promise<void>((resolve) => {
			if (document.fonts?.ready) {
				document.fonts.ready.then(() => {
					window.__fontsLoaded = true;
					resolve();
				});
			} else {
				// Fallback for browsers without document.fonts support
				setTimeout(() => {
					window.__fontsLoaded = true;
					resolve();
				}, 1000);
			}
		});

		window.__fontLoadPromise = fontLoadPromise;

		return () => {
			document.head.removeChild(link);
		};
	}, []);

	return null;
};

export default FontLoader;
