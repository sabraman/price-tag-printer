import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
	title: "API документация",
	description:
		"OpenAPI-совместимый API для создания ценников, массовых операций и генерации PDF, готовый для интеграций и AI-ассистентов.",
	alternates: {
		canonical: "/api-docs",
	},
	openGraph: {
		url: `${siteConfig.url}/api-docs`,
		title: "API документация | Price Tag Generator",
		description:
			"OpenAPI-совместимый API для создания ценников и генерации PDF.",
	},
};

export default function ApiDocsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
