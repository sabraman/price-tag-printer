import {
	AlertCircle,
	CheckSquare,
	Copy,
	MoreHorizontal,
	Plus,
	Redo,
	Search,
	Square,
	Trash2,
	Undo,
	Zap,
} from "lucide-react";
import React, {
	memo,
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Item } from "@/store/priceTagsStore";
import { usePriceTagsStore } from "@/store/priceTagsStore";

interface OptimizedEditTableProps {
	items: Item[];
	selectedItems: number[];
	onSelectionChange: (
		selectedIds: number[] | ((prev: number[]) => number[]),
	) => void;
	onDuplicate: () => void;
	onUndo: () => void;
	onRedo: () => void;
	onFilterChange: (filter: string) => void;
	onSortChange: (sort: string) => void;
	onSearch: (query: string) => void;
	onClearAll: () => void;
	onExport: (type: "csv" | "pdf" | "xlsx") => void;
}

// Auto-saving new item form component with better state management
const NewItemForm = memo<{
	onAdd: (item: Omit<Item, "id" | "discountPrice">) => void;
	isLoading: boolean;
	inputRef: React.RefObject<HTMLInputElement | null>;
}>(({ onAdd, isLoading, inputRef }) => {
	const [newItem, setNewItem] = useState({
		data: "",
		price: "",
		designType: "default",
		hasDiscount: false,
		priceFor2: "",
		priceFrom3: "",
	});

	// Auto-save draft to localStorage
	useLayoutEffect(() => {
		const timeoutId = setTimeout(() => {
			if (newItem.data.trim() || newItem.price) {
				localStorage.setItem("newPriceTagDraft", JSON.stringify(newItem));
			} else {
				localStorage.removeItem("newPriceTagDraft");
			}
		}, 500);

		return () => clearTimeout(timeoutId);
	}, [newItem]);

	// Restore draft on mount
	useLayoutEffect(() => {
		try {
			const savedDraft = localStorage.getItem("newPriceTagDraft");
			if (savedDraft) {
				const draft = JSON.parse(savedDraft);
				setNewItem(draft);
				toast.info("Восстановлен черновик товара", { duration: 2000 });
			}
		} catch {
			localStorage.removeItem("newPriceTagDraft");
		}
	}, []);

	const handleAdd = useCallback(() => {
		if (!newItem.data.trim()) {
			toast.error("Введите название товара");
			inputRef.current?.focus();
			return;
		}
		if (!newItem.price || Number(newItem.price) <= 0) {
			toast.error("Введите корректную цену");
			return;
		}

		const itemToAdd = {
			data: newItem.data.trim(),
			price: Number(newItem.price),
			designType:
				newItem.designType === "default" ? undefined : newItem.designType,
			hasDiscount: newItem.hasDiscount,
			priceFor2: newItem.priceFor2 ? Number(newItem.priceFor2) : undefined,
			priceFrom3: newItem.priceFrom3 ? Number(newItem.priceFrom3) : undefined,
		};

		onAdd(itemToAdd);
		setNewItem({
			data: "",
			price: "",
			designType: "default",
			hasDiscount: false,
			priceFor2: "",
			priceFrom3: "",
		});
		localStorage.removeItem("newPriceTagDraft");

		// Focus back to name input for rapid entry
		setTimeout(() => {
			inputRef.current?.focus();
		}, 100);
	}, [newItem, onAdd, inputRef]);

	const handleKeyPress = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter" && !e.shiftKey) {
				e.preventDefault();
				handleAdd();
			}
		},
		[handleAdd],
	);

	const isFormValid =
		newItem.data.trim() && newItem.price && Number(newItem.price) > 0;

	return (
		<TableRow>
			<TableCell></TableCell>
			<TableCell>
				<Input
					ref={inputRef}
					placeholder="Название нового товара..."
					value={newItem.data}
					onChange={(e) =>
						setNewItem((prev) => ({ ...prev, data: e.target.value }))
					}
					onKeyDown={handleKeyPress}
					disabled={isLoading}
					className="border-green-200 focus:border-green-400"
				/>
			</TableCell>
			<TableCell>
				<Input
					type="number"
					placeholder="Цена"
					value={newItem.price}
					onChange={(e) =>
						setNewItem((prev) => ({ ...prev, price: e.target.value }))
					}
					onKeyDown={handleKeyPress}
					disabled={isLoading}
					className="border-green-200 focus:border-green-400"
				/>
			</TableCell>
			<TableCell>
				<Select
					value={newItem.designType}
					onValueChange={(value) =>
						setNewItem((prev) => ({ ...prev, designType: value }))
					}
					disabled={isLoading}
				>
					<SelectTrigger className="border-green-200 focus:border-green-400">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="default">По умолчанию</SelectItem>
						<SelectItem value="new">Новинка</SelectItem>
						<SelectItem value="sale">Распродажа</SelectItem>
					</SelectContent>
				</Select>
			</TableCell>
			<TableCell className="text-center">
				<Switch
					checked={newItem.hasDiscount}
					onCheckedChange={(checked) =>
						setNewItem((prev) => ({ ...prev, hasDiscount: checked }))
					}
					disabled={isLoading}
				/>
			</TableCell>
			<TableCell>
				<Input
					type="number"
					placeholder="Цена за 2"
					value={newItem.priceFor2}
					onChange={(e) =>
						setNewItem((prev) => ({ ...prev, priceFor2: e.target.value }))
					}
					onKeyDown={handleKeyPress}
					disabled={isLoading}
					className="border-green-200 focus:border-green-400"
				/>
			</TableCell>
			<TableCell>
				<Input
					type="number"
					placeholder="Цена от 3"
					value={newItem.priceFrom3}
					onChange={(e) =>
						setNewItem((prev) => ({ ...prev, priceFrom3: e.target.value }))
					}
					onKeyDown={handleKeyPress}
					disabled={isLoading}
					className="border-green-200 focus:border-green-400"
				/>
			</TableCell>
			<TableCell>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							onClick={handleAdd}
							disabled={!isFormValid || isLoading}
							size="icon"
							className="h-8 w-8 bg-gray-50 hover:bg-gray-300"
						>
							{isLoading ? (
								<Zap className="h-3 w-3 animate-pulse" />
							) : (
								<Plus className="h-3 w-3" />
							)}
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>Добавить товар (Enter или Ctrl+N)</p>
					</TooltipContent>
				</Tooltip>
			</TableCell>
		</TableRow>
	);
});

