import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Статус API",
	description: "Проверка доступности и возможностей Price Tag API.",
	alternates: {
		canonical: "/api-health",
	},
};

export default function ApiHealthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
