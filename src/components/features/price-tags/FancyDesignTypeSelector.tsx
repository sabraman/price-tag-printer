import { Check } from "lucide-react";
import type React from "react";
import { Label } from "@/components/ui/label";
import type { ThemeSet } from "@/store/priceTagsStore";
import { PriceTagPreview } from "./PriceTagPreview";

interface FancyDesignTypeSelectorProps {
	designType: string;
	themes: ThemeSet;
	hasTableDesigns: boolean;
	onDesignTypeChange: (type: string) => void;
}

export const FancyDesignTypeSelector: React.FC<
	FancyDesignTypeSelectorProps
> = ({ designType, themes, hasTableDesigns, onDesignTypeChange }) => {
	// Design type options with their themes and labels
	const designItems = [
		{
			value: "default",
			label: "Обычный",
			theme: themes.default,
			description: "Стандартный дизайн",
		},
		{
			value: "new",
			label: "Новинка",
			theme: themes.new,
			description: "С пометкой NEW",
		},
		{
			value: "sale",
			label: "Распродажа",
			theme: themes.sale,
			description: "С пометкой SALE",
		},
	];

	// Add table option if available
	if (hasTableDesigns) {
		designItems.push({
			value: "table",
			label: "Из таблицы",
			theme: themes.default, // Use default theme for preview
			description: "Дизайн из файла",
		});
	}

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label className="text-sm font-medium text-foreground">
					Тип дизайна ценника
				</Label>
				<p className="text-xs text-muted-foreground">
					Выберите тип дизайна для ваших ценников
				</p>
			</div>

			{/* Responsive grid layout */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
				{designItems.map((item) => {
					const isSelected = designType === item.value;

					return (
						<button
							key={item.value}
							className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] ${
								isSelected
									? "border-primary bg-primary/5 shadow-lg shadow-primary/20"
									: "border-border bg-card/50 hover:border-primary/50 hover:bg-card/80"
							}`}
							onClick={() => onDesignTypeChange(item.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									onDesignTypeChange(item.value);
								}
							}}
							aria-label={`Выбрать дизайн: ${item.label}`}
							type="button"
						>
							{/* Compact preview section */}
							<div className="p-3">
								<div className="relative w-full h-24 mb-3 rounded-lg overflow-hidden bg-muted/20">
									<PriceTagPreview
										theme={item.theme}
										designType={
											item.value as "default" | "new" | "sale" | "table"
										}
										width={120}
										height={80}
										viewBox="0 0 120 80"
										showLabels={item.value !== "table"}
										showBorder={false}
										uniqueId={`design-${item.value}`}
										className="w-full h-full object-contain"
										showThreeGradients={item.value === "table"}
										themes={
											item.value === "table"
												? {
														default: themes.default,
														new: themes.new,
														sale: themes.sale,
													}
												: undefined
										}
									/>
								</div>

								{/* Compact text section */}
								<div className="text-center space-y-1">
									<h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
										{item.label}
									</h3>
									<p className="text-xs text-muted-foreground leading-tight">
										{item.description}
									</p>
								</div>
							</div>

							{/* Selection indicator */}
							{isSelected && (
								<div className="absolute top-2 right-2 z-10">
									<div className="bg-primary text-white rounded-full p-1 shadow-lg">
										<Check className="h-3 w-3" strokeWidth={3} />
									</div>
								</div>
							)}

							{/* Selection highlight */}
							{isSelected && (
								<div className="absolute inset-0 bg-primary/10 pointer-events-none" />
							)}
						</button>
					);
				})}
			</div>
		</div>
	);
};
