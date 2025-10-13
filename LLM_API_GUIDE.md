# Price Tag API - LLM Integration Guide

## Quick Start for AI Assistants

This API allows you to create professional price tags and generate PDFs. Perfect for retail, e-commerce, and inventory management applications.

### Base Information
- **Base URL**: `https://your-domain.com/api`
- **Authentication**: None required (open for testing)
- **Content-Type**: `application/json`
- **Response Format**: Consistent JSON with `success`, `data`, `message` structure

## Core Capabilities

### ✅ What This API Can Do
- Create individual or bulk price tags (up to 1000 at once)
- Generate professional PDFs in A4, A3, or Letter format
- Support 17 design themes (sale, new, premium, etc.)
- Handle multi-tier pricing (bulk discounts)
- Provide HTML previews before PDF generation
- Filter and paginate large datasets
- Real-time health monitoring

### 📝 Common Integration Patterns

**1. Simple Price Tag Creation**
```json
POST /api/price-tags
{
  "data": "Premium Coffee",
  "price": 1200,
  "designType": "new",
  "hasDiscount": true
}
```

**2. Bulk Price Tag Creation**
```json
POST /api/price-tags
{
  "items": [
    {"data": "Product A", "price": 1000, "designType": "sale"},
    {"data": "Product B", "price": 1500, "designType": "new"}
  ]
}
```

**3. PDF Generation**
```json
POST /api/generate-pdf-v2
{
  "items": [
    {"id": 1, "data": "Product", "price": 1200, "discountPrice": 700}
  ],
  "settings": {"design": true, "designType": "new"},
  "format": "A4"
}
```

## Function Definitions for LLM Integration

### createPriceTag
**Purpose**: Create a single price tag
**Parameters**:
- `data` (string, required): Product name
- `price` (integer, required): Price in cents/smallest currency unit
- `designType` (string, optional): Theme type (default, new, sale, white, black, sunset, ocean, forest, royal, vintage, neon, monochrome, silver, charcoal, paper, ink, snow)
- `hasDiscount` (boolean, optional): Show discount pricing
- `priceFor2` (integer, optional): Bulk price for 2 items
- `priceFrom3` (integer, optional): Bulk price for 3+ items

### createBulkPriceTags
**Purpose**: Create multiple price tags at once
**Parameters**:
- `items` (array, required): Array of price tag objects (max 1000)

### generatePDF
**Purpose**: Generate printable PDF from price tags
**Parameters**:
- `items` (array, required): Price tag data
- `format` (string, optional): "A4", "A3", or "Letter" (default: A4)
- `settings` (object, optional): Design and theme settings

### listPriceTags
**Purpose**: Retrieve price tags with filtering
**Parameters**:
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 10, max: 100)
- `search` (string, optional): Filter by product name
- `designType` (string, optional): Filter by theme
- `minPrice`, `maxPrice` (integer, optional): Price range filter

## Response Patterns

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Descriptive error message",
  "message": "Additional context if available"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "items": [/* price tag objects */],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## Design Types & Themes

**Available Themes**: default, new, sale, white, black, sunset, ocean, forest, royal, vintage, neon, monochrome, silver, charcoal, paper, ink, snow

**Theme Usage Guidelines**:
- `new`: For new product launches (shows "NEW" label)
- `sale`: For discounted items (shows "SALE" label)  
- `default`: Standard professional appearance
- Color themes: `sunset`, `ocean`, `forest`, `royal`, `vintage`, `neon`
- Minimal themes: `white`, `black`, `monochrome`, `paper`, `ink`, `snow`
- Premium themes: `silver`, `charcoal`

## Pricing Structure

**Price Format**: All prices are in smallest currency unit (cents for USD)
- `price`: Main product price
- `discountPrice`: Automatically calculated discount price
- `priceFor2`: Special price when buying 2 items
- `priceFrom3`: Special price when buying 3 or more items

**Example**: Product costing $12.00 should be sent as `1200`

## Error Handling

**Validation Errors**: Check required fields (data, price)
**Not Found Errors**: Invalid price tag ID
**Limit Errors**: Bulk operations limited to 1000 items

## Integration Examples

### E-commerce Integration
```javascript
// Create price tags from product catalog
const priceTags = products.map(product => ({
  data: product.name,
  price: product.price_cents,
  designType: product.is_on_sale ? 'sale' : 'default',
  hasDiscount: product.is_on_sale
}));

// Generate PDF for printing
const pdf = await fetch('/api/generate-pdf-v2', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    items: priceTags,
    format: 'A4',
    settings: {design: true}
  })
});
```

### Inventory Management Integration
```javascript
// Create price tags with bulk pricing
const inventory = await fetch('/api/price-tags', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    data: "Wholesale Item",
    price: 1000,     // $10.00 each
    priceFor2: 1800, // $18.00 for 2 ($9.00 each)
    priceFrom3: 2400 // $24.00 for 3+ ($8.00 each)
  })
});
```

## System Health & Monitoring

**Health Endpoint**: `/api/health`
- Returns system status, uptime, memory usage
- Lists all available endpoints
- Shows service configuration status

**OpenAPI Specification**: `/api/openapi`
- Complete function definitions for AI integration
- Schema validation rules
- Example requests and responses

## Getting Started Checklist

### For AI Assistant Integration:
1. ✅ Check API health: `GET /api/health`
2. ✅ Review available endpoints and capabilities
3. ✅ Test single price tag creation: `POST /api/price-tags`
4. ✅ Test PDF generation: `POST /api/generate-pdf-v2`
5. ✅ Implement error handling for validation
6. ✅ Set up bulk operations if needed

### Common Use Cases:
- **Retail Store**: Create sale price tags with discount themes
- **E-commerce**: Generate professional product tags for inventory
- **Event Management**: Create name tags or product displays
- **Wholesale**: Generate bulk pricing labels
- **Restaurant**: Create menu item price displays

## Support & Resources

- **API Documentation**: `/api-docs` (interactive playground)
- **Health Dashboard**: `/api-health` (real-time monitoring)
- **OpenAPI Spec**: `/openapi.json` (complete schema)

---

*This API is designed to be AI-assistant friendly with structured outputs, consistent schemas, and descriptive error messages.*