NewItemForm.displayName = "NewItemForm";

// Optimized table row component with proper selection handling
const TableRowItem = React.memo<{
	item: Item;
	isSelected: boolean;
	onSelect: (id: number, selected: boolean) => void;
	onEdit: (
		id: number,
		field: keyof Item,
		value: string | number | boolean,
	) => void;
	onDelete: (id: number) => void;
	isHovered: boolean;
	onHover: (id: number | null) => void;
}>(({ item, isSelected, onSelect, onEdit, onDelete, isHovered, onHover }) => (
	<TableRow
		className={`
			transition-all duration-200 ease-in-out group
			${
				isSelected
					? "dark:bg-blue-950/30 border-l-4 border-l-blue-500 shadow-sm ring-1 ring-blue-200 dark:ring-blue-800"
					: "hover:bg-muted/50"
			}
			${isHovered ? "shadow-md" : ""}
		`}
		onMouseEnter={() => onHover(item.id)}
		onMouseLeave={() => onHover(null)}
	>
		<TableCell className="w-12">
			<Checkbox
				checked={isSelected}
				onCheckedChange={(checked) => {
					onSelect(item.id, !!checked);
				}}
				className={`
					transition-colors
					${isSelected ? "data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white" : ""}
				`}
			/>
		</TableCell>
		<TableCell>
			<Input
				value={String(item.data)}
				onChange={(e) => onEdit(item.id, "data", e.target.value)}
				className="border-0 bg-transparent p-1 focus:bg-background focus:border focus:border-input"
				placeholder="Название товара"
			/>
		</TableCell>
		<TableCell>
			<Input
				type="number"
				value={item.price}
				onChange={(e) => onEdit(item.id, "price", e.target.value)}
				className="border-0 bg-transparent p-1 focus:bg-background focus:border focus:border-input"
				placeholder="0"
			/>
		</TableCell>
		<TableCell>
			<Select
				value={item.designType || "default"}
				onValueChange={(value) => onEdit(item.id, "designType", value)}
			>
				<SelectTrigger className="border-0 text-left bg-transparent focus:bg-background focus:border focus:border-input">
					<SelectValue placeholder="Выберите дизайн" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="default">По умолчанию</SelectItem>
					<SelectItem value="new">Новинка</SelectItem>
					<SelectItem value="sale">Распродажа</SelectItem>
				</SelectContent>
			</Select>
		</TableCell>
		<TableCell className="text-center">
			<Switch
				checked={item.hasDiscount ?? false}
				onCheckedChange={(checked) => onEdit(item.id, "hasDiscount", checked)}
			/>
		</TableCell>
		<TableCell>
			<Input
				type="number"
				value={item.priceFor2 || ""}
				onChange={(e) => onEdit(item.id, "priceFor2", e.target.value)}
				className="border-0 bg-transparent p-1 focus:bg-background focus:border focus:border-input"
				placeholder="0"
			/>
		</TableCell>
		<TableCell>
			<Input
				type="number"
				value={item.priceFrom3 || ""}
				onChange={(e) => onEdit(item.id, "priceFrom3", e.target.value)}
				className="border-0 bg-transparent p-1 focus:bg-background focus:border focus:border-input"
				placeholder="0"
			/>
		</TableCell>
		<TableCell>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => onDelete(item.id)}
						className="h-8 w-8 text-red-800 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
					>
						<Trash2 className="h-3 w-3" />
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>Удалить товар</p>
				</TooltipContent>
			</Tooltip>
		</TableCell>
	</TableRow>
));

