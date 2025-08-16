"use client";

import { Camera } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ScreenshotTestButton() {
	const [isGenerating, setIsGenerating] = useState(false);

	const handleScreenshot = async () => {
		setIsGenerating(true);
		try {
			// Test the screenshot API with the current page
			const currentUrl = window.location.href;
			const response = await fetch(
				`/api/screenshot?url=${encodeURIComponent(currentUrl)}`,
			);

			if (!response.ok) {
				throw new Error(`Screenshot failed: ${response.statusText}`);
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.style.display = "none";
			a.href = url;
			a.download = "screenshot-test.png";
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);

			console.log("✅ Screenshot test successful!");
		} catch (error) {
			console.error("❌ Screenshot test failed:", error);
			alert(
				`Screenshot test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<Button
			onClick={handleScreenshot}
			disabled={isGenerating}
			variant="outline"
			size="sm"
			className="gap-2"
		>
			<Camera className="h-4 w-4" />
			{isGenerating ? "Taking Screenshot..." : "Test Screenshot API"}
		</Button>
	);
}
