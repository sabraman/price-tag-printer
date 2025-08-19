import type { Metadata } from "next";
import "./globals.css";
import "../App.css"; // Import Mont font
import { Toaster } from "sonner";
import FontLoader from "@/components/layout/FontLoader";
import { inter, montserrat, nunito } from "@/config/fonts";
import { metadata as siteMetadata } from "@/config/metadata";

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = siteMetadata;

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="ru" className="dark">
			<head>
				<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
				<link rel="icon" type="image/x-icon" href="/favicon.ico" />
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
			</head>
			<body
				className={`dark bg-background text-foreground ${montserrat.variable} ${inter.variable} ${nunito.variable} font-montserrat antialiased`}
			>
				<FontLoader />
				{children}
				<Toaster
					position="top-right"
					theme="dark"
					toastOptions={{
						style: {
							background: "hsl(var(--card))",
							color: "hsl(var(--card-foreground))",
							border: "1px solid hsl(var(--border))",
						},
					}}
				/>
			</body>
		</html>
	);
}
