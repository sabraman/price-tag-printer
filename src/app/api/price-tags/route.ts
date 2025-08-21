import { type NextRequest, NextResponse } from "next/server";
import type {
	ApiResponse,
	BulkCreatePriceTagsRequest,
	CreatePriceTagRequest,
	GetPriceTagsParams,
	Item,
	PaginatedResponse,
} from "@/types/api";

// In-memory storage for demonstration (in production, use a database)
let priceTagsStorage: Item[] = [];
let nextId = 1;

// Helper function to generate unique IDs
function generateId(): number {
	return nextId++;
}

// Helper function to validate price tag data
function validatePriceTag(data: CreatePriceTagRequest): string | null {
	if (
		!data.data ||
		(typeof data.data !== "string" && typeof data.data !== "number")
	) {
		return "Data field is required and must be a string or number";
	}

	if (!data.price || typeof data.price !== "number" || data.price <= 0) {
		return "Price is required and must be a positive number";
	}

	if (
		data.designType &&
		![
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
		].includes(data.designType)
	) {
		return "Invalid design type";
	}

	if (
		data.priceFor2 &&
		(typeof data.priceFor2 !== "number" || data.priceFor2 <= 0)
	) {
		return "priceFor2 must be a positive number";
	}

	if (
		data.priceFrom3 &&
		(typeof data.priceFrom3 !== "number" || data.priceFrom3 <= 0)
	) {
		return "priceFrom3 must be a positive number";
	}

	return null;
}

// Helper function to calculate discount price
function calculateDiscountPrice(
	price: number,
	discountAmount: number = 500,
	maxDiscountPercent: number = 5,
): number {
	const discountedPrice = price - discountAmount;
	const discountPercent = ((price - discountedPrice) / price) * 100;

	if (discountPercent > maxDiscountPercent) {
		return Math.round(price - (price * maxDiscountPercent) / 100);
	}

	return Math.round(discountedPrice);
}

// Helper function to filter and paginate items
function filterAndPaginate(
	items: Item[],
	params: GetPriceTagsParams,
): PaginatedResponse<Item> {
	let filteredItems = [...items];

	// Apply filters
	if (params.search) {
		const searchLower = params.search.toLowerCase();
		filteredItems = filteredItems.filter((item) =>
			String(item.data).toLowerCase().includes(searchLower),
		);
	}

	if (params.designType) {
		filteredItems = filteredItems.filter(
			(item) => item.designType === params.designType,
		);
	}

	if (params.hasDiscount !== undefined) {
		filteredItems = filteredItems.filter(
			(item) => item.hasDiscount === params.hasDiscount,
		);
	}

	if (params.minPrice !== undefined) {
		filteredItems = filteredItems.filter(
			(item) => params.minPrice !== undefined && item.price >= params.minPrice,
		);
	}

	if (params.maxPrice !== undefined) {
		filteredItems = filteredItems.filter(
			(item) => params.maxPrice !== undefined && item.price <= params.maxPrice,
		);
	}

	// Apply sorting
	if (params.sortBy) {
		filteredItems.sort((a, b) => {
			const aValue = a[params.sortBy as keyof Item];
			const bValue = b[params.sortBy as keyof Item];

			if (typeof aValue === "string" && typeof bValue === "string") {
				const comparison = aValue.localeCompare(bValue);
				return params.sortOrder === "desc" ? -comparison : comparison;
			}

			if (typeof aValue === "number" && typeof bValue === "number") {
				return params.sortOrder === "desc" ? bValue - aValue : aValue - bValue;
			}

			return 0;
		});
	}

	// Apply pagination
	const page = params.page || 1;
	const limit = params.limit || 10;
	const startIndex = (page - 1) * limit;
	const endIndex = startIndex + limit;
	const paginatedItems = filteredItems.slice(startIndex, endIndex);

	return {
		items: paginatedItems,
		pagination: {
			page,
			limit,
			total: filteredItems.length,
			totalPages: Math.ceil(filteredItems.length / limit),
			hasNext: endIndex < filteredItems.length,
			hasPrev: page > 1,
		},
	};
}

