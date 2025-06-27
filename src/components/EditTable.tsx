import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Save } from "lucide-react";
import { usePriceTagsStore } from "@/store/priceTagsStore";
import type { Item } from "@/store/priceTagsStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface EditTableProps {
  items: Item[];
  onChange: (items: Item[]) => void;
}

export const EditTable: React.FC<EditTableProps> = ({ items, onChange }) => {
  const { updateItem, deleteItem, calculateDiscountPrice } = usePriceTagsStore();
  const [editingItems, setEditingItems] = useState<Item[]>(items);
  const [newItem, setNewItem] = useState({ data: "", price: "", designType: "", hasDiscount: false, priceFor2: "", priceFrom3: "" });

  const handleEdit = (id: number, field: "data" | "price" | "designType" | "priceFor2" | "priceFrom3", value: string) => {
    setEditingItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (field === "price") {
            const price = Number(value);
            return {
              ...item,
              price,
              discountPrice: calculateDiscountPrice(price),
            };
          } 
          if (field === "designType") {
            return {
              ...item,
              designType: value,
            };
          }
          if (field === "priceFor2") {
            return {
              ...item,
              priceFor2: Number(value),
            };
          }
          if (field === "priceFrom3") {
            return {
              ...item,
              priceFrom3: Number(value),
            };
          }
          return {
            ...item,
            data: String(value),
          };
        }
        return item;
      })
    );
    updateItem(id, field, value);
  };

  const handleDiscountToggle = (id: number, checked: boolean) => {
    setEditingItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            hasDiscount: checked,
          };
        }
        return item;
      })
    );
    // Update the item in the store as well
    updateItem(id, "hasDiscount", checked);
  };

  const handleSave = () => {
    onChange(editingItems);
  };

  const handleDelete = (id: number) => {
    setEditingItems((prev) => prev.filter((item) => item.id !== id));
    deleteItem(id);
  };

  const handleAdd = () => {
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
      setEditingItems((prev) => [...prev, newItemComplete]);
      setNewItem({ data: "", price: "", designType: "", hasDiscount: false, priceFor2: "", priceFrom3: "" });
    }
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
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
          {editingItems.map((item) => (
            <TableRow key={item.id}>
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
                  onValueChange={(value) => handleEdit(item.id, "designType", value)}
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
                  onCheckedChange={(checked) => handleDiscountToggle(item.id, checked)}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={item.priceFor2 || ''}
                  onChange={(e) => handleEdit(item.id, "priceFor2", e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={item.priceFrom3 || ''}
                  onChange={(e) => handleEdit(item.id, "priceFrom3", e.target.value)}
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
                onValueChange={(value) => setNewItem((prev) => ({ ...prev, designType: value }))}
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
                value={newItem.priceFor2 || ''}
                onChange={(e) =>
                  setNewItem((prev) => ({ ...prev, priceFor2: e.target.value }))
                }
              />
            </TableCell>
            <TableCell>
              <Input
                type="number"
                placeholder="Цена от 3"
                value={newItem.priceFrom3 || ''}
                onChange={(e) =>
                  setNewItem((prev) => ({ ...prev, priceFrom3: e.target.value }))
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
      <Button onClick={handleSave} className="w-full">
        <Save className="h-4 w-4 mr-2" />
        Сохранить изменения
      </Button>
    </div>
  );
};
