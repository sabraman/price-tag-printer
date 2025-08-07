import { Suspense, lazy } from "react";
import type { Item, ThemeSet } from "@/store/priceTagsStore";
import { Skeleton } from "@/components/ui/skeleton";

const PDFGenerator = lazy(() => 
	import("./PDFGenerator").then(module => ({ default: module.PDFGenerator }))
);

interface PDFGeneratorLazyProps {
	items: Item[];
	themes: ThemeSet;
	currentFont: string;
	discountText: string;
	design: boolean;
	designType: string;
	onGenerateStart?: () => void;
	onGenerateComplete?: () => void;
	onError?: (error: string) => void;
}

const LoadingSkeleton = () => (
	<div className="flex items-center gap-2">
		<Skeleton className="h-9 w-32" />
		<Skeleton className="h-4 w-24" />
	</div>
);

export const PDFGeneratorLazy: React.FC<PDFGeneratorLazyProps> = (props) => {
	return (
		<Suspense fallback={<LoadingSkeleton />}>
			<PDFGenerator {...props} />
		</Suspense>
	);
};