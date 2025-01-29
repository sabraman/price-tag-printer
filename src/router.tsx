import {
  createRouter,
  createRootRoute,
  createRoute,
} from "@tanstack/react-router";
import App from "./App";
import { PriceTagsPage, QrCodePage } from "./pages";

const rootRoute = createRootRoute({
  component: App,
});

const priceTagsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: PriceTagsPage,
});

// Temporarily hidden marketing/QR code route
// const qrCodeRoute = createRoute({
//   getParentRoute: () => rootRoute,
//   path: "/marketing",
//   component: QrCodePage,
// });

const routeTree = rootRoute.addChildren([priceTagsRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
