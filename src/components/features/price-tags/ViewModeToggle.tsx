import { Edit2, Eye } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";

interface ViewModeToggleProps {
	isEditMode: boolean;
	onToggle: (editMode: boolean) => void;
	itemsCount: number;
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
	isEditMode,
	onToggle,
	itemsCount,
}) => {
	return (
		<div className="flex items-center gap-4">
			<div className="flex bg-muted rounded-lg p-1">
				<Button
					variant={!isEditMode ? "default" : "ghost"}
					size="sm"
					onClick={() => onToggle(false)}
					className="flex items-center gap-2"
				>
					<Eye className="h-4 w-4" />
					Просмотр
				</Button>
				<Button
					variant={isEditMode ? "default" : "ghost"}
					size="sm"
					onClick={() => onToggle(true)}
					className="flex items-center gap-2"
				>
					<Edit2 className="h-4 w-4" />
					Редактирование
				</Button>
			</div>
			
			<div className="text-sm text-muted-foreground">
				{itemsCount > 0 ? (
					<>Элементов: <span className="font-medium">{itemsCount}</span></>
				) : (
					"Нет элементов для отображения"
				)}
			</div>
		</div>
	);
};