import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: "*",
				allow: ["/", "/llms.txt", "/openapi.json"],
				disallow: ["/api/", "/_next/"],
			},
			{
				userAgent: [
					"GPTBot",
					"OAI-SearchBot",
					"ClaudeBot",
					"PerplexityBot",
					"Google-Extended",
				],
				allow: ["/", "/llms.txt", "/openapi.json"],
				disallow: ["/api/", "/_next/"],
			},
		],
		sitemap: `${siteConfig.url}/sitemap.xml`,
	};
}
