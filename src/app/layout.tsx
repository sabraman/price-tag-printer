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
		<html lang="en" className="dark">
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
			</head>
			<body
				className={`dark bg-background text-foreground ${inter.variable} ${montserrat.variable} ${nunito.variable} font-sans antialiased`}
			>
				<FontLoader />
				{children}
				<Toaster position="top-right" />
			</body>
		</html>
	);
}
