import { useCallback, useEffect, useRef, useState } from "react";

interface FontSizeAdjustmentOptions {
	elementId: string;
	initialFontSize?: number;
	minFontSize?: number;
	adjustmentStep?: number;
	maxIterations?: number;
	debounceMs?: number;
}

/**
 * Optimized hook for font size adjustment that avoids recursive setTimeout calls
 */
export const useFontSizeAdjustment = ({
	elementId,
	initialFontSize = 16,
	minFontSize = 4,
	adjustmentStep = 0.5,
	maxIterations = 30,
	debounceMs: _debounceMs = 0, // No debounce for instant response
}: FontSizeAdjustmentOptions) => {
	const [fontSize, setFontSize] = useState(initialFontSize);
	const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
	const iterationCountRef = useRef(0);

	const adjustFontSize = useCallback(() => {
		const element = document.getElementById(elementId);

		if (!element) {
			return;
		}

		// Reset iteration counter for new adjustment cycle
		iterationCountRef.current = 0;

		// Start with initial font size
		element.style.fontSize = `${initialFontSize}px`;
		setFontSize(initialFontSize);

		const performAdjustment = () => {
			if (iterationCountRef.current >= maxIterations) {
				return;
			}

			// Force a reflow to ensure accurate measurements
			element.offsetWidth;

			// Check for horizontal overflow (text width exceeding container width)
			const isOverflown = element.scrollWidth > element.clientWidth;

			if (isOverflown) {
				// Get current font size from the element
				const computedStyle = window.getComputedStyle(element);
				const currentFontSize = parseFloat(computedStyle.fontSize);

				if (currentFontSize > minFontSize) {
					const newSize = Math.max(
						currentFontSize - adjustmentStep,
						minFontSize,
					);

					// Apply the new font size directly to the element
					element.style.fontSize = `${newSize}px`;

					// Update React state
					setFontSize(newSize);

					iterationCountRef.current++;

					// Continue checking regardless of font size - keep going until no overflow
					performAdjustment();
				}
			}
		};

		// Start adjustment immediately
		performAdjustment();
	}, [elementId, initialFontSize, minFontSize, adjustmentStep, maxIterations]);

	// Reset font size when elementId changes
	const resetFontSize = useCallback(() => {
		setFontSize(initialFontSize);
		iterationCountRef.current = 0;
	}, [initialFontSize]);

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
	};
};
