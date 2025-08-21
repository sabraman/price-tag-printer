# Price Tag API Documentation

A comprehensive REST API for creating, managing, and generating PDF/HTML for price tags.

## Table of Contents

- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Data Models](#data-models)
- [API Endpoints](#api-endpoints)
  - [Price Tags CRUD](#price-tags-crud)
  - [PDF Generation](#pdf-generation)
  - [HTML Generation](#html-generation)
  - [File Processing](#file-processing)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Examples](#examples)

## Overview

The Price Tag API provides a complete solution for managing price tags, including:
- CRUD operations for price tags
- Bulk operations
- PDF generation with customizable themes
- HTML generation for preview
- Excel file processing
- Filtering and pagination

## Base URL

```
https://your-domain.com/api
```

## Authentication

Currently, the API does not require authentication. In production, implement proper authentication mechanisms.

## Data Models

### Item
```typescript
interface Item {
  id: number;                    // Unique identifier
  data: string | number;         // Product name or identifier
  price: number;                 // Main price
  discountPrice: number;         // Calculated discount price
  designType?: string;           // Theme type (optional)
  hasDiscount?: boolean;         // Whether discount applies (optional)
  priceFor2?: number;           // Price for 2 items (optional)
  priceFrom3?: number;          // Price for 3+ items (optional)
}
```

### Theme
```typescript
interface Theme {
  start: string;      // Gradient start color (hex)
  end: string;        // Gradient end color (hex)
  textColor: string;  // Text color (hex)
}
```

### PriceTagSettings
```typescript
interface PriceTagSettings {
  design: boolean;                    // Enable discount display
  designType: string;                 // Global design type
  discountAmount: number;             // Fixed discount amount
  maxDiscountPercent: number;         // Maximum discount percentage
  themes: ThemeSet;                   // Theme configurations
  currentFont: string;                // Font family
  discountText: string;               // Discount description text
  hasTableDesigns: boolean;           // Use per-item designs
  hasTableDiscounts: boolean;         // Use per-item discounts
  showThemeLabels: boolean;           // Show NEW/SALE labels
  cuttingLineColor: string;           // Cutting line color
}
```

## API Endpoints

### Price Tags CRUD

#### Get All Price Tags
```http
GET /api/price-tags
```

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `search` (string, optional): Search in product names
- `designType` (string, optional): Filter by design type
- `hasDiscount` (boolean, optional): Filter by discount status
- `minPrice` (number, optional): Minimum price filter
- `maxPrice` (number, optional): Maximum price filter
- `sortBy` (string, optional): Sort field
- `sortOrder` ('asc' | 'desc', optional): Sort direction

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "data": "Product Name",
        "price": 1000,
        "discountPrice": 500,
        "designType": "new"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

#### Get Single Price Tag
```http
GET /api/price-tags/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "data": "Product Name",
    "price": 1000,
    "discountPrice": 500,
    "designType": "new"
  }
}
```

#### Create Price Tag
```http
POST /api/price-tags
```

**Request Body:**
```json
{
  "data": "Product Name",
  "price": 1000,
  "designType": "new",
  "hasDiscount": true,
  "priceFor2": 1800,
  "priceFrom3": 2500
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "data": "Product Name",
    "price": 1000,
    "discountPrice": 500,
    "designType": "new",
    "hasDiscount": true,
    "priceFor2": 1800,
    "priceFrom3": 2500
  },
  "message": "Price tag created successfully"
}
```

#### Bulk Create Price Tags
```http
POST /api/price-tags
```

**Request Body:**
```json
{
  "items": [
    {
      "data": "Product 1",
      "price": 1000,
      "designType": "new"
    },
    {
      "data": "Product 2", 
      "price": 1500,
      "designType": "sale"
    }
  ]
}
```

#### Update Price Tag
```http
PUT /api/price-tags/{id}
```

**Request Body:**
```json
{
  "data": "Updated Product Name",
  "price": 1200,
  "designType": "sale"
}
```

#### Delete Price Tag
```http
DELETE /api/price-tags/{id}
```

#### Delete All Price Tags
```http
DELETE /api/price-tags
```

### PDF Generation

#### Generate PDF (Enhanced v2)
```http
POST /api/generate-pdf-v2
```

**Request Body:**
```json
{
  "items": [
    {
      "id": 1,
      "data": "Product Name",
      "price": 1000,
      "discountPrice": 500
    }
  ],
  "settings": {
    "design": true,
    "designType": "new",
    "currentFont": "montserrat",
    "showThemeLabels": true
  },
  "format": "A4",
  "margin": {
    "top": "10mm",
    "right": "10mm",
    "bottom": "10mm",
    "left": "10mm"
  }
}
```

**Response:** Binary PDF file

#### Get PDF Generation Info
```http
GET /api/generate-pdf-v2
```

**Response:**
```json
{
  "success": true,
  "data": {
    "supportedFormats": ["A4", "A3", "Letter"],
    "defaultFormat": "A4",
    "supportedFonts": ["montserrat", "nunito", "inter", "mont"],
    "supportedDesignTypes": ["default", "new", "sale", "white", "black"],
    "maxItemsPerRequest": 1000,
    "version": "2.0"
  }
}
```

### HTML Generation

#### Generate HTML
```http
POST /api/generate-html
```

**Request Body:**
```json
{
  "items": [
    {
      "id": 1,
      "data": "Product Name", 
      "price": 1000,
      "discountPrice": 500
    }
  ],
  "settings": {
    "design": true,
    "designType": "new",
    "currentFont": "montserrat"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "html": "<!DOCTYPE html>...",
    "itemCount": 1
  },
  "message": "HTML generated successfully for 1 items"
}
```

### File Processing

#### Process Excel File
```http
POST /api/process-excel
```

**Request Body:**
```json
{
  "fileData": [/* array of bytes */],
  "fileName": "products.xlsx"
}
```

**Response:**
```json
{
  "success": true,
  "items": [
    {
      "data": "Product Name",
      "price": 1000,
      "designType": "new"
    }
  ],
  "count": 1
}
```

## Response Format

All API responses follow this structure:

```typescript
interface ApiResponse<T = any> {
  success: boolean;    // Operation success status
  data?: T;           // Response data (when successful)
  error?: string;     // Error message (when failed)
  message?: string;   // Additional information
}
```

## Error Handling

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

### Error Response Example

```json
{
  "success": false,
  "error": "Price must be a positive number"
}
```

## Design Types

Available design types for themes:
- `default` - Standard gradient theme
- `new` - Green theme for new products
- `sale` - Red theme for sale items
- `white` - White background theme
- `black` - Black background theme
- `sunset` - Orange gradient theme
- `ocean` - Blue gradient theme
- `forest` - Green gradient theme
- `royal` - Purple gradient theme
- `vintage` - Brown gradient theme
- `neon` - Bright neon theme
- `monochrome` - Gray theme
- `silver` - Silver theme
- `charcoal` - Dark theme
- `paper` - Light paper theme
- `ink` - Dark ink theme
- `snow` - White/light theme

## Font Options

Supported fonts:
- `montserrat` (default)
- `nunito`
- `inter`
- `mont`

## Examples

### Complete Workflow Example

1. **Create price tags**:
```bash
curl -X POST /api/price-tags \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"data": "Premium Coffee", "price": 1200, "designType": "new"},
      {"data": "Organic Tea", "price": 800, "designType": "sale"}
    ]
  }'
```

2. **Get all price tags**:
```bash
curl /api/price-tags?limit=20&sortBy=price&sortOrder=desc
```

3. **Generate PDF**:
```bash
curl -X POST /api/generate-pdf-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "id": 1,
        "data": "Premium Coffee",
        "price": 1200,
        "discountPrice": 700,
        "designType": "new"
      }
    ],
    "settings": {
      "design": true,
      "designType": "new",
      "currentFont": "montserrat",
      "showThemeLabels": true
    },
    "format": "A4"
  }' \
  --output price-tags.pdf
```

4. **Generate HTML preview**:
```bash
curl -X POST /api/generate-html \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "id": 1,
        "data": "Premium Coffee",
        "price": 1200,
        "discountPrice": 700
      }
    ],
    "settings": {
      "design": true,
      "designType": "new"
    }
  }'
```

### Excel File Processing Example

```bash
# First, convert your Excel file to base64 or byte array
curl -X POST /api/process-excel \
  -H "Content-Type: application/json" \
  -d '{
    "fileData": [/* byte array from Excel file */],
    "fileName": "products.xlsx"
  }'
```

## Rate Limits

- Maximum 1000 items per PDF/HTML generation request
- No rate limiting currently implemented (add in production)

## Notes

- All prices should be in the smallest currency unit (e.g., cents)
- IDs are auto-generated and sequential
- Discount prices are automatically calculated based on settings
- PDF generation requires the items to have valid `id` fields
- HTML generation includes print styles and controls