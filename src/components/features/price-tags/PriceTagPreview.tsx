import type React from "react";
import type { Theme } from "@/store/priceTagsStore";

interface PriceTagPreviewProps {
	theme: Theme;
	designType?: "default" | "new" | "sale" | "table";
	width?: number;
	height?: number;
	viewBox?: string;
	showLabels?: boolean;
	showBorder?: boolean;
	uniqueId?: string;
	className?: string;
	// For table preview - show three gradients
	showThreeGradients?: boolean;
	themes?: { default: Theme; new: Theme; sale: Theme };
}

export const PriceTagPreview: React.FC<PriceTagPreviewProps> = ({
	theme,
	designType = "default",
	width = 160,
	height = 110,
	viewBox = "0 0 160 110",
	showLabels = true,
	showBorder = false,
	uniqueId = Math.random().toString(36).substring(7),
	className = "",
	showThreeGradients = false,
	themes,
}) => {
	// If showing three gradients (for table preview), render special layout
	if (showThreeGradients && themes) {
		return (
			<div className={`w-full h-full grid grid-rows-3  ${className}`}>
				<PriceTagPreview
					theme={themes.default}
					designType="default"
					width={width}
					height={height / 3}
					viewBox={`0 0 ${width} ${height / 3}`}
					showLabels={false}
					showBorder={showBorder}
					uniqueId={`${uniqueId}-default`}
					className="w-full h-full"
				/>
				<PriceTagPreview
					theme={themes.new}
					designType="new"
					width={width}
					height={height / 3}
					viewBox={`0 0 ${width} ${height / 3}`}
					showLabels={false}
					showBorder={showBorder}
					uniqueId={`${uniqueId}-new`}
					className="w-full h-full"
				/>
				<PriceTagPreview
					theme={themes.sale}
					designType="sale"
					width={width}
					height={height / 3}
					viewBox={`0 0 ${width} ${height / 3}`}
					showLabels={false}
					showBorder={showBorder}
					uniqueId={`${uniqueId}-sale`}
					className="w-full h-full"
				/>
			</div>
		);
	}
	// Determine if this theme needs a border (light themes)
	const needsBorder = showBorder || theme.start === "#ffffff" || theme.start === "#f8f8f8" || theme.start === "#c0c0c0";
	
	// Light themes have dark text, dark themes have white text
	const isLightTheme = theme.textColor !== '#ffffff';
	
	
	// Scale font sizes based on the component size
	const scale = Math.min(width / 160, height / 110);
	const titleFontSize = Math.max(8 * scale, 4);
	const priceFontSize = Math.max(24 * scale, 8);
	const labelFontSize = Math.max(14 * scale, 6);
	
	// Scale positions based on size
	const textX = 10 * scale;
	const titleY = 20 * scale;
	const priceY = 45 * scale;

	return (
		<svg
			width={width}
			height={height}
			viewBox={viewBox}
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<defs>
				<linearGradient
					id={`preview-gradient-${uniqueId}`}
					x1="13.75"
					y1={height - 1.59}
					x2={width - 11.17}
					y2="10.42"
					gradientUnits="userSpaceOnUse"
				>
					<stop offset="0" stopColor={theme.start} />
					<stop offset="1" stopColor={theme.end} />
				</linearGradient>
			</defs>
			
			{/* Background */}
			<rect
				width={width}
				height={height}
				fill={theme.start === theme.end ? theme.start : `url(#preview-gradient-${uniqueId})`}
				{...(needsBorder && {
					stroke: isLightTheme ? "#e5e5e5" : "#333333",
					strokeWidth: isLightTheme ? "1.5" : "1",
				})}
			/>
			
			{/* Sample text */}
			<text x={textX} y={titleY} fill={theme.textColor} fontSize={titleFontSize} fontWeight="500">
				Товар
			</text>
			<text x={textX} y={priceY} fill={theme.textColor} fontSize={priceFontSize} fontWeight="bold">
				299₽
			</text>
			
			{/* Design type indicators */}
			{showLabels && designType === "new" && (
				<text
					x={105 * scale}
					y={30 * scale}
					fill={theme.textColor}
					fontSize={labelFontSize}
					fontWeight="900"
					opacity="0.9"
					transform={`rotate(-8 ${105 * scale} ${30 * scale})`}
				>
					NEW
				</text>
			)}
			{showLabels && designType === "sale" && (
				<text
					x={95 * scale}
					y={30 * scale}
					fill={theme.textColor}
					fontSize={labelFontSize}
					fontWeight="900"
					opacity="0.9"
					transform={`rotate(-8 ${95 * scale} ${30 * scale})`}
				>
					SALE
				</text>
			)}
			{showLabels && designType === "table" && (
				<text
					x={90 * scale}
					y={80 * scale}
					fill={theme.textColor}
					fontSize={titleFontSize}
					fontWeight="900"
					opacity="0.9"
				>
					ИЗ ТАБЛИЦЫ
				</text>
			)}
			
		</svg>
	);
};