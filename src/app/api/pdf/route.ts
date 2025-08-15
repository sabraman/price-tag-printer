import { NextRequest, NextResponse } from 'next/server';
import { generatePDF, createPrintableHTML } from '@/lib/puppeteer';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticPriceTagsPage } from '@/components/features/price-tags/StaticPriceTagsPage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      items, 
      design, 
      designType, 
      themes, 
      font, 
      discountText, 
      useTableDesigns, 
      useTableDiscounts, 
      showThemeLabels, 
      cuttingLineColor 
    } = body;

    // Validate required fields
    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      );
    }

    // Render the static component to HTML
    const reactHTML = renderToStaticMarkup(
      StaticPriceTagsPage({
        items,
        design,
        designType,
        themes,
        font,
        discountText,
        useTableDesigns,
        useTableDiscounts,
        showThemeLabels,
        cuttingLineColor,
      })
    );

    // Create printable HTML with proper styling
    const printableHTML = createPrintableHTML(reactHTML);

    // Generate PDF using Puppeteer
    const pdfBuffer = await generatePDF({
      html: printableHTML,
      format: 'A4',
    });

    // Return PDF as downloadable file
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="price-tags.pdf"',
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'PDF generation endpoint is working' });
}