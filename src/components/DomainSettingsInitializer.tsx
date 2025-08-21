"use client";

import { useEffect, useRef } from "react";
import { usePriceTagsStore } from "@/store/priceTagsStore";
import { useDomainSettings } from "@/hooks/useDomainSettings";

/**
 * Component that initializes domain-specific settings
 * Should be rendered early in the app lifecycle
 */
export function DomainSettingsInitializer() {
  const { settings, hasCustomization, isHydrated, configName } = useDomainSettings();
  const hasInitialized = useRef(false);

  // Store actions
  const setThemes = usePriceTagsStore((state) => state.setThemes);
  const setCurrentFont = usePriceTagsStore((state) => state.setCurrentFont);
  const setDesignType = usePriceTagsStore((state) => state.setDesignType);
  const setDiscountText = usePriceTagsStore((state) => state.setDiscountText);
  const setShowThemeLabels = usePriceTagsStore((state) => state.setShowThemeLabels);

  // Get current store state to check if we should apply defaults
  const currentThemes = usePriceTagsStore((state) => state.themes);
  const currentFont = usePriceTagsStore((state) => state.currentFont);
  const items = usePriceTagsStore((state) => state.items);

  useEffect(() => {
    // Only run after hydration and only once
    if (!isHydrated || hasInitialized.current) {
      return;
    }

    // Only apply domain defaults if:
    // 1. There's a domain customization
    // 2. The store is in its initial state (no items loaded, using default themes)
    const isStoreInInitialState = 
      items.length === 0 && 
      currentThemes.default.start === "#222222" && 
      currentThemes.default.end === "#dd4c9b" &&
      currentFont === "montserrat";

    if (hasCustomization && isStoreInInitialState) {
      console.log(`🌐 Applying ${configName} domain settings`, settings);

      // Apply domain-specific settings
      setThemes(settings.themes);
      setCurrentFont(settings.font);
      setDesignType(settings.designType);
      setDiscountText(settings.discountText);
      setShowThemeLabels(settings.showThemeLabels);

      hasInitialized.current = true;
    } else if (hasCustomization) {
      console.log(`🌐 Domain settings available for ${configName} but store already initialized`);
      hasInitialized.current = true;
    } else {
      console.log("🌐 No domain customization found, using default settings");
      hasInitialized.current = true;
    }
  }, [
    isHydrated,
    hasCustomization,
    settings,
    configName,
    setThemes,
    setCurrentFont,
    setDesignType,
    setDiscountText,
    setShowThemeLabels,
    // Store state dependencies
    items.length,
    currentThemes.default.start,
    currentThemes.default.end,
    currentFont,
  ]);

  // This component doesn't render anything
  return null;
}

/**
 * Debug component to show current domain settings
 * Only renders in development or when explicitly enabled
 */
export function DomainSettingsDebug({ enabled = false }: { enabled?: boolean }) {
  const { hostname, configName, hasCustomization, settings, isHydrated } = useDomainSettings();

  if (!enabled || !isHydrated) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50 max-w-sm">
      <div className="font-bold mb-2">🌐 Domain Settings Debug</div>
      <div>Hostname: {hostname || "not detected"}</div>
      <div>Config: {configName}</div>
      <div>Has Customization: {hasCustomization ? "✅" : "❌"}</div>
      <div>Font: {settings.font}</div>
      <div>Design Type: {settings.designType}</div>
      <div className="mt-2 text-xs opacity-70">
        Theme: {settings.themes.default.start} → {settings.themes.default.end}
      </div>
    </div>
  );
}