import React from "react";

interface StaticPriceTagsPageProps {
	items: {
		id: number;
		data: string | number;
		price: number;
		discountPrice: number;
		designType?: string;
		hasDiscount?: boolean;
		priceFor2?: number;
		priceFrom3?: number;
	}[];
	design: boolean;
	designType: string;
	themes: {
		[key: string]: {
			start: string;
			end: string;
			textColor: string;
		};
	};
	font: string;
	discountText: string;
	useTableDesigns?: boolean;
	useTableDiscounts?: boolean;
	showThemeLabels?: boolean;
	cuttingLineColor?: string;
}

export function StaticPriceTagsPage({
	items,
	design,
	designType,
	themes,
	font,
	discountText,
	useTableDesigns = false,
	useTableDiscounts = false,
	showThemeLabels = true,
	cuttingLineColor = "#cccccc",
}: StaticPriceTagsPageProps) {
	const itemsPerPage = 18; // 6 rows × 3 columns
	const chunkedItems = items.reduce(
		(acc, item, i) => {
			const chunkIndex = Math.floor(i / itemsPerPage);
			if (!acc[chunkIndex]) {
				acc[chunkIndex] = [];
			}
			acc[chunkIndex].push(item);
			return acc;
		},
		[] as (typeof items)[],
	);

	// Constants based on original design
	const originalWidth = 160;
	const originalHeight = 110;

	const validThemeTypes = [
		"default",
		"new",
		"sale",
		"white",
		"black",
		"sunset",
		"ocean",
		"forest",
		"royal",
		"vintage",
		"neon",
		"monochrome",
		"silver",
		"charcoal",
		"paper",
		"ink",
		"snow",
	];

	const getThemeForItem = (item: any) => {
		const itemDesignType =
			useTableDesigns && item.designType ? item.designType : designType;

		const safeDesignType =
			itemDesignType && validThemeTypes.includes(itemDesignType)
				? itemDesignType
				: "default";

		return themes[safeDesignType] || themes.default;
	};

	const shouldShowDiscount = (item: any) => {
		if (useTableDiscounts && item.hasDiscount !== undefined) {
			return item.hasDiscount;
		}
		return design;
	};

	const hasMultiTierPricing = (item: any) => {
		return item.priceFor2 && item.priceFrom3;
	};

	const needsBorder = (theme: any, designType: string) => {
		return (
			designType === "white" ||
			designType === "black" ||
			theme.start === theme.end
		);
	};

	const getBorderColor = (designType: string) => {
		return designType === "white" ? "#e5e5e5" : "#333333";
	};

	const shouldShowLabel = (itemDesignType: string) => {
		return (
			showThemeLabels && (itemDesignType === "new" || itemDesignType === "sale")
		);
	};

	const getAutomaticCutLineColor = (theme: any) => {
		const isLightTheme = theme.textColor !== "#ffffff";
		return isLightTheme ? "#000000" : "#ffffff";
	};

	// Single price tag component for static rendering
	const StaticPriceTag = ({ item }: { item: any }) => {
		const theme = getThemeForItem(item);
		const showDiscount = shouldShowDiscount(item);
		const hasMultiTier = hasMultiTierPricing(item);
		const itemDesignType =
			useTableDesigns && item.designType ? item.designType : designType;
		const showLabel = shouldShowLabel(itemDesignType);
		const borderColor = getBorderColor(itemDesignType);
		const shouldShowBorder = needsBorder(theme, itemDesignType);
		const discountLines = discountText.split("\n");

		// Calculate dynamic font size based on text length
		const titleText = String(item.data);
		const textLength = titleText.length;
		const baseFontSize = 16;
		const maxWidth = 146;

		const avgCharWidth = 0.6;
		const estimatedTextWidth = textLength * avgCharWidth * baseFontSize;

		let dynamicFontSize = baseFontSize;
		if (estimatedTextWidth > maxWidth) {
			dynamicFontSize = Math.max(maxWidth / (textLength * avgCharWidth), 8);
		}

		dynamicFontSize = Math.round(dynamicFontSize * 10) / 10;

		// Determine cutting line color
		const automaticCutLineColor = getAutomaticCutLineColor(theme);
		const cutLineColor =
			!cuttingLineColor || cuttingLineColor === "#cccccc"
				? automaticCutLineColor
				: cuttingLineColor;

		const gradientId = `linear-gradient-${item.id}`;
		const isGradient = theme.start !== theme.end;

		return (
			<div
				className="price-tag"
				style={{
					width: originalWidth,
					height: originalHeight,
					position: "relative",
					margin: 0,
				}}
			>
				<svg
					width={originalWidth}
					height={originalHeight}
					viewBox={`0 0 ${originalWidth} ${originalHeight}`}
					style={{ display: "block" }}
				>
					<defs>
						{isGradient && (
							<linearGradient
								id={gradientId}
								x1="13.75"
								y1="108.41"
								x2="148.83"
								y2="10.42"
								gradientUnits="userSpaceOnUse"
							>
								<stop offset="0" stopColor={theme.start} />
								<stop offset="1" stopColor={theme.end} />
							</linearGradient>
						)}
					</defs>

					{/* Background */}
					<rect
						width={originalWidth}
						height={originalHeight}
						fill={isGradient ? `url(#${gradientId})` : theme.start}
						stroke={shouldShowBorder ? borderColor : "none"}
						strokeWidth={
							shouldShowBorder ? (itemDesignType === "white" ? 1.5 : 1) : 0
						}
					/>

					{/* Cutting lines */}
					<line
						x1="0"
						y1="0"
						x2={originalWidth}
						y2="0"
						stroke={cutLineColor}
						strokeWidth="0.75"
						strokeDasharray="12,3"
					/>
					<line
						x1="0"
						y1={originalHeight}
						x2={originalWidth}
						y2={originalHeight}
						stroke={cutLineColor}
						strokeWidth="0.75"
						strokeDasharray="12,3"
					/>
					<line
						x1="0"
						y1="0"
						x2="0"
						y2={originalHeight}
						stroke={cutLineColor}
						strokeWidth="0.75"
						strokeDasharray="8,3"
					/>
					<line
						x1={originalWidth}
						y1="0"
						x2={originalWidth}
						y2={originalHeight}
						stroke={cutLineColor}
						strokeWidth="0.75"
						strokeDasharray="8,3"
					/>
				</svg>

				{/* Text content positioned absolutely over SVG */}
				<div
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						width: originalWidth,
						height: originalHeight,
					}}
				>
					{/* Theme labels */}
					{showLabel && itemDesignType === "new" && (
						<div
							style={{
								position: "absolute",
								right: -45,
								bottom: 55,
								transform: "rotate(-90deg)",
								fontSize: "50px",
								color: themes.new?.start || "#9cdd4c",
								fontFamily: font,
								width: 110,
								textAlign: "center",
								fontWeight: "bold",
							}}
						>
							NEW
						</div>
					)}
					{showLabel && itemDesignType === "sale" && (
						<div
							style={{
								position: "absolute",
								right: -48,
								bottom: 55,
								transform: "rotate(-90deg)",
								fontSize: "46px",
								color: themes.sale?.start || "#dd4c54",
								fontFamily: font,
								width: 110,
								textAlign: "center",
								fontWeight: "bold",
							}}
						>
							SALE
						</div>
					)}

					{/* Product name */}
					<div
						style={{
							position: "absolute",
							top: 2,
							left: 2.5,
							width: 146,
							height: 20,
							fontSize: `${dynamicFontSize}px`,
							color: theme.textColor,
							fontFamily: font,
							textTransform: "uppercase",
							overflow: "hidden",
							fontWeight: "bold",
						}}
					>
						{titleText}
					</div>

					{/* Pricing section */}
					{hasMultiTier ? (
						<div
							style={{
								position: "absolute",
								top: 28,
								left: 8,
								right: 12,
								height: 65,
							}}
						>
							<div
								style={{
									fontSize: "8px",
									color: theme.textColor,
									fontFamily: font,
									marginBottom: 3,
									fontWeight: "bold",
								}}
							>
								При покупке:
							</div>

							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "flex-end",
									marginBottom: 1,
								}}
							>
								<div
									style={{
										fontSize: "12px",
										color: theme.textColor,
										fontFamily: font,
										fontWeight: "bold",
									}}
								>
									от 3 шт.
								</div>
								<div
									style={{
										fontSize: "46px",
										color: theme.textColor,
										fontFamily: font,
										fontWeight: "bold",
									}}
								>
									{new Intl.NumberFormat("ru-RU").format(item.priceFrom3 || 0)}
								</div>
							</div>

							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									marginBottom: 1,
								}}
							>
								<div
									style={{
										fontSize: "12px",
										color: theme.textColor,
										fontFamily: font,
										fontWeight: "bold",
									}}
								>
									2 шт.
								</div>
								<div
									style={{
										fontSize: "32px",
										color: theme.textColor,
										fontFamily: font,
										fontWeight: "bold",
									}}
								>
									{new Intl.NumberFormat("ru-RU").format(item.priceFor2 || 0)}
								</div>
							</div>

							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
								}}
							>
								<div
									style={{
										fontSize: "12px",
										color: theme.textColor,
										fontFamily: font,
										fontWeight: "bold",
									}}
								>
									1 шт.
								</div>
								<div
									style={{
										fontSize: "24px",
										color: theme.textColor,
										fontFamily: font,
										fontWeight: "bold",
									}}
								>
									{new Intl.NumberFormat("ru-RU").format(item.price)}
								</div>
							</div>
						</div>
					) : (
						<div
							style={{
								position: "absolute",
								top: 35,
								left: 0,
								width: originalWidth,
								height: 50,
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<div
								style={{
									fontSize: "60px",
									color: theme.textColor,
									fontFamily: font,
									textAlign: "center",
									fontWeight: "bold",
								}}
							>
								{new Intl.NumberFormat("ru-RU").format(item.price)}
							</div>

							{showDiscount && (
								<div
									style={{
										position: "absolute",
										bottom: -20,
										left: 5,
										fontSize: "18px",
										color: theme.textColor,
										fontFamily: font,
										opacity: 0.8,
										fontWeight: "bold",
									}}
								>
									{new Intl.NumberFormat("ru-RU").format(item.discountPrice)}
								</div>
							)}
						</div>
					)}

					{/* Discount text */}
					{showDiscount && !hasMultiTier && (
						<div
							style={{
								position: "absolute",
								bottom: 8,
								left: 65,
								width: 90,
							}}
						>
							{discountLines[0] && (
								<div
									style={{
										fontSize: "10px",
										color: theme.textColor,
										fontFamily: font,
										opacity: 0.8,
										fontWeight: "bold",
									}}
								>
									{discountLines[0]}
								</div>
							)}
							{discountLines[1] && (
								<div
									style={{
										fontSize: "10px",
										color: theme.textColor,
										fontFamily: font,
										opacity: 0.8,
										fontWeight: "bold",
									}}
								>
									{discountLines[1]}
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		);
	};

	return (
		<div
			style={{
				width: "100%",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
			}}
		>
			{chunkedItems.map((chunk, pageIndex) => (
				<div
					key={chunk.map((item) => item.id).join("-")}
					className="print-page"
					style={{
						pageBreakAfter:
							pageIndex < chunkedItems.length - 1 ? "always" : "auto",
					}}
				>
					{/* Create exactly 18 slots (6 rows × 3 columns) */}
					{Array.from({ length: 18 }, (_, index) => {
						const item = chunk[index];
						return item ? (
							<StaticPriceTag key={item.id} item={item} />
						) : (
							<div
								key={`empty-${pageIndex}-${index}`}
								style={{
									width: originalWidth,
									height: originalHeight,
								}}
							/>
						);
					})}
				</div>
			))}
		</div>
	);
}
