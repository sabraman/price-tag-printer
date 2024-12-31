import React, { useState } from "react";
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

interface Item {
  id: number;
  data: string | number;
  price: number;
  discountPrice: number;
}

interface EditTableProps {
  items: Item[];
  onItemsChange: (items: Item[]) => void;
  isEditMode: boolean;
  setIsEditMode: (value: boolean) => void;
}

export const EditTable: React.FC<EditTableProps> = ({
  items,
  onItemsChange,
  setIsEditMode,
}) => {
  const [editingItems, setEditingItems] = useState<Item[]>(items);
  const [newItem, setNewItem] = useState({ data: "", price: "" });

  const handleEdit = (id: number, field: "data" | "price", value: string) => {
    setEditingItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const price = field === "price" ? Number(value) : item.price;
          return {
            ...item,
            [field]: field === "price" ? Number(value) : String(value),
            discountPrice: price - 55,
          };
        }
        return item;
      })
    );
  };

  const handleSave = () => {
    onItemsChange(editingItems);
    setIsEditMode(false);
  };

  const handleDelete = (id: number) => {
    setEditingItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAdd = () => {
    if (newItem.data && newItem.price) {
      const price = Number(newItem.price);
      const newItemComplete: Item = {
        id: Date.now(),
        data: String(newItem.data),
        price: price,
        discountPrice: price - 55,
      };
      setEditingItems((prev) => [...prev, newItemComplete]);
      setNewItem({ data: "", price: "" });
    }
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Название</TableHead>
            <TableHead>Цена</TableHead>
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
