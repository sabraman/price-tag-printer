import type { Metadata } from "next";
import "./globals.css";
import "../App.css"; // Import Mont font
import { Toaster } from "sonner";
import { DomainSettingsInitializer } from "@/components/DomainSettingsInitializer";
import FontLoader from "@/components/layout/FontLoader";
import Footer from "@/components/layout/Footer";
import { inter, montserrat, nunito } from "@/config/fonts";
import { metadata as siteMetadata } from "@/config/metadata";
import { siteConfig } from "@/config/site";

const structuredData = {
	"@context": "https://schema.org",
	"@type": "WebApplication",
	name: siteConfig.name,
	url: siteConfig.url,
	description: siteConfig.description,
	applicationCategory: "BusinessApplication",
	operatingSystem: "Web",
	inLanguage: "ru",
	featureList: [
		"Импорт товаров из Excel",
		"Импорт из Google Sheets",
		"Настройка дизайна ценников",
		"Генерация PDF для печати",
	],
	author: {
		"@type": "Person",
		name: "sabraman",
		url: "https://github.com/sabraman",
	},
	provider: {
		"@type": "Organization",
		name: siteConfig.name,
		url: siteConfig.url,
		sameAs: [siteConfig.githubUrl],
	},
};

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
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
				/>
			</head>
			<body
				className={`dark bg-background text-foreground ${montserrat.variable} ${inter.variable} ${nunito.variable} font-montserrat antialiased`}
			>
				<DomainSettingsInitializer />
				<FontLoader />
				<div className="min-h-screen flex flex-col">
					<main className="flex-1">{children}</main>
					<Footer />
				</div>
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
