export interface Item {
	id: number;
	data: string | number;
	price: number;
	discountPrice: number;
	designType?: string;
	hasDiscount?: boolean;
	priceFor2?: number;
	priceFrom3?: number;
}

export interface Theme {
	start: string;
	end: string;
	textColor: string;
}

export interface ThemeSet {
	default: Theme;
	new: Theme;
	sale: Theme;
	white: Theme;
	black: Theme;
	sunset: Theme;
	ocean: Theme;
	forest: Theme;
	royal: Theme;
	vintage: Theme;
	neon: Theme;
	monochrome: Theme;
	silver: Theme;
	charcoal: Theme;
	paper: Theme;
	ink: Theme;
	snow: Theme;
}

export interface PriceTagSettings {
	design: boolean;
	designType: string;
	discountAmount: number;
	maxDiscountPercent: number;
	themes: ThemeSet;
	currentFont: string;
	discountText: string;
	hasTableDesigns: boolean;
	hasTableDiscounts: boolean;
	showThemeLabels: boolean;
	cuttingLineColor: string;
}

export interface CreatePriceTagRequest {
	data: string | number;
	price: number;
	designType?: string;
	hasDiscount?: boolean;
	priceFor2?: number;
	priceFrom3?: number;
}

export interface UpdatePriceTagRequest {
	data?: string | number;
	price?: number;
	designType?: string;
	hasDiscount?: boolean;
	priceFor2?: number;
	priceFrom3?: number;
}

export interface BulkCreatePriceTagsRequest {
	items: CreatePriceTagRequest[];
}

export interface GeneratePDFRequest {
	items: Item[];
	settings?: Partial<PriceTagSettings>;
	format?: "A4" | "A3" | "Letter";
	margin?: {
		top?: string;
		right?: string;
		bottom?: string;
		left?: string;
	};
}

export interface GenerateHTMLRequest {
	items: Item[];
	settings?: Partial<PriceTagSettings>;
}

export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}

export interface PaginationParams {
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

export interface GetPriceTagsParams extends PaginationParams {
	search?: string;
	designType?: string;
	hasDiscount?: boolean;
	minPrice?: number;
	maxPrice?: number;
}

export interface PaginatedResponse<T> {
	items: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
}
