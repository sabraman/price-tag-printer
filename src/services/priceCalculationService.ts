import type { Item } from "@/store/itemsStore";

export interface DiscountSettings {
	discountAmount: number;
	maxDiscountPercent: number;
}

export interface PriceCalculationParams {
	items: Item[];
	discountSettings: DiscountSettings;
	design: boolean;
	designType: string;
	hasTableDiscounts: boolean;
}

export class PriceCalculationService {
	/**
	 * Calculate discount price for a single item
	 */
	static calculateDiscountPrice(
		price: number,
		discountSettings: DiscountSettings,
	): number {
		const { discountAmount, maxDiscountPercent } = discountSettings;
		
		const discountedPrice = price - discountAmount;
		const discountPercent = ((price - discountedPrice) / price) * 100;

		// Apply max discount percent limit
		if (discountPercent > maxDiscountPercent) {
			return Math.round(price - (price * maxDiscountPercent) / 100);
		}

		return Math.round(Math.max(discountedPrice, 0));
	}

	/**
	 * Calculate discount prices for all items based on current settings
	 */
	static updateItemPrices(params: PriceCalculationParams): Item[] {
		const { items, discountSettings, design, designType, hasTableDiscounts } = params;
		const useTableDiscounts = hasTableDiscounts && designType === "table";

		return items.map((item) => {
			const potentialDiscountPrice = this.calculateDiscountPrice(
				item.price,
				discountSettings,
			);

			let finalDiscountPrice: number;

			if (useTableDiscounts && item.hasDiscount !== undefined) {
				// Use item-specific discount setting
				finalDiscountPrice = item.hasDiscount ? potentialDiscountPrice : item.price;
			} else if (useTableDiscounts) {
				// Use global design flag for items without specific setting
				finalDiscountPrice = design ? potentialDiscountPrice : item.price;
			} else {
				// Normal global discount mode
				finalDiscountPrice = design ? potentialDiscountPrice : item.price;
			}

			return {
				...item,
				discountPrice: finalDiscountPrice,
			};
		});
	}

	/**
	 * Calculate multi-tier pricing for bulk orders
	 */
	static calculateMultiTierPricing(item: Item): {
		basePrice: number;
		priceFor2: number | undefined;
		priceFrom3: number | undefined;
		savings2: number;
		savings3: number;
	} {
		const { price, priceFor2, priceFrom3 } = item;

		return {
			basePrice: price,
			priceFor2,
			priceFrom3,
			savings2: priceFor2 ? ((price - priceFor2) / price) * 100 : 0,
			savings3: priceFrom3 ? ((price - priceFrom3) / price) * 100 : 0,
		};
	}

	/**
	 * Validate price values
	 */
	static validatePrice(price: number): boolean {
		return !isNaN(price) && price >= 0 && isFinite(price);
	}

	/**
	 * Format price for display
	 */
	static formatPrice(price: number, currency: string = "₽"): string {
		if (!this.validatePrice(price)) {
			return "0" + currency;
		}
		return Math.round(price) + currency;
	}
}