import { useCallback, useEffect, useRef, useState } from "react";

interface FontSizeAdjustmentOptions {
	elementId: string;
	initialFontSize?: number;
	minFontSize?: number;
	adjustmentStep?: number;
	maxIterations?: number;
	persistToStorage?: boolean; // New option to enable persistence
	waitForFonts?: boolean; // New option to wait for fonts to load
	debug?: boolean; // New option for debug logging
}

/**
 * Optimized hook for font size adjustment that avoids recursive setTimeout calls
 * Now supports localStorage persistence for calculated font sizes and waits for fonts to load
 */
export const useFontSizeAdjustment = ({
	elementId,
	initialFontSize = 16,
	minFontSize = 4,
	adjustmentStep = 0.5,
	maxIterations = 46,
	persistToStorage = true, // Default to true for persistence
	waitForFonts = true, // Default to true for better accuracy
	debug = false, // Default to false for no debug logging
}: FontSizeAdjustmentOptions) => {
	const [fontSize, setFontSize] = useState(initialFontSize);
	const [isReady, setIsReady] = useState(false);
	const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
	const iterationCountRef = useRef(0);
	const elementRef = useRef<HTMLElement | null>(null);

	// Load persisted font size on mount
	useEffect(() => {
		if (persistToStorage && typeof window !== "undefined") {
			const storageKey = `font-size-${elementId}`;
			const savedFontSize = localStorage.getItem(storageKey);
			if (savedFontSize) {
				const parsedSize = parseFloat(savedFontSize);
				if (
					!Number.isNaN(parsedSize) &&
					parsedSize >= minFontSize &&
					parsedSize <= initialFontSize
				) {
					setFontSize(parsedSize);
					// Apply the saved font size to the element if it exists
					const element = document.getElementById(elementId);
					if (element) {
						element.style.fontSize = `${parsedSize}px`;
						elementRef.current = element;
					}
				}
			}
		}
	}, [elementId, initialFontSize, minFontSize, persistToStorage]);

	// Wait for fonts to load and DOM to be ready
	useEffect(() => {
		if (!waitForFonts) {
			setIsReady(true);
			return;
		}

		const checkReadiness = async () => {
			if (debug)
				console.log(`[FontAdjust] ${elementId}: Checking readiness...`);

			// Wait for global fonts to load first
			if (window.__fontLoadPromise) {
				if (debug)
					console.log(`[FontAdjust] ${elementId}: Waiting for global fonts...`);
				await window.__fontLoadPromise;
			} else if (document.fonts?.ready) {
				if (debug)
					console.log(
						`[FontAdjust] ${elementId}: Waiting for document fonts...`,
					);
				await document.fonts.ready;
			}

			// Wait for the element to exist and be rendered
			const waitForElement = (): Promise<HTMLElement> => {
				return new Promise((resolve) => {
					const element = document.getElementById(elementId);
					if (element && element.offsetHeight > 0) {
						if (debug)
							console.log(
								`[FontAdjust] ${elementId}: Element ready immediately`,
							);
						resolve(element);
					} else {
						if (debug)
							console.log(
								`[FontAdjust] ${elementId}: Waiting for element to render...`,
							);
						// Use ResizeObserver to detect when element is properly rendered
						const observer = new ResizeObserver((entries) => {
							if (entries[0]?.contentRect.height > 0) {
								if (debug)
									console.log(
										`[FontAdjust] ${elementId}: Element rendered via ResizeObserver`,
									);
								observer.disconnect();
								resolve(entries[0].target as HTMLElement);
							}
						});

						if (element) {
							observer.observe(element);
						}

						// Fallback timeout
						setTimeout(() => {
							observer.disconnect();
							const fallbackElement = document.getElementById(elementId);
							if (fallbackElement) {
								if (debug)
									console.log(
										`[FontAdjust] ${elementId}: Element ready via fallback timeout`,
									);
								resolve(fallbackElement);
							}
						}, 500);
					}
				});
			};

			try {
				const element = await waitForElement();
				elementRef.current = element;

				if (debug)
					console.log(
						`[FontAdjust] ${elementId}: Element acquired, waiting for CSS...`,
					);

				// Wait a bit more for any CSS transitions or animations to complete
				await new Promise((resolve) => setTimeout(resolve, 100));

				// Force a reflow to ensure accurate measurements
				element.offsetHeight;

				if (debug)
					console.log(`[FontAdjust] ${elementId}: Ready for font adjustment`);
				setIsReady(true);
			} catch (error) {
				if (debug)
					console.log(`[FontAdjust] ${elementId}: Error, retrying...`, error);
				// If element doesn't exist yet, wait a bit and try again
				setTimeout(checkReadiness, 100);
			}
		};

		checkReadiness();
	}, [elementId, waitForFonts, debug]);

	// Save font size to localStorage
	const saveFontSize = useCallback(
		(size: number) => {
			if (persistToStorage && typeof window !== "undefined") {
				const storageKey = `font-size-${elementId}`;
				localStorage.setItem(storageKey, size.toString());
			}
		},
		[elementId, persistToStorage],
	);

	const adjustFontSize = useCallback(() => {
		if (!isReady) {
			if (debug)
				console.log(
					`[FontAdjust] ${elementId}: Not ready, scheduling retry...`,
				);
			// If not ready, schedule adjustment for later
			setTimeout(() => adjustFontSize(), 100);
			return;
		}

		const element = elementRef.current || document.getElementById(elementId);
		if (!element) {
			if (debug) console.log(`[FontAdjust] ${elementId}: Element not found`);
			return;
		}

		if (debug)
			console.log(`[FontAdjust] ${elementId}: Starting font adjustment`);

		// Reset iteration counter for new adjustment cycle
		iterationCountRef.current = 0;

		// Start with initial font size
		element.style.fontSize = `${initialFontSize}px`;
		setFontSize(initialFontSize);

		const performAdjustment = () => {
			if (iterationCountRef.current >= maxIterations) {
				if (debug)
					console.log(
						`[FontAdjust] ${elementId}: Max iterations reached, scheduling retry...`,
					);
				// If we hit max iterations, schedule a retry to ensure we didn't miss anything
				setTimeout(() => {
					const finalCheck = () => {
						const currentStyle = window.getComputedStyle(element);
						const currentSize = parseFloat(currentStyle.fontSize);
						const isStillOverflown = element.scrollWidth > element.clientWidth;

						if (isStillOverflown && currentSize > minFontSize) {
							if (debug)
								console.log(
									`[FontAdjust] ${elementId}: Still overflowing, continuing adjustment...`,
								);
							// Continue adjusting if still overflowing
							iterationCountRef.current = 0; // Reset counter for retry
							performAdjustment();
						} else {
							if (debug)
								console.log(
									`[FontAdjust] ${elementId}: Font adjustment completed successfully`,
								);
						}
					};

					// Wait a bit more for any final layout changes
					setTimeout(finalCheck, 200);
				}, 100);
				return;
			}

			// Force a reflow to ensure accurate measurements
			element.offsetHeight;

			// Get current font size from the element
			const computedStyle = window.getComputedStyle(element);
			const currentFontSize = parseFloat(computedStyle.fontSize);

			// Check for horizontal overflow (text width exceeding container width)
			const isOverflown = element.scrollWidth > element.clientWidth;

			if (debug && iterationCountRef.current % 5 === 0) {
				console.log(
					`[FontAdjust] ${elementId}: Iteration ${iterationCountRef.current}, size: ${currentFontSize}, overflow: ${isOverflown}`,
				);
			}

			if (isOverflown && currentFontSize > minFontSize) {
				const newSize = Math.max(currentFontSize - adjustmentStep, minFontSize);

				// Apply the new font size directly to the element
				element.style.fontSize = `${newSize}px`;

				// Update React state
				setFontSize(newSize);

				// Save to localStorage
				saveFontSize(newSize);

				iterationCountRef.current++;

				// Continue adjusting if still above minimum and might still be overflowing
				if (newSize > minFontSize) {
					// Force a reflow to ensure accurate measurements for next iteration
					void element.offsetWidth;
					// Use requestAnimationFrame for better performance and to ensure DOM updates
					requestAnimationFrame(() => performAdjustment());
				}
			} else if (!isOverflown) {
				// Save the current font size if it fits properly
				saveFontSize(currentFontSize);
				if (debug)
					console.log(
						`[FontAdjust] ${elementId}: Font adjustment completed at size ${currentFontSize}`,
					);
			}
		};

		// Start adjustment with a small delay to ensure DOM is stable
		setTimeout(() => performAdjustment(), 10);
	}, [
		elementId,
		initialFontSize,
		minFontSize,
		adjustmentStep,
		maxIterations,
		saveFontSize,
		isReady,
		debug,
	]);

	// Reset font size when elementId changes
	const resetFontSize = useCallback(() => {
		setFontSize(initialFontSize);
		iterationCountRef.current = 0;
		// Clear persisted font size
		if (persistToStorage && typeof window !== "undefined") {
			const storageKey = `font-size-${elementId}`;
			localStorage.removeItem(storageKey);
		}
	}, [initialFontSize, elementId, persistToStorage]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	return {
		fontSize,
		adjustFontSize,
		resetFontSize,
		isAdjusting: iterationCountRef.current > 0,
		isReady, // New property to indicate if the hook is ready
	};
};
