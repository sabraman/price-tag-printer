import {
	createRootRoute,
	createRoute,
	createRouter,
} from "@tanstack/react-router";
import { PriceTagsPage } from "@/components/features/price-tags/PriceTagsPage";
import { QrCodePage } from "@/components/features/qr/QrCodePage";
import App from "./App";

const rootRoute = createRootRoute({
	component: App,
});

const priceTagsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/",
	component: PriceTagsPage,
});

const qrCodeRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/marketing",
	component: QrCodePage,
});

const routeTree = rootRoute.addChildren([priceTagsRoute, qrCodeRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}
