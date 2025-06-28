import { Plus, Trash2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { Item } from "@/store/priceTagsStore";
import { usePriceTagsStore } from "@/store/priceTagsStore";

interface EditTableProps {
	items: Item[];
	selectedItems: number[];
	onSelectionChange: (selectedIds: number[]) => void;
}

export const EditTable: React.FC<EditTableProps> = ({
	items,
	selectedItems,
	onSelectionChange,
}) => {
	const { updateItem, deleteItem, calculateDiscountPrice } =
		usePriceTagsStore();
	const [newItem, setNewItem] = useState({
		data: "",
		price: "",
		designType: "",
		hasDiscount: false,
		priceFor2: "",
		priceFrom3: "",
	});

	const handleEdit = (
		id: number,
		field: "data" | "price" | "designType" | "priceFor2" | "priceFrom3",
		value: string,
	) => {
		updateItem(id, field, value);
	};

	const handleDiscountToggle = (id: number, checked: boolean) => {
		updateItem(id, "hasDiscount", checked);
	};

	const handleDelete = (id: number) => {
		deleteItem(id);
	};

	const handleAdd = () => {
		console.log("Current newItem state:", newItem);
		if (newItem.data && newItem.price) {
			const price = Number(newItem.price);
			const newItemComplete: Item = {
				id: Date.now(),
				data: String(newItem.data),
				price: price,
				discountPrice: calculateDiscountPrice(price),
				designType: newItem.designType || undefined,
				hasDiscount: newItem.hasDiscount,
				priceFor2: Number(newItem.priceFor2) || undefined,
				priceFrom3: Number(newItem.priceFrom3) || undefined,
			};
			console.log("newItemComplete before adding:", newItemComplete);
			// Directly add to the store, which will trigger re-render in PriceTagsPage
			usePriceTagsStore.getState().addItem(newItemComplete);
			setNewItem({
				data: "",
				price: "",
				designType: "",
				hasDiscount: false,
				priceFor2: "",
				priceFrom3: "",
			});
		}
	};

	return (
		<div className="space-y-4">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>
							<Checkbox
								checked={
									selectedItems.length === items.length && items.length > 0
								}
								onCheckedChange={(checked) => {
									if (checked) {
										onSelectionChange(items.map((item) => item.id));
									} else {
										onSelectionChange([]);
									}
								}}
							/>
						</TableHead>
						<TableHead>Название</TableHead>
						<TableHead>Цена</TableHead>
						<TableHead>Дизайн</TableHead>
						<TableHead>Скидка</TableHead>
						<TableHead>Цена за 2</TableHead>
						<TableHead>Цена от 3</TableHead>
						<TableHead>Действия</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{items.map((item) => (
						<TableRow key={item.id}>
							<TableCell>
								<Checkbox
									checked={selectedItems.includes(item.id)}
									onCheckedChange={(checked) => {
										if (checked) {
											onSelectionChange([...selectedItems, item.id]);
										} else {
											onSelectionChange(
												selectedItems.filter((id) => id !== item.id),
											);
										}
									}}
								/>
							</TableCell>
							<TableCell>
								<Input
									value={String(item.data)}
									onChange={(e) => handleEdit(item.id, "data", e.target.value)}
								/>
							</TableCell>
							<TableCell>
								<Input
									type="number"
									value={item.price}
									onChange={(e) => handleEdit(item.id, "price", e.target.value)}
								/>
							</TableCell>
							<TableCell>
								<Select
									value={item.designType || "default"}
									onValueChange={(value) =>
										handleEdit(item.id, "designType", value)
									}
								>
									<SelectTrigger className="w-full">
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
									onCheckedChange={(checked) =>
										handleDiscountToggle(item.id, checked)
									}
								/>
							</TableCell>
							<TableCell>
								<Input
									type="number"
									value={item.priceFor2 || ""}
									onChange={(e) =>
										handleEdit(item.id, "priceFor2", e.target.value)
									}
								/>
							</TableCell>
							<TableCell>
								<Input
									type="number"
									value={item.priceFrom3 || ""}
									onChange={(e) =>
										handleEdit(item.id, "priceFrom3", e.target.value)
									}
								/>
							</TableCell>
							<TableCell>
								<Button
									variant="destructive"
									size="icon"
									onClick={() => handleDelete(item.id)}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</TableCell>
						</TableRow>
					))}
					<TableRow>
						<TableCell></TableCell>
						<TableCell>
							<Input
								placeholder="Название товара"
								value={newItem.data}
								onChange={(e) =>
									setNewItem((prev) => ({ ...prev, data: e.target.value }))
								}
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
							/>
						</TableCell>
						<TableCell>
							<Select
								value={newItem.designType || "default"}
								onValueChange={(value) =>
									setNewItem((prev) => ({ ...prev, designType: value }))
								}
							>
								<SelectTrigger className="w-full">
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
								checked={newItem.hasDiscount}
								onCheckedChange={(checked) =>
									setNewItem((prev) => ({ ...prev, hasDiscount: checked }))
								}
							/>
						</TableCell>
						<TableCell>
							<Input
								type="number"
								placeholder="Цена за 2"
								value={newItem.priceFor2 || ""}
								onChange={(e) =>
									setNewItem((prev) => ({ ...prev, priceFor2: e.target.value }))
								}
							/>
						</TableCell>
						<TableCell>
							<Input
								type="number"
								placeholder="Цена от 3"
								value={newItem.priceFrom3 || ""}
								onChange={(e) =>
									setNewItem((prev) => ({
										...prev,
										priceFrom3: e.target.value,
									}))
								}
							/>
						</TableCell>
						<TableCell>
							<Button onClick={handleAdd} size="icon">
								<Plus className="h-4 w-4" />
							</Button>
						</TableCell>
					</TableRow>
				</TableBody>
			</Table>
		</div>
	);
};