TableRowItem.displayName = "TableRowItem";

export const OptimizedEditTable: React.FC<OptimizedEditTableProps> = ({
	items,
	selectedItems,
	onSelectionChange,
	onDuplicate,
	onUndo,
	onRedo,
	onFilterChange,
	onSortChange,
	onSearch,
	onClearAll,
	onExport,
}) => {
	const { updateItem, deleteItem, addItem } = usePriceTagsStore();
	const [searchQuery, setSearchQuery] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [hoveredRowId, setHoveredRowId] = useState<number | null>(null);
	const [isAddingItem, setIsAddingItem] = useState(false);
	const hasSelection = selectedItems.length > 0;

	// Enhanced item addition with proper state management
	const handleAddItem = useCallback(
		(newItem: Omit<Item, "id" | "discountPrice">) => {
			setIsAddingItem(true);
			try {
				const { calculateDiscountPrice } = usePriceTagsStore.getState();

				const completeItem: Item = {
					...newItem,
					id: Date.now() * 1000 + Math.random() * 1000,
					discountPrice: calculateDiscountPrice(newItem.price),
				};
				addItem(completeItem);
				toast.success("Товар добавлен", { duration: 2000 });
			} catch {
				console.error("Failed to save item");
				toast.error("Ошибка при сохранении элемента");
			} finally {
				setIsAddingItem(false);
			}
		},
		[addItem],
	);

	// Calculate selection state with comprehensive validation
	const validSelectedItems = selectedItems.filter((id) =>
		items.some((item) => item.id === id),
	);
	const hasOrphanedSelections =
		selectedItems.length > validSelectedItems.length;
	const allSelected =
		items.length > 0 && validSelectedItems.length === items.length;
	const someSelected =
		validSelectedItems.length > 0 && validSelectedItems.length < items.length;
	const selectionPercentage =
		items.length > 0
			? Math.round((validSelectedItems.length / items.length) * 100)
			: 0;

	// Auto-cleanup orphaned selections when items change
	useEffect(() => {
		if (validSelectedItems.length !== selectedItems.length) {
			onSelectionChange(validSelectedItems);
		}
	}, [selectedItems, validSelectedItems, onSelectionChange]);

	// Enhanced selection logic with visual feedback and validation
	const handleSelectionChange = useCallback(
		(id: number, checked: boolean) => {
			// Parameter is required by interface
			void checked;
			// Validate that the item exists in current items
			if (!items.some((item) => item.id === id)) {
				return;
			}

			const isCurrentlySelected = selectedItems.includes(id);
			const shouldBeSelected = !isCurrentlySelected;

			if (shouldBeSelected) {
				const newSelection = [...selectedItems, id];
				// Filter to only include items that exist in current items
				const validSelection = newSelection.filter((itemId) =>
					items.some((item) => item.id === itemId),
				);
				onSelectionChange(validSelection);
				toast.info(`Выбрано товаров: ${validSelection.length}`, {
					duration: 1000,
				});
			} else {
				const newSelection = selectedItems.filter((itemId) => itemId !== id);
				onSelectionChange(newSelection);
				if (newSelection.length === 0) {
					toast.info("Выделение снято", { duration: 1000 });
				}
			}
		},
		[selectedItems, onSelectionChange, items],
	);

	const handleSelectAll = useCallback(
		(checked: boolean | "indeterminate") => {
			// If we have orphaned selections, decide based on how many valid items are selected
			if (hasOrphanedSelections) {
				// If majority of items are selected, prioritize deselecting for safety
				if (validSelectedItems.length >= items.length / 2) {
					onSelectionChange([]);
					toast.info(
						"Снято выделение со всех товаров (очищены недействительные выборы)",
						{ duration: 2000 },
					);
					return;
				}
				// Otherwise, select all valid items
				const allIds = items.map((item) => item.id);
				onSelectionChange(allIds);
				toast.success(
					`Выбраны все товары (${allIds.length}, очищены недействительные выборы)`,
					{ duration: 2000 },
				);
				return;
			}

			if (checked === true) {
				// Only select items that exist in current items
				const allIds = items.map((item) => item.id);
				onSelectionChange(allIds);
				toast.success(`Выбраны все товары (${allIds.length})`, {
					duration: 2000,
				});
			} else {
				onSelectionChange([]);
				toast.info("Снято выделение со всех товаров", { duration: 1500 });
			}
		},
		[items, onSelectionChange, hasOrphanedSelections, validSelectedItems],
	);

	// Enhanced delete with confirmation
	const handleDeleteSelected = useCallback(() => {
		if (validSelectedItems.length === 0) {
			toast.error("Выберите товары для удаления");
			return;
		}
		setShowDeleteDialog(true);
	}, [validSelectedItems]);

	const confirmDelete = useCallback(async () => {
		setIsDeleting(true);
		try {
			for (const id of validSelectedItems) {
				deleteItem(id);
			}
			onSelectionChange([]);
			setShowDeleteDialog(false);
			toast.success(`Удалено товаров: ${validSelectedItems.length}`, {
				duration: 3000,
			});
		} catch {
			toast.error("Ошибка при удалении товаров");
		} finally {
			setIsDeleting(false);
		}
	}, [validSelectedItems, deleteItem, onSelectionChange]);

	// Focus management for new item input
	const newItemInputRef = useRef<HTMLInputElement>(null);
	const focusNewItemInput = useCallback(() => {
		setTimeout(() => {
			newItemInputRef.current?.focus();
		}, 100);
	}, []);

	// Simple keyboard shortcuts using useEffect
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			const activeElement = document.activeElement;
			const isInputFocused =
				activeElement &&
				(activeElement.tagName === "INPUT" ||
					activeElement.tagName === "TEXTAREA" ||
					activeElement.tagName === "SELECT" ||
					(activeElement as HTMLElement)?.contentEditable === "true");

			if (isInputFocused) return;

			const { key, ctrlKey, metaKey, shiftKey } = event;
			const isCtrlOrCmd = ctrlKey || metaKey;

			// Handle shortcuts
			if (isCtrlOrCmd && key === "z" && !shiftKey) {
				event.preventDefault();
				onUndo();
				toast.info("Отменено", { duration: 1000 });
			} else if (
				(isCtrlOrCmd && key === "y") ||
				(isCtrlOrCmd && shiftKey && key === "Z")
			) {
				event.preventDefault();
				onRedo();
				toast.info("Повторено", { duration: 1000 });
			} else if (isCtrlOrCmd && key === "d") {
				event.preventDefault();
				onDuplicate();
			} else if (key === "Delete" && hasSelection) {
				event.preventDefault();
				handleDeleteSelected();
			} else if (isCtrlOrCmd && key === "a") {
				event.preventDefault();
				handleSelectAll(true);
			} else if (isCtrlOrCmd && key === "n") {
				event.preventDefault();
				focusNewItemInput();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [
		hasSelection,
		onUndo,
		onRedo,
		onDuplicate,
		handleDeleteSelected,
		handleSelectAll,
		focusNewItemInput,
	]);

	// Bulk actions
	const bulkActions = [
		{
			label: "Дублировать выбранные",
			icon: Copy,
			action: onDuplicate,
			disabled: !hasSelection,
			shortcut: "Ctrl+D",
		},
		{
			label: "Удалить выбранные",
			icon: Trash2,
			action: handleDeleteSelected,
			disabled: !hasSelection,
			variant: "destructive" as const,
			shortcut: "Delete",
		},
		{
			label: "Выбрать все",
			icon: CheckSquare,
			action: () => handleSelectAll(true),
			disabled: allSelected,
			shortcut: "Ctrl+A",
		},
		{
			label: "Снять выделение",
			icon: Square,
			action: () => handleSelectAll(false),
			disabled: !hasSelection,
			shortcut: "Esc",
		},
	];

	return (
		<TooltipProvider>
			<div className="space-y-4">
				{/* Enhanced Selection Status Bar */}
				{hasSelection && (
					<div className="flex gap-2 items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950/20 dark:border-blue-800">
						<div className="flex items-center gap-2">
							<CheckSquare className="h-4 w-4 text-blue-600" />
							<span className="text-sm font-medium text-blue-900 dark:text-blue-100">
								Выбрано товаров: {validSelectedItems.length} из {items.length}
							</span>
							<span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
								{selectionPercentage}%
							</span>
						</div>
						<div className="flex flex-wrap items-center gap-2">
							{bulkActions.map((action) => (
								<Tooltip key={action.label}>
									<TooltipTrigger asChild>
										<Button
											size="sm"
											variant={action.variant || "outline"}
											disabled={action.disabled}
											onClick={action.action}
											className="h-8"
										>
											<action.icon className="h-3 w-3 mr-1" />
											{action.label}
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										<p>{action.shortcut}</p>
									</TooltipContent>
								</Tooltip>
							))}
						</div>
					</div>
				)}

				{/* Enhanced Toolbar */}
				<div className="flex flex-col gap-4 p-4 border rounded-lg bg-card">
					{/* Search and Filters Row */}
					<div className="flex items-center gap-3">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Поиск товаров..."
								value={searchQuery}
								onChange={(e) => {
									setSearchQuery(e.target.value);
									onSearch(e.target.value);
								}}
								className="pl-10"
							/>
						</div>
						<Select onValueChange={onFilterChange}>
							<SelectTrigger className="w-[200px]">
								<SelectValue placeholder="Фильтр" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Все товары</SelectItem>
								<SelectItem value="hasDiscount">Со скидкой</SelectItem>
								<SelectItem value="noDiscount">Без скидки</SelectItem>
								<SelectItem value="defaultDesign">
									Дизайн по умолчанию
								</SelectItem>
								<SelectItem value="newDesign">Новый дизайн</SelectItem>
								<SelectItem value="saleDesign">Распродажа дизайн</SelectItem>
							</SelectContent>
						</Select>
						<Select onValueChange={onSortChange}>
							<SelectTrigger className="w-[200px]">
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

					{/* Actions Row */}
					<div className="flex items-center gap-2">
						<div className="flex items-center gap-2">
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										onClick={onUndo}
										variant="outline"
										size="sm"
										className="h-8"
									>
										<Undo className="h-3 w-3" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Отменить (Ctrl+Z)</p>
								</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										onClick={onRedo}
										variant="outline"
										size="sm"
										className="h-8"
									>
										<Redo className="h-3 w-3" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Повторить (Ctrl+Y)</p>
								</TooltipContent>
							</Tooltip>
						</div>

						<div className="h-4 w-px bg-border" />

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="sm" className="h-8">
									<MoreHorizontal className="h-3 w-3 mr-1" />
									Действия
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start">
								<DropdownMenuItem
									onClick={onDuplicate}
									disabled={!hasSelection}
								>
									<Copy className="h-4 w-4 mr-2" />
									Дублировать выбранные
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={handleDeleteSelected}
									disabled={!hasSelection}
									className="text-red-600"
								>
									<Trash2 className="h-4 w-4 mr-2" />
									Удалить выбранные
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={onClearAll} className="text-red-600">
									<AlertCircle className="h-4 w-4 mr-2" />
									Очистить все
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						<div className="flex-1" />

						<Select
							onValueChange={(value) =>
								onExport(value as "csv" | "pdf" | "xlsx")
							}
						>
							<SelectTrigger className="w-[140px] h-8">
								<SelectValue placeholder="Экспорт" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="csv">Экспорт CSV</SelectItem>
								<SelectItem value="pdf">Экспорт PDF</SelectItem>
								<SelectItem value="xlsx">Экспорт XLSX</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				{/* Enhanced Table */}
				<div className="border rounded-lg overflow-hidden">
					<Table>
						<TableHeader>
							<TableRow className="bg-muted/20">
								<TableHead className="w-12">
									<Tooltip>
										<TooltipTrigger asChild>
											<Checkbox
												checked={allSelected}
												onCheckedChange={handleSelectAll}
												title={
													allSelected
														? "Снять выделение со всех"
														: someSelected
															? `Выделить все (сейчас ${validSelectedItems.length}/${items.length})`
															: "Выделить все"
												}
											/>
										</TooltipTrigger>
										<TooltipContent>
											<p>Выбрать все (Ctrl+A)</p>
										</TooltipContent>
									</Tooltip>
								</TableHead>
								<TableHead>Название товара</TableHead>
								<TableHead>Цена</TableHead>
								<TableHead>Дизайн</TableHead>
								<TableHead>Скидка</TableHead>
								<TableHead>Цена за 2</TableHead>
								<TableHead>Цена от 3</TableHead>
								<TableHead className="w-16">Действия</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{items.map((item) => (
								<TableRowItem
									key={item.id}
									item={item}
									isSelected={selectedItems.includes(item.id)}
									onSelect={handleSelectionChange}
									onEdit={(id, field, value) => {
										if (field === "id" || field === "discountPrice") return;
										try {
											updateItem(id, field, value);
										} catch {
											console.error("Failed to update item");
											toast.error("Ошибка при обновлении элемента");
										}
									}}
									onDelete={deleteItem}
									isHovered={hoveredRowId === item.id}
									onHover={setHoveredRowId}
								/>
							))}
							<NewItemForm
								onAdd={handleAddItem}
								isLoading={isAddingItem}
								inputRef={newItemInputRef}
							/>
						</TableBody>
					</Table>
				</div>

				{/* Delete Confirmation Dialog */}
				<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle className="flex items-center gap-2">
								<AlertCircle className="h-5 w-5 text-red-500" />
								Подтверждение удаления
							</AlertDialogTitle>
							<AlertDialogDescription>
								Вы действительно хотите удалить {validSelectedItems.length}{" "}
								выбранных товаров? Это действие нельзя отменить.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Отмена</AlertDialogCancel>
							<AlertDialogAction
								onClick={confirmDelete}
								disabled={isDeleting}
								className="bg-red-600 hover:bg-red-700 text-white"
							>
								{isDeleting ? (
									<>
										<Zap className="h-4 w-4 mr-2 animate-pulse" />
										Удаление...
									</>
								) : (
									"Удалить"
								)}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>

				{/* Keyboard Shortcuts Help */}
				<div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-2">
						<div>
							<kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+D</kbd>{" "}
							Дублировать
						</div>
						<div>
							<kbd className="px-1 py-0.5 bg-muted rounded text-xs">Delete</kbd>{" "}
							Удалить
						</div>
						<div>
							<kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+Z</kbd>{" "}
							Отменить
						</div>
						<div>
							<kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+A</kbd>{" "}
							Выбрать все
						</div>
					</div>
				</div>
			</div>
		</TooltipProvider>
	);
};
