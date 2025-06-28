import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ThemeSet } from "@/store/priceTagsStore";
import { usePriceTagsStore } from "@/store/priceTagsStore";
import { GradientPicker } from "./GradientPicker";

interface PriceTagCustomizerProps {
	themes: ThemeSet;
	currentFont: string;
	discountText: string;
	onThemeChange: (themes: ThemeSet) => void;
	onFontChange: (font: string) => void;
	onDiscountTextChange: (text: string) => void;
}

const fonts = [
	{ id: "Montserrat", name: "Montserrat" },
	// { id: "Roboto", name: "Roboto" },
	{ id: "Inter", name: "Inter" },
	{ id: "Nunito", name: "Nunito" },
	// { id: "Open Sans", name: "Open Sans" }
];

export const PriceTagCustomizer: React.FC<PriceTagCustomizerProps> = ({
	themes,
	currentFont,
	discountText,
	onThemeChange,
	onFontChange,
	onDiscountTextChange,
}) => {
	const currentFontData = fonts.find((f) => f.id === currentFont) || fonts[0];
	const { design, designType, hasTableDiscounts } = usePriceTagsStore();

	// Показываем текст скидки если включен глобальный флаг скидки
	// ИЛИ мы в режиме таблицы с настройками скидок из таблицы
	const showDiscountText =
		design || (designType === "table" && hasTableDiscounts);

	// Отладочная информация
	console.log(
		`PriceTagCustomizer: design=${design}, designType=${designType}, hasTableDiscounts=${hasTableDiscounts}, showDiscountText=${showDiscountText}`,
	);

	const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const lines = e.target.value.split("\n");
		if (lines.length > 2) {
			// If more than 2 lines, only keep the first two
			onDiscountTextChange(lines.slice(0, 2).join("\n"));
		} else {
			onDiscountTextChange(e.target.value);
		}
	};

	return (
		<div className="border p-4 rounded-lg space-y-4">
			<div className="space-y-2">
				<Label>Тема</Label>
				<GradientPicker themes={themes} onChange={onThemeChange} />
			</div>

			<div className="space-y-2">
				<Label>Шрифт</Label>
				<Select value={currentFont} onValueChange={onFontChange}>
					<SelectTrigger>
						<SelectValue>
							<span
								className="text-lg"
								style={{ fontFamily: currentFontData.id }}
							>
								{currentFontData.name}
							</span>
						</SelectValue>
					</SelectTrigger>
					<SelectContent>
						{fonts.map((font) => (
							<SelectItem key={font.id} value={font.id}>
								<span className="text-lg" style={{ fontFamily: font.id }}>
									{font.name}
								</span>
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{showDiscountText && (
				<div className="space-y-2">
					<Label>Текст скидки</Label>
					<Textarea
						placeholder="Введите текст скидки (максимум 2 строки)"
						value={discountText}
						onChange={handleTextChange}
						className="resize-none w-full"
						rows={2}
					/>
				</div>
			)}
		</div>
	);
};
