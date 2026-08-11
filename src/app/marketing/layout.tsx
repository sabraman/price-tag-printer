import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "QR-коды для товаров",
	description: "Создавайте QR-коды для ценников и товарных страниц.",
	alternates: {
		canonical: "/marketing",
	},
};

export default function MarketingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
