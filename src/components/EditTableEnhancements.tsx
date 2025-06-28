import { Download, Plus, Redo, Search, Trash2, Undo } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface EditTableEnhancementsProps {
	onDuplicate: () => void;
	onBatchEdit: (field: string, value: string | boolean) => void;
	onUndo: () => void;
	onRedo: () => void;
	onFilterChange: (filter: string) => void;
	onSortChange: (sort: string) => void;
	onSearch: (query: string) => void;
	onClearAll: () => void;
	onExport: (type: "csv" | "pdf" | "xlsx") => void;
}

const EditTableEnhancements: React.FC<EditTableEnhancementsProps> = ({
	onDuplicate,
	onBatchEdit,
	onUndo,
	onRedo,
	onFilterChange,
	onSortChange,
	onSearch,
	onClearAll,
	onExport,
}) => {
	const [searchQuery, setSearchQuery] = React.useState("");
	const [batchEditField, setBatchEditField] = React.useState("");
	const [batchEditValue, setBatchEditValue] = React.useState<string | boolean>(
		"",
	);

	const handleSearch = () => {
		onSearch(searchQuery);
	};

	const handleBatchEdit = () => {
		if (batchEditField && batchEditValue) {
			onBatchEdit(batchEditField, batchEditValue);
		}
	};

	return (
		<div className="space-y-4 p-4 border rounded-lg">
			<div className="flex items-center space-x-2">
				<Input
					placeholder="Поиск..."
					value={searchQuery}
					onChange={(e) => {
						setSearchQuery(e.target.value);
						onSearch(e.target.value);
					}}
				/>
				<Button onClick={handleSearch} size="icon">
					<Search className="h-4 w-4" />
				</Button>
			</div>

			<div className="flex items-center space-x-2">
				<Button onClick={onUndo} variant="outline" size="icon">
					<Undo className="h-4 w-4" />
				</Button>
				<Button onClick={onRedo} variant="outline" size="icon">
					<Redo className="h-4 w-4" />
				</Button>
				<Button onClick={onDuplicate} variant="outline">
					<Plus className="h-4 w-4 mr-2" />
					Дублировать выбранное
				</Button>
				<Button onClick={onClearAll} variant="destructive">
					<Trash2 className="h-4 w-4 mr-2" />
					Очистить все
				</Button>
				<Button onClick={onExport} variant="outline">
					<Download className="h-4 w-4 mr-2" />
					Экспорт
				</Button>
				<Select
					onValueChange={(value) => onExport(value as "csv" | "pdf" | "xlsx")}
				>
					<SelectTrigger className="w-[100px]">
						<SelectValue placeholder="Формат" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="csv">CSV</SelectItem>
						<SelectItem value="pdf">PDF</SelectItem>
						<SelectItem value="xlsx">XLSX</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="flex items-center space-x-2">
				<Select onValueChange={setBatchEditField}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Поле для изменения" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="designType">Дизайн</SelectItem>
						<SelectItem value="hasDiscount">Скидка</SelectItem>
						{/* Add other fields as needed */}
					</SelectContent>
				</Select>
				{batchEditField === "designType" && (
					<Select
						onValueChange={(value) => setBatchEditValue(value)}
						value={batchEditValue as string}
					>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Выберите дизайн" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="default">По умолчанию</SelectItem>
							<SelectItem value="new">Новинка</SelectItem>
							<SelectItem value="sale">Распродажа</SelectItem>
						</SelectContent>
					</Select>
				)}
				{batchEditField === "hasDiscount" && (
					<div className="flex items-center space-x-2">
						<Switch
							checked={batchEditValue as boolean}
							onCheckedChange={(checked) => {
								console.log("Switch checked value:", checked);
								setBatchEditValue(checked);
							}}
						/>
						<span>{batchEditValue ? "Да" : "Нет"}</span>
					</div>
				)}
				<Button onClick={handleBatchEdit}>Применить пакетное изменение</Button>
			</div>

			<div className="flex items-center space-x-2">
				<Select onValueChange={onFilterChange}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Фильтр" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Все</SelectItem>
						<SelectItem value="hasDiscount">Со скидкой</SelectItem>
						<SelectItem value="noDiscount">Без скидки</SelectItem>
						<SelectItem value="defaultDesign">Дизайн по умолчанию</SelectItem>
						<SelectItem value="newDesign">Новый дизайн</SelectItem>
						<SelectItem value="saleDesign">Распродажа дизайн</SelectItem>
					</SelectContent>
				</Select>
				<Select onValueChange={onSortChange}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Сортировка" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="nameAsc">Название (А-Я)</SelectItem>
						<SelectItem value="nameDesc">Название (Я-А)</SelectItem>
						<SelectItem value="priceAsc">Цена (возр.)</SelectItem>
						<SelectItem value="priceDesc">Цена (убыв.)</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</div>
	);
};

export default EditTableEnhancements;
