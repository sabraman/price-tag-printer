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
	minFontSize = 8,
	adjustmentStep = 0.5,
	maxIterations = 30,
	debounceMs = 100,
}: FontSizeAdjustmentOptions) => {
	const [fontSize, setFontSize] = useState(initialFontSize);
	const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
	const iterationCountRef = useRef(0);

	const adjustFontSize = useCallback(() => {
		// Clear any pending adjustment
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		timeoutRef.current = setTimeout(() => {
			const element = document.getElementById(elementId);

			if (!element) {
				return;
			}

			// Reset iteration counter for new adjustment cycle
			iterationCountRef.current = 0;

			const performAdjustment = () => {
				if (iterationCountRef.current >= maxIterations) {
					return;
				}

				const isOverflown = element.scrollHeight > element.clientHeight;

				if (isOverflown) {
					setFontSize((current) => {
						const newSize = Math.max(current - adjustmentStep, minFontSize);

						if (newSize > minFontSize) {
							iterationCountRef.current++;
							// Use requestAnimationFrame for better performance
							requestAnimationFrame(performAdjustment);
						}

						return newSize;
					});
				}
			};

			// Use requestAnimationFrame for smoother updates
			requestAnimationFrame(performAdjustment);
		}, debounceMs);
	}, [elementId, minFontSize, adjustmentStep, maxIterations, debounceMs]);

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
