import type { Metadata } from "next";
import { Inter, Montserrat, Nunito } from "next/font/google";
import "./globals.css";
import "../App.css"; // Import Mont font
import { Toaster } from "sonner";
import FontLoader from "@/components/layout/FontLoader";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	display: "swap",
	weight: ["400", "500", "600", "700"],
});

const montserrat = Montserrat({
	subsets: ["latin"],
	variable: "--font-montserrat",
	display: "swap",
	weight: ["300", "400", "500", "600", "700", "900"],
});

const nunito = Nunito({
	subsets: ["latin"],
	variable: "--font-nunito",
	display: "swap",
	weight: ["300", "400", "500", "600", "700", "900"],
});

export const metadata: Metadata = {
	title: "Price Tag Generator",
	description: "Generate and print price tags with various themes and designs",
};

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
