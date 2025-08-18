import { Check } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ThemeSet } from "@/store/priceTagsStore";

interface ThemeSelectorProps {
	themes: ThemeSet;
	selectedTheme: string;
	onThemeSelect: (theme: string) => void;
}

const themeLabels: Record<keyof ThemeSet, string> = {
	default: "Стандартный",
	new: "Новинка",
	sale: "Скидка",
	white: "Белый",
	black: "Черный",
	sunset: "Закат",
	ocean: "Океан",
	forest: "Лес",
	royal: "Королевский",
	vintage: "Винтаж",
	neon: "Неон",
	monochrome: "Монохром",
	silver: "Серебро",
	charcoal: "Уголь",
	paper: "Бумага",
	ink: "Чернила",
	snow: "Снег",
};

const basicThemes: (keyof ThemeSet)[] = ["default", "new", "sale"];
const lightThemes: (keyof ThemeSet)[] = ["white", "snow", "paper", "silver"];
const darkThemes: (keyof ThemeSet)[] = [
	"black",
	"ink",
	"charcoal",
	"sunset",
	"ocean",
	"forest",
	"royal",
	"vintage",
];
const colorfulThemes: (keyof ThemeSet)[] = ["neon"];
const monochromeThemes: (keyof ThemeSet)[] = ["monochrome"];

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
	themes,
	selectedTheme,
	onThemeSelect,
}) => {
	// Filter themes to only include ones that actually exist
	const availableBasicThemes = basicThemes.filter((theme) => themes[theme]);
	const availableLightThemes = lightThemes.filter((theme) => themes[theme]);
	const availableDarkThemes = darkThemes.filter((theme) => themes[theme]);
	const availableColorfulThemes = colorfulThemes.filter(
		(theme) => themes[theme],
	);
	const availableMonochromeThemes = monochromeThemes.filter(
		(theme) => themes[theme],
	);
	const ThemePreview: React.FC<{ themeName: keyof ThemeSet }> = ({
		themeName,
	}) => {
		const theme = themes[themeName];
		const isSelected = selectedTheme === themeName;

		// Don't render if theme doesn't exist
		if (!theme) {
			return null;
		}

		return (
			<Card
				className={`relative cursor-pointer transition-all hover:scale-105 ${
					isSelected ? "ring-2 ring-primary" : ""
				}`}
				onClick={() => {
					console.log("Theme selected:", themeName);
					onThemeSelect(themeName);
				}}
			>
				<div className="p-3">
					{/* Mini price tag preview */}
					<div className="relative w-24 h-16 mx-auto mb-2 rounded overflow-hidden">
						<svg
							width="100%"
							height="100%"
							viewBox="0 0 96 64"
							xmlns="http://www.w3.org/2000/svg"
						>
							<title>Предварительный просмотр темы</title>
							<defs>
								<linearGradient
									id={`preview-gradient-${themeName}`}
									x1="0%"
									y1="0%"
									x2="100%"
									y2="100%"
									gradientUnits="userSpaceOnUse"
								>
									<stop offset="0%" stopColor={theme.start} />
									<stop offset="100%" stopColor={theme.end} />
								</linearGradient>
							</defs>

							{/* Background */}
							<rect
								width="96"
								height="64"
								fill={
									theme.start === theme.end
										? theme.start
										: `url(#preview-gradient-${themeName})`
								}
								rx="4"
							/>

							{/* Sample text */}
							<text
								x="8"
								y="16"
								fill={theme.textColor}
								fontSize="8"
								fontWeight="600"
							>
								Товар
							</text>

							<text
								x="8"
								y="32"
								fill={theme.textColor}
								fontSize="12"
								fontWeight="bold"
							>
								100₽
							</text>

							{/* Special styling for white/black themes */}
							{(themeName === "white" || themeName === "black") && (
								<rect
									width="96"
									height="64"
									fill="none"
									stroke={themeName === "white" ? "#000000" : "#ffffff"}
									strokeWidth="1"
									rx="4"
								/>
							)}
						</svg>

						{isSelected && (
							<div className="absolute top-1 right-1">
								<div className="bg-primary text-primary-foreground rounded-full p-1">
									<Check className="h-3 w-3" />
								</div>
							</div>
						)}
					</div>

					{/* Theme name */}
					<p className="text-xs text-center font-medium">
						{themeLabels[themeName]}
					</p>
				</div>
			</Card>
		);
	};

	return (
		<div className="space-y-4">
			<h3 className="text-sm font-medium">Выберите тему ценника</h3>

			<ScrollArea className="h-80">
				<div className="space-y-6 p-1">
					{/* Basic Themes */}
					{availableBasicThemes.length > 0 && (
						<div className="space-y-3">
							<h4 className="text-xs font-medium text-muted-foreground">
								Базовые темы
							</h4>
							<div className="grid grid-cols-3 gap-3">
								{availableBasicThemes.map((themeName) => (
									<ThemePreview key={themeName} themeName={themeName} />
								))}
							</div>
						</div>
					)}

					{/* Light Themes */}
					{availableLightThemes.length > 0 && (
						<div className="space-y-3">
							<h4 className="text-xs font-medium text-muted-foreground">
								Светлые темы
							</h4>
							<div className="grid grid-cols-3 gap-3">
								{availableLightThemes.map((themeName) => (
									<ThemePreview key={themeName} themeName={themeName} />
								))}
							</div>
						</div>
					)}

					{/* Dark Themes */}
					{availableDarkThemes.length > 0 && (
						<div className="space-y-3">
							<h4 className="text-xs font-medium text-muted-foreground">
								Темные темы
							</h4>
							<div className="grid grid-cols-3 gap-3">
								{availableDarkThemes.map((themeName) => (
									<ThemePreview key={themeName} themeName={themeName} />
								))}
							</div>
						</div>
					)}

					{/* Colorful Themes */}
					{availableColorfulThemes.length > 0 && (
						<div className="space-y-3">
							<h4 className="text-xs font-medium text-muted-foreground">
								Яркие темы
							</h4>
							<div className="grid grid-cols-3 gap-3">
								{availableColorfulThemes.map((themeName) => (
									<ThemePreview key={themeName} themeName={themeName} />
								))}
							</div>
						</div>
					)}

					{/* Monochrome Themes */}
					{availableMonochromeThemes.length > 0 && (
						<div className="space-y-3">
							<h4 className="text-xs font-medium text-muted-foreground">
								Монохромные темы
							</h4>
							<div className="grid grid-cols-3 gap-3">
								{availableMonochromeThemes.map((themeName) => (
									<ThemePreview key={themeName} themeName={themeName} />
								))}
							</div>
						</div>
					)}
				</div>
			</ScrollArea>

			{/* Quick actions */}
			<div className="flex gap-1 pt-2 border-t flex-wrap">
				{themes.white && (
					<Button
						variant="outline"
						size="sm"
						onClick={() => onThemeSelect("white")}
						className={
							selectedTheme === "white"
								? "bg-primary text-primary-foreground"
								: ""
						}
					>
						Белый
					</Button>
				)}
				{themes.black && (
					<Button
						variant="outline"
						size="sm"
						onClick={() => onThemeSelect("black")}
						className={
							selectedTheme === "black"
								? "bg-primary text-primary-foreground"
								: ""
						}
					>
						Черный
					</Button>
				)}
				{themes.monochrome && (
					<Button
						variant="outline"
						size="sm"
						onClick={() => onThemeSelect("monochrome")}
						className={
							selectedTheme === "monochrome"
								? "bg-primary text-primary-foreground"
								: ""
						}
					>
						Монохром
					</Button>
				)}
				{themes.default && (
					<Button
						variant="outline"
						size="sm"
						onClick={() => onThemeSelect("default")}
						className={
							selectedTheme === "default"
								? "bg-primary text-primary-foreground"
								: ""
						}
					>
						Стандарт
					</Button>
				)}
			</div>
		</div>
	);
};
