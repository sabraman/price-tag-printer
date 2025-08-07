import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { ThemeSet } from "@/store/priceTagsStore";
import { usePriceTagsStore } from "@/store/priceTagsStore";
import { FancyDesignTypeSelector } from "./FancyDesignTypeSelector";
import { GradientPicker } from "./GradientPicker";
import PlusMinusInput from "./PlusMinusInput";

interface PriceTagCustomizerProps {
	themes: ThemeSet;
	currentFont: string;
	discountText: string;
	designType?: string;
	showThemeLabels?: boolean;
	onThemeChange: (themes: ThemeSet) => void;
	onFontChange: (font: string) => void;
	onDiscountTextChange: (text: string) => void;
	onDesignTypeChange?: (type: string) => void;
	onShowThemeLabelsChange?: (show: boolean) => void;
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
	designType = "default",
	showThemeLabels = true,
	onThemeChange,
	onFontChange,
	onDiscountTextChange,
	onDesignTypeChange,
	onShowThemeLabelsChange,
}) => {
	const currentFontData = fonts.find((f) => f.id === currentFont) || fonts[0];
	const {
		design,
		hasTableDiscounts,
		hasTableDesigns,
		discountAmount,
		maxDiscountPercent,
		cuttingLineColor,
		setDesign,
		setDiscountAmount,
		setMaxDiscountPercent,
		setCuttingLineColor,
		updateItemPrices,
		clearSettings,
	} = usePriceTagsStore();

	// Показываем текст скидки если включен глобальный флаг скидки
	// ИЛИ мы в режиме таблицы с настройками скидок из таблицы
	const showDiscountText =
		design || (designType === "table" && hasTableDiscounts);

	// Design type options
	let designItems = [
		{ value: "default", label: "Обычный" },
		{ value: "new", label: "Новинка" },
		{ value: "sale", label: "Распродажа" },
	];

	// Add "table" option if there are designs in the table
	if (hasTableDesigns) {
		designItems = [
			...designItems,
			{ value: "table", label: "Взять из таблицы" },
		];
	}

	// Show discount switch only if not "table mode" with table discounts
	const showDiscountSwitch = !(designType === "table" && hasTableDiscounts);

	// Show discount settings if global discount is enabled OR table mode with table discounts
	const showDiscountSettings =
		design || (designType === "table" && hasTableDiscounts);

	const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const lines = e.target.value.split("\n");
		if (lines.length > 2) {
			// If more than 2 lines, only keep the first two
			onDiscountTextChange(lines.slice(0, 2).join("\n"));
		} else {
			onDiscountTextChange(e.target.value);
		}
	};

	const handleDiscountChange = (checked: boolean) => {
		setDesign(checked);
		updateItemPrices();
	};

	const handleDiscountAmountChange = (value: number) => {
		setDiscountAmount(value);
		updateItemPrices();
	};

	const handleMaxPercentChange = (value: number) => {
		setMaxDiscountPercent(value);
		updateItemPrices();
	};

	const handleDesignTypeChange = (value: string) => {
		// If switched to "table mode" and there are table discounts, disable global discount
		if (value === "table" && hasTableDiscounts) {
			setDesign(false);
		}

		if (onDesignTypeChange) {
			onDesignTypeChange(value);
		}
		updateItemPrices();
	};

	const handleClearSettings = () => {
		clearSettings();
		window.location.reload();
	};

	return (
		<div className="space-y-4">
			{/* Fancy Design Type Selection - Always visible */}
			<FancyDesignTypeSelector
				designType={designType}
				themes={themes}
				hasTableDesigns={hasTableDesigns}
				onDesignTypeChange={handleDesignTypeChange}
			/>

			{/* Discount Settings - Only for non-table modes or table modes with discounts */}
			{(showDiscountSwitch || showDiscountSettings) && (
				<div className="border p-4 rounded-lg space-y-4">
					<Label className="text-sm font-medium">Настройки скидки</Label>

					{/* Discount Switch */}
					{showDiscountSwitch && (
						<div className="flex items-center justify-between">
							<Label htmlFor="discount-switch">
								Использовать ценник со скидкой
							</Label>
							<Switch
								id="discount-switch"
								checked={design}
								onCheckedChange={handleDiscountChange}
							/>
						</div>
					)}

					{/* Discount Settings */}
					{showDiscountSettings && (
						<div className="space-y-4">
							<PlusMinusInput
								label="Максимальная скидка в рублях"
								defaultValue={discountAmount}
								minValue={0}
								step={5}
								onChange={handleDiscountAmountChange}
							/>
							<PlusMinusInput
								label="Максимальный процent скидки"
								defaultValue={maxDiscountPercent}
								minValue={0}
								step={1}
								onChange={handleMaxPercentChange}
							/>
						</div>
					)}

					{/* Discount Text */}
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
			)}

			{/* Custom Gradient Editor */}
			<div className="border p-4 rounded-lg space-y-4">
				<Label className="text-sm font-medium">Настройка градиентов</Label>
				<GradientPicker
					themes={themes}
					onChange={onThemeChange}
					cuttingLineColor={cuttingLineColor}
					onCuttingLineColorChange={setCuttingLineColor}
				/>
			</div>

			{/* Font and Display Settings */}
			<div className="border p-4 rounded-lg space-y-4">
				<Label className="text-sm font-medium">Настройки отображения</Label>

				{/* Font Selection */}
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

				{/* Theme Labels Toggle */}
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<Label htmlFor="theme-labels-switch">
							Показывать надписи NEW/SALE
						</Label>
						<Switch
							id="theme-labels-switch"
							checked={showThemeLabels}
							onCheckedChange={onShowThemeLabelsChange || (() => {})}
						/>
					</div>
					<p className="text-xs text-muted-foreground">
						Показывать или скрывать надписи "NEW" и "SALE" на соответствующих
						темах
					</p>
				</div>

				{/* Reset Settings */}
				<div className="pt-2 border-t">
					<Button
						type="button"
						variant="outline"
						onClick={handleClearSettings}
						className="w-full"
					>
						Сбросить все настройки
					</Button>
				</div>
			</div>
		</div>
	);
};
