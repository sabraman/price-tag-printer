import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{
			url: siteConfig.url,
			changeFrequency: "weekly",
			priority: 1,
		},
		{
			url: `${siteConfig.url}/api-docs`,
			changeFrequency: "monthly",
			priority: 0.9,
		},
		{
			url: `${siteConfig.url}/api-health`,
			changeFrequency: "daily",
			priority: 0.5,
		},
		{
			url: `${siteConfig.url}/marketing`,
			changeFrequency: "monthly",
			priority: 0.5,
		},
	];
}
