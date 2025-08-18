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
	{ id: "montserrat", name: "Montserrat" },
	{ id: "inter", name: "Inter" },
	{ id: "nunito", name: "Nunito" },
	{ id: "mont", name: "Mont" },
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
	const _currentFontData = fonts.find((f) => f.id === currentFont) || fonts[0];
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

	// Show discount switch only if not "table mode" with table discounts
	const showDiscountSwitch = !(designType === "table" && hasTableDiscounts);

	// Show discount settings if global discount is enabled OR table mode with table discounts
	const showDiscountSettings =
		design || (designType === "table" && hasTableDiscounts);

	// Always show theme section
	const showThemeSection = true;

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
		<div className="space-y-6">
			{/* Fancy Design Type Selection - Always visible */}
			<div className="space-y-4">
				<FancyDesignTypeSelector
					designType={designType}
					themes={themes}
					hasTableDesigns={hasTableDesigns}
					onDesignTypeChange={handleDesignTypeChange}
				/>
			</div>

			{/* Discount Settings - Only for non-table modes or table modes with discounts */}
			{(showDiscountSwitch || showDiscountSettings) && (
				<div className="border border-border/50 p-4 rounded-xl bg-card/30 space-y-4">
					<Label className="text-sm font-semibold text-foreground">
						Настройки скидки
					</Label>

					{/* Discount Switch */}
					{showDiscountSwitch && (
						<div className="flex items-center justify-between p-3 rounded-lg bg-card/50">
							<Label htmlFor="discount-switch" className="text-sm font-medium">
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
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<PlusMinusInput
								label="Максимальная скидка в рублях"
								defaultValue={discountAmount}
								minValue={0}
								step={5}
								onChange={handleDiscountAmountChange}
							/>
							<PlusMinusInput
								label="Максимальный процент скидки"
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
							<Label className="text-sm font-medium">Текст скидки</Label>
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

			{/* Theme Selector */}
			{showThemeSection && (
				<div className="border border-border/50 p-4 rounded-xl bg-card/30 space-y-4">
					<Label className="text-sm font-semibold text-foreground">
						Цветовая схема
					</Label>
					<GradientPicker
						themes={themes}
						onChange={onThemeChange}
						cuttingLineColor={cuttingLineColor}
						onCuttingLineColorChange={setCuttingLineColor}
					/>
				</div>
			)}

			{/* Font Selector */}
			<div className="border border-border/50 p-4 rounded-xl bg-card/30 space-y-4">
				<Label className="text-sm font-semibold text-foreground">
					Настройки шрифта
				</Label>
				<div className="space-y-4">
					<div className="space-y-2">
						<Label className="text-sm font-medium">Шрифт для ценников</Label>
						<Select value={currentFont} onValueChange={onFontChange}>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Выберите шрифт" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="inter">Inter</SelectItem>
								<SelectItem value="montserrat">Montserrat</SelectItem>
								<SelectItem value="nunito">Nunito</SelectItem>
								<SelectItem value="mont">Mont</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Show Theme Labels - Only for non-table modes */}
					{designType !== "table" && (
						<div className="flex items-center justify-between p-3 rounded-lg bg-card/50">
							<Label
								htmlFor="theme-labels-switch"
								className="text-sm font-medium"
							>
								Показывать названия цветов
							</Label>
							<Switch
								id="theme-labels-switch"
								checked={showThemeLabels}
								onCheckedChange={onShowThemeLabelsChange}
							/>
						</div>
					)}
				</div>
			</div>

			{/* Developer Actions */}
			<div className="border border-border/50 p-4 rounded-xl bg-destructive/5 space-y-4">
				<Label className="text-sm font-semibold text-foreground">
					Сброс настроек
				</Label>
				<Button
					onClick={handleClearSettings}
					variant="destructive"
					size="sm"
					className="w-full"
				>
					🗑️ Очистить все настройки
				</Button>
			</div>
		</div>
	);
};
