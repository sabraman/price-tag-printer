import React from "react";
import { Download, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { THEME_METADATA } from "@/lib/themes";

interface PriceTagCustomizerProps {
	themes: ThemeSet;
	currentFont: string;
	discountText: string;
	designType?: string;
	showThemeLabels?: boolean;
	allowThemeSaving?: boolean; // Control whether theme saving functionality is shown
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
	allowThemeSaving = false,
	onThemeChange,
	onFontChange,
	onDiscountTextChange,
	onDesignTypeChange,
	onShowThemeLabelsChange,
}) => {
	const _currentFontData = fonts.find((f) => f.id === currentFont) || fonts[0];
	const [customThemeName, setCustomThemeName] = React.useState("");
	const [showThemeSaveDialog, setShowThemeSaveDialog] = React.useState(false);
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

	// Get saved themes from localStorage
	const getSavedThemes = () => {
		const saved = localStorage.getItem("custom-themes");
		return saved ? JSON.parse(saved) : {};
	};

	// Save theme to localStorage
	const saveThemeToStorage = (themeName: string, themeData: ThemeSet) => {
		const savedThemes = getSavedThemes();
		savedThemes[themeName] = themeData;
		localStorage.setItem("custom-themes", JSON.stringify(savedThemes));
	};

	// Handle saving current theme
	const handleSaveTheme = () => {
		if (!customThemeName.trim()) {
			toast.error("Пожалуйста, введите название темы");
			return;
		}

		try {
			saveThemeToStorage(customThemeName.trim(), themes);
			toast.success(`Тема "${customThemeName.trim()}" успешно сохранена`);
			setCustomThemeName("");
			setShowThemeSaveDialog(false);
		} catch (_error) {
			toast.error("Не удалось сохранить тему");
		}
	};

	// Copy theme as code using unified format
	const handleCopyAsCode = () => {
		try {
			// Create a properly formatted theme object with metadata
			const formattedTheme = {
				name: "Custom Theme",
				description: "Пользовательская тема",
				created: new Date().toISOString(),
				themes: themes,
				metadata: THEME_METADATA.map((meta) => ({
					id: meta.id,
					name: meta.name,
					category: meta.category,
					order: meta.order,
				})),
				version: "1.0.0",
				format: "unified-theme-store",
			};

			const themeCode = JSON.stringify(formattedTheme, null, 2);
			navigator.clipboard.writeText(themeCode);
			toast.success("Код темы скопирован в буфер обмена");
		} catch (_error) {
			toast.error("Не удалось скопировать код темы");
		}
	};

	// Load saved theme
	const handleLoadTheme = (themeName: string) => {
		try {
			const savedThemes = getSavedThemes();
			const themeData = savedThemes[themeName];
			if (themeData) {
				onThemeChange(themeData);
				toast.success(`Тема "${themeName}" успешно загружена`);
			}
		} catch (_error) {
			toast.error("Не удалось загрузить тему");
		}
	};

	// Delete saved theme
	const handleDeleteTheme = (themeName: string) => {
		try {
			const savedThemes = getSavedThemes();
			delete savedThemes[themeName];
			localStorage.setItem("custom-themes", JSON.stringify(savedThemes));
			toast.success(`Тема "${themeName}" удалена`);
		} catch (_error) {
			toast.error("Не удалось удалить тему");
		}
	};

	const savedThemes = getSavedThemes();

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

					{/* Theme Actions - Only show when allowThemeSaving is true */}
					{allowThemeSaving && (
						<div className="space-y-2 pt-2">
							<Button
								onClick={() => setShowThemeSaveDialog(!showThemeSaveDialog)}
								variant="outline"
								className="w-full justify-start"
							>
								<Save className="w-4 h-4 mr-2" />
								Сохранить тему
							</Button>

							{process.env.NODE_ENV === "development" && (
								<Button
									onClick={handleCopyAsCode}
									variant="outline"
									className="w-full justify-start"
								>
									<Download className="w-4 h-4 mr-2" />
									Копировать как код
								</Button>
							)}
						</div>
					)}

					{/* Save Theme Dialog - Only show when allowThemeSaving is true */}
					{showThemeSaveDialog && allowThemeSaving && (
						<div className="space-y-3 pt-3 border-t border-border/30">
							<Label className="text-sm font-medium">Название новой темы</Label>
							<div className="flex gap-2">
								<Input
									value={customThemeName}
									onChange={(e) => setCustomThemeName(e.target.value)}
									placeholder="Моя крутая тема"
									className="flex-1"
								/>
								<Button
									onClick={handleSaveTheme}
									size="sm"
									disabled={!customThemeName.trim()}
								>
									Сохранить
								</Button>
								<Button
									onClick={() => {
										setShowThemeSaveDialog(false);
										setCustomThemeName("");
									}}
									variant="outline"
									size="sm"
								>
									Отмена
								</Button>
							</div>
						</div>
					)}

					{/* Saved Themes - Only show when allowThemeSaving is true */}
					{allowThemeSaving && Object.keys(savedThemes).length > 0 && (
						<div className="space-y-3 pt-3 border-t border-border/30">
							<Label className="text-sm font-medium">Сохраненные темы</Label>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
								{Object.entries(savedThemes).map(([name, _themeData]) => (
									<div key={name} className="flex gap-2">
										<Button
											onClick={() => handleLoadTheme(name)}
											variant="outline"
											size="sm"
											className="flex-1 text-left justify-start"
										>
											<Download className="w-4 h-4 mr-2" />
											{name}
										</Button>
										<Button
											onClick={() => handleDeleteTheme(name)}
											variant="destructive"
											size="sm"
											className="px-2"
										>
											<Trash2 className="w-4 h-4" />
										</Button>
									</div>
								))}
							</div>
						</div>
					)}
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
