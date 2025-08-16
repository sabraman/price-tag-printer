import { Inter, Montserrat, Nunito } from "next/font/google";

export const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	display: "swap",
	weight: ["400", "500", "600", "700"],
});

export const montserrat = Montserrat({
	subsets: ["latin"],
	variable: "--font-montserrat",
	display: "swap",
	weight: ["300", "400", "500", "600", "700", "900"],
});

export const nunito = Nunito({
	subsets: ["latin"],
	variable: "--font-nunito",
	display: "swap",
	weight: ["300", "400", "500", "600", "700", "900"],
}); 