// GET /api/price-tags - Get all price tags with filtering and pagination
export async function GET(
	request: NextRequest,
): Promise<NextResponse<ApiResponse<PaginatedResponse<Item>>>> {
	try {
		const { searchParams } = new URL(request.url);

		const params: GetPriceTagsParams = {
			page: (() => {
				const pageParam = searchParams.get("page");
				return pageParam ? parseInt(pageParam) : 1;
			})(),
			limit: (() => {
				const limitParam = searchParams.get("limit");
				return limitParam ? parseInt(limitParam) : 10;
			})(),
			search: searchParams.get("search") || undefined,
			designType: searchParams.get("designType") || undefined,
			hasDiscount: (() => {
				const hasDiscountParam = searchParams.get("hasDiscount");
				return hasDiscountParam ? hasDiscountParam === "true" : undefined;
			})(),
			minPrice: (() => {
				const minPriceParam = searchParams.get("minPrice");
				return minPriceParam ? parseFloat(minPriceParam) : undefined;
			})(),
			maxPrice: (() => {
				const maxPriceParam = searchParams.get("maxPrice");
				return maxPriceParam ? parseFloat(maxPriceParam) : undefined;
			})(),
			sortBy: searchParams.get("sortBy") || undefined,
			sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "asc",
		};

		const result = filterAndPaginate(priceTagsStorage, params);

		return NextResponse.json({
			success: true,
			data: result,
		});
	} catch (error) {
		console.error("Error fetching price tags:", error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}

// POST /api/price-tags - Create new price tag(s)
export async function POST(
	request: NextRequest,
): Promise<NextResponse<ApiResponse<Item | Item[]>>> {
	try {
		const body = await request.json();

		// Check if it's a bulk creation request
		if ("items" in body) {
			const bulkRequest = body as BulkCreatePriceTagsRequest;

			if (!Array.isArray(bulkRequest.items) || bulkRequest.items.length === 0) {
				return NextResponse.json(
					{
						success: false,
						error: "Items array is required and must not be empty",
					},
					{ status: 400 },
				);
			}

			const createdItems: Item[] = [];
			const errors: string[] = [];

			for (const [index, itemData] of bulkRequest.items.entries()) {
				const validationError = validatePriceTag(itemData);
				if (validationError) {
					errors.push(`Item ${index + 1}: ${validationError}`);
					continue;
				}

				const newItem: Item = {
					id: generateId(),
					data: itemData.data,
					price: itemData.price,
					discountPrice: calculateDiscountPrice(itemData.price),
					designType: itemData.designType,
					hasDiscount: itemData.hasDiscount,
					priceFor2: itemData.priceFor2,
					priceFrom3: itemData.priceFrom3,
				};

				priceTagsStorage.push(newItem);
				createdItems.push(newItem);
			}

			if (errors.length > 0 && createdItems.length === 0) {
				return NextResponse.json(
					{
						success: false,
						error: errors.join("; "),
					},
					{ status: 400 },
				);
			}

			return NextResponse.json(
				{
					success: true,
					data: createdItems,
					message:
						errors.length > 0
							? `Created ${createdItems.length} items. Errors: ${errors.join("; ")}`
							: `Created ${createdItems.length} items successfully`,
				},
				{ status: 201 },
			);
		}

		// Single item creation
		const itemData = body as CreatePriceTagRequest;
		const validationError = validatePriceTag(itemData);

		if (validationError) {
			return NextResponse.json(
				{
					success: false,
					error: validationError,
				},
				{ status: 400 },
			);
		}

		const newItem: Item = {
			id: generateId(),
			data: itemData.data,
			price: itemData.price,
			discountPrice: calculateDiscountPrice(itemData.price),
			designType: itemData.designType,
			hasDiscount: itemData.hasDiscount,
			priceFor2: itemData.priceFor2,
			priceFrom3: itemData.priceFrom3,
		};

		priceTagsStorage.push(newItem);

		return NextResponse.json(
			{
				success: true,
				data: newItem,
				message: "Price tag created successfully",
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("Error creating price tag:", error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}

// DELETE /api/price-tags - Delete all price tags
export async function DELETE(): Promise<
	NextResponse<ApiResponse<{ deletedCount: number }>>
> {
	try {
		const deletedCount = priceTagsStorage.length;
		priceTagsStorage = [];
		nextId = 1;

		return NextResponse.json({
			success: true,
			data: { deletedCount },
			message: `Deleted ${deletedCount} price tags successfully`,
		});
	} catch (error) {
		console.error("Error deleting all price tags:", error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
