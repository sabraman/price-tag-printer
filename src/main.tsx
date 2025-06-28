import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./utils/theme.ts";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";

const rootElement = document.getElementById("root");
if (rootElement) {
	ReactDOM.createRoot(rootElement).render(
		<React.StrictMode>
			<RouterProvider router={router} />
		</React.StrictMode>,
	);
}
