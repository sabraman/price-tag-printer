import { UploadIcon } from "lucide-react";
import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import type { DropEvent, DropzoneOptions, FileRejection } from "react-dropzone";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DropzoneContextType = {
	src?: File[];
	accept?: DropzoneOptions["accept"];
	maxSize?: DropzoneOptions["maxSize"];
	minSize?: DropzoneOptions["minSize"];
	maxFiles?: DropzoneOptions["maxFiles"];
};

const renderBytes = (bytes: number) => {
	const units = ["B", "KB", "MB", "GB", "TB", "PB"];
	let size = bytes;
	let unitIndex = 0;

	while (size >= 1024 && unitIndex < units.length - 1) {
		size /= 1024;
		unitIndex++;
	}

	return `${size.toFixed(2)}${units[unitIndex]}`;
};

const DropzoneContext = createContext<DropzoneContextType | undefined>(
	undefined,
);

export type DropzoneProps = Omit<DropzoneOptions, "onDrop"> & {
	src?: File[];
	className?: string;
	onDrop?: (
		acceptedFiles: File[],
		fileRejections: FileRejection[],
		event: DropEvent,
	) => void;
	children?: ReactNode;
};

export const Dropzone = ({
	accept,
	maxFiles = 1,
	maxSize,
	minSize,
	onDrop,
	onError,
	disabled,
	src,
	className,
	children,
	...props
}: DropzoneProps) => {
	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		accept,
		maxFiles,
		maxSize,
		minSize,
		onError,
		disabled,
		onDrop: (acceptedFiles, fileRejections, event) => {
			if (fileRejections.length > 0) {
				const message = fileRejections.at(0)?.errors.at(0)?.message;
				onError?.(new Error(message));
				return;
			}

			onDrop?.(acceptedFiles, fileRejections, event);
		},
		...props,
	});

	return (
		<DropzoneContext.Provider
			key={JSON.stringify(src)}
			value={{ src, accept, maxSize, minSize, maxFiles }}
		>
			<Button
				type="button"
				disabled={disabled}
				variant="outline"
				className={cn(
					"relative h-auto w-full flex-col overflow-hidden p-8",
					isDragActive && "outline-none ring-1 ring-ring",
					className,
				)}
				{...getRootProps()}
			>
				<input {...getInputProps()} disabled={disabled} />
				{children}
			</Button>
		</DropzoneContext.Provider>
	);
};

const useDropzoneContext = () => {
	const context = useContext(DropzoneContext);

	if (!context) {
		throw new Error("useDropzoneContext must be used within a Dropzone");
	}

	return context;
};

export type DropzoneContentProps = {
	children?: ReactNode;
};

const maxLabelItems = 3;

export const DropzoneContent = ({ children }: DropzoneContentProps) => {
	const { src } = useDropzoneContext();

	if (!src) {
		return null;
	}

	if (children) {
		return children;
	}

	return (
		<>
			<div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
				<UploadIcon size={16} />
			</div>
			<p className="my-2 w-full truncate font-medium text-sm">
				{src.length > maxLabelItems
					? `${src
							.slice(0, maxLabelItems)
							.map((file) => file.name)
							.join(", ")} и ещё ${src.length - maxLabelItems}`
					: src.map((file) => file.name).join(", ")}
			</p>
			<p className="w-full text-muted-foreground text-xs">
				Перетащите файл или нажмите для замены
			</p>
		</>
	);
};

export type DropzoneEmptyStateProps = {
	children?: ReactNode;
};

export const DropzoneEmptyState = ({ children }: DropzoneEmptyStateProps) => {
	const { src, accept, maxSize, minSize, maxFiles } = useDropzoneContext();

	if (src) {
		return null;
	}

	if (children) {
		return children;
	}

	let caption = "";

	if (accept) {
		caption += "Принимает ";
		caption += Object.keys(accept).join(", ");
	}

	if (minSize && maxSize) {
		caption += ` размером от ${renderBytes(minSize)} до ${renderBytes(maxSize)}`;
	} else if (minSize) {
		caption += ` не менее ${renderBytes(minSize)}`;
	} else if (maxSize) {
		caption += ` не более ${renderBytes(maxSize)}`;
	}

	return (
		<>
			<div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
				<UploadIcon size={16} />
			</div>
			<p className="my-2 w-full truncate font-medium text-sm">
				Загрузить {maxFiles === 1 ? "файл" : "файлы"}
			</p>
			<p className="w-full truncate text-muted-foreground text-xs">
				Перетащите или нажмите для загрузки
			</p>
			{caption && <p className="text-muted-foreground text-xs">{caption}.</p>}
		</>
	);
};
