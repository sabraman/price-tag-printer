import type { Metadata } from 'next';
import '@/index.css';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Price Tag Generator',
  description: 'Generate and print price tags with various themes and designs',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}