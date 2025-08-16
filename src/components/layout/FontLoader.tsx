"use client";

import { useEffect } from "react";

const FontLoader = () => {
	useEffect(() => {
		// Load Google Fonts
		const link = document.createElement("link");
		link.href =
			"https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;900&family=Roboto:wght@300;400;500;700;900&family=Inter:wght@300;400;500;600;700;900&family=Open+Sans:wght@300;400;500;600;700;900&family=Nunito:wght@300;400;500;600;700;900&display=swap";
		link.rel = "stylesheet";
		document.head.appendChild(link);

		return () => {
			document.head.removeChild(link);
		};
	}, []);

	return null;
};

export default FontLoader;
