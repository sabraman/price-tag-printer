"use client";

import { useEffect, useState } from "react";
import {
	type DomainSettings,
	getDomainConfigName,
	getDomainSettings,
	hasDomainCustomization,
} from "@/config/domain-settings";

/**
 * Hook to detect current domain and return appropriate settings
 * Works both on client and server side with proper hydration
 */
export function useDomainSettings() {
	const [hostname, setHostname] = useState<string | null>(null);
	const [isHydrated, setIsHydrated] = useState(false);

	// Detect hostname on client side only
	useEffect(() => {
		if (typeof window !== "undefined") {
			setHostname(window.location.hostname);
			setIsHydrated(true);
		}
	}, []);

	// Get settings based on detected hostname
	const settings: DomainSettings = getDomainSettings(hostname || undefined);
	const hasCustomization = hasDomainCustomization(hostname || undefined);
	const configName = getDomainConfigName(hostname || undefined);

	return {
		hostname,
		settings,
		hasCustomization,
		configName,
		isHydrated, // Use this to avoid hydration mismatches
	};
}

/**
 * Server-side utility to get domain settings from request headers
 * For use in API routes or server components
 */
export function getDomainSettingsFromHeaders(headers: Headers): DomainSettings {
	const host = headers.get("host");
	return getDomainSettings(host || undefined);
}

/**
 * Utility to get domain settings from a URL string
 * Useful for testing or when you have a specific URL to check
 */
export function getDomainSettingsFromUrl(url: string): DomainSettings {
	try {
		const parsedUrl = new URL(url);
		return getDomainSettings(parsedUrl.hostname);
	} catch {
		return getDomainSettings();
	}
}
