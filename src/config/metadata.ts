import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
	metadataBase: new URL(siteConfig.url),
	title: {
		default: "Генератор ценников онлайн | Price Tag Generator",
		template: "%s | Price Tag Generator",
	},
	description: siteConfig.description,
	applicationName: siteConfig.name,
	keywords: [...siteConfig.keywords],
	authors: [{ name: "sabraman", url: siteConfig.githubUrl }],
	creator: "sabraman",
	publisher: siteConfig.name,
	alternates: {
		canonical: "/",
	},
	openGraph: {
		type: "website",
		locale: siteConfig.locale,
		url: siteConfig.url,
		siteName: siteConfig.name,
		title: "Генератор ценников онлайн | Price Tag Generator",
		description: siteConfig.description,
	},
	twitter: {
		card: "summary",
		title: "Генератор ценников онлайн | Price Tag Generator",
		description: siteConfig.description,
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-image-preview": "large",
			"max-snippet": -1,
			"max-video-preview": -1,
		},
	},
	icons: {
		icon: [
			{ url: "/favicon.svg", type: "image/svg+xml" },
			{ url: "/favicon.ico", type: "image/x-icon" },
		],
	},
};
