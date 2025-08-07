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

export const FancyDesignTypeSelector: React.FC<FancyDesignTypeSelectorProps> = ({
	designType,
	themes,
	hasTableDesigns,
	onDesignTypeChange
}) => {
	// Design type options with their themes and labels
	const designItems = [
		{ 
			value: "default", 
			label: "Обычный",
			theme: themes.default,
			description: "Стандартный дизайн ценника"
		},
		{ 
			value: "new", 
			label: "Новинка",
			theme: themes.new,
			description: "Ценник с пометкой NEW"
		},
		{ 
			value: "sale", 
			label: "Распродажа",
			theme: themes.sale,
			description: "Ценник с пометкой SALE"
		},
	];

	// Add table option if available
	if (hasTableDesigns) {
		designItems.push({
			value: "table",
			label: "Взять из таблицы", 
			theme: themes.default, // Use default theme for preview
			description: "Использовать дизайн из загруженной таблицы"
		});
	}

	return (
		<div className="border p-4 rounded-lg space-y-4">
			<Label className="text-sm font-medium">Тип дизайна ценника</Label>
			<div className="flex flex-col space-y-1">
				<p className="text-xs text-muted-foreground">
					Выберите тип дизайна для ваших ценников
				</p>
			</div>
			
			{/* Full width layout for design types */}
			<div className="flex flex-col gap-4">
				{designItems.map((item) => {
					const isSelected = designType === item.value;
					
					return (
						<div
							key={item.value}
							className={`relative cursor-pointer transition-all hover:scale-[1.01] border-2 rounded-xl overflow-hidden ${
								isSelected 
									? 'border-primary ring-2 ring-primary/20 shadow-md' 
									: 'border-border hover:border-primary/50 hover:shadow-sm'
							}`}
							onClick={() => onDesignTypeChange(item.value)}
						>
							<div className="p-4">
								{/* Price tag preview - full width and height */}
								<div className="relative w-full h-40 mb-3 rounded-lg overflow-hidden">
									<PriceTagPreview
										theme={item.theme}
										designType={item.value as "default" | "new" | "sale" | "table"}
										width={160}
										height={110}
										viewBox="0 0 160 110"
										showLabels={item.value !== "table"}
										showBorder={false}
										uniqueId={`design-${item.value}`}
										className="w-full h-full"
										showThreeGradients={item.value === "table"}
										themes={item.value === "table" ? {
											default: themes.default,
											new: themes.new,
											sale: themes.sale
										} : undefined}
									/>
								</div>
								
								{/* Type name and description */}
								<div className="text-center space-y-1">
									<h3 className="font-medium text-sm">
										{item.label}
									</h3>
									<p className="text-xs text-muted-foreground line-clamp-2">
										{item.description}
									</p>
								</div>
							</div>
							
							{/* Selection indicator */}
							{isSelected && (
								<div className="absolute top-2 right-2">
									<div className="bg-primary text-primary-foreground rounded-full p-1.5">
										<svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
											<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
										</svg>
									</div>
								</div>
							)}
							
							{/* Selection glow effect */}
							{isSelected && (
								<div className="absolute inset-0 bg-primary/5 rounded-xl pointer-events-none" />
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
};