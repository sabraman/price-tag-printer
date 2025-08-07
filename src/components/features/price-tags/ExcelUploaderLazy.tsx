import { Suspense, lazy } from "react";
import type { WorkBook } from "xlsx";
import { Skeleton } from "@/components/ui/skeleton";

const ExcelUploader = lazy(() => import("./ExcelUploader"));

interface ExcelUploaderLazyProps {
	onUpload: (data: WorkBook) => void;
}

const LoadingSkeleton = () => (
	<div className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg">
		<div className="flex flex-col items-center gap-2">
			<Skeleton className="h-8 w-8" />
			<Skeleton className="h-4 w-48" />
			<Skeleton className="h-4 w-32" />
		</div>
	</div>
);

export const ExcelUploaderLazy: React.FC<ExcelUploaderLazyProps> = ({ onUpload }) => {
	return (
		<Suspense fallback={<LoadingSkeleton />}>
			<ExcelUploader onUpload={onUpload} />
		</Suspense>
	);
};

export default ExcelUploaderLazy;