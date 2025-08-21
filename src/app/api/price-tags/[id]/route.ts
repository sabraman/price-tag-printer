import { type NextRequest, NextResponse } from "next/server";
import type { ApiResponse, Item, UpdatePriceTagRequest } from "@/types/api";

// This would be imported from the main price-tags route in a real implementation
// For now, we'll access the same storage
const priceTagsStorage: Item[] = [];

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

// Helper function to validate update data
function validateUpdateData(data: UpdatePriceTagRequest): string | null {
	if (
		data.data !== undefined &&
		typeof data.data !== "string" &&
		typeof data.data !== "number"
	) {
		return "Data field must be a string or number";
	}

	if (
		data.price !== undefined &&
		(typeof data.price !== "number" || data.price <= 0)
	) {
		return "Price must be a positive number";
	}

	if (
		data.designType !== undefined &&
		data.designType !== null &&
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
		data.priceFor2 !== undefined &&
		data.priceFor2 !== null &&
		(typeof data.priceFor2 !== "number" || data.priceFor2 <= 0)
	) {
		return "priceFor2 must be a positive number";
	}

	if (
		data.priceFrom3 !== undefined &&
		data.priceFrom3 !== null &&
		(typeof data.priceFrom3 !== "number" || data.priceFrom3 <= 0)
	) {
		return "priceFrom3 must be a positive number";
	}

	return null;
}

// GET /api/price-tags/[id] - Get specific price tag
export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApiResponse<Item>>> {
	const { id: idParam } = await params;
	try {
		const id = parseInt(idParam);

		if (Number.isNaN(id)) {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid ID format",
				},
				{ status: 400 },
			);
		}

		const item = priceTagsStorage.find((item) => item.id === id);

		if (!item) {
			return NextResponse.json(
				{
					success: false,
					error: "Price tag not found",
				},
				{ status: 404 },
			);
		}

		return NextResponse.json({
			success: true,
			data: item,
		});
	} catch (error) {
		console.error("Error fetching price tag:", error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}

// PUT /api/price-tags/[id] - Update specific price tag
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApiResponse<Item>>> {
	const { id: idParam } = await params;
	try {
		const id = parseInt(idParam);

		if (Number.isNaN(id)) {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid ID format",
				},
				{ status: 400 },
			);
		}

		const updateData = (await request.json()) as UpdatePriceTagRequest;
		const validationError = validateUpdateData(updateData);

		if (validationError) {
			return NextResponse.json(
				{
					success: false,
					error: validationError,
				},
				{ status: 400 },
			);
		}

		const itemIndex = priceTagsStorage.findIndex((item) => item.id === id);

		if (itemIndex === -1) {
			return NextResponse.json(
				{
					success: false,
					error: "Price tag not found",
				},
				{ status: 404 },
			);
		}

		const currentItem = priceTagsStorage[itemIndex];
		const updatedItem: Item = {
			...currentItem,
			...updateData,
		};

		// Recalculate discount price if price was updated
		if (updateData.price !== undefined) {
			updatedItem.discountPrice = calculateDiscountPrice(updateData.price);
		}

		priceTagsStorage[itemIndex] = updatedItem;

		return NextResponse.json({
			success: true,
			data: updatedItem,
			message: "Price tag updated successfully",
		});
	} catch (error) {
		console.error("Error updating price tag:", error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}

// PATCH /api/price-tags/[id] - Partially update specific price tag
export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApiResponse<Item>>> {
	// Same logic as PUT for partial updates
	return PUT(request, { params });
}

// DELETE /api/price-tags/[id] - Delete specific price tag
export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApiResponse<{ id: number }>>> {
	const { id: idParam } = await params;
	try {
		const id = parseInt(idParam);

		if (Number.isNaN(id)) {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid ID format",
				},
				{ status: 400 },
			);
		}

		const itemIndex = priceTagsStorage.findIndex((item) => item.id === id);

		if (itemIndex === -1) {
			return NextResponse.json(
				{
					success: false,
					error: "Price tag not found",
				},
				{ status: 404 },
			);
		}

		priceTagsStorage.splice(itemIndex, 1);

		return NextResponse.json({
			success: true,
			data: { id },
			message: "Price tag deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting price tag:", error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
