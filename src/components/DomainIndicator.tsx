"use client";

import { Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useDomainSettings } from "@/hooks/useDomainSettings";

/**
 * Small indicator showing the current domain configuration
 * Can be placed in headers, sidebars, or anywhere relevant
 */
export function DomainIndicator() {
	const { configName, hasCustomization, settings, hostname, isHydrated } =
		useDomainSettings();

	// Don't show anything until hydrated
	if (!isHydrated) {
		return null;
	}

	// Don't show if no customization
	if (!hasCustomization) {
		return null;
	}

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="h-8 px-2 text-xs gap-1.5 hover:bg-accent"
				>
					<Globe className="h-3 w-3" />
					{configName}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80 p-4" align="end">
				<div className="space-y-4">
					<div className="space-y-2">
						<h4 className="font-medium text-sm flex items-center gap-2">
							<Globe className="h-4 w-4" />
							Domain Configuration
						</h4>
						<div className="text-xs text-muted-foreground">
							Custom settings are active for this domain
						</div>
					</div>

					<div className="space-y-3">
						<div className="flex justify-between items-center">
							<span className="text-xs text-muted-foreground">Domain:</span>
							<Badge variant="secondary" className="text-xs">
								{hostname}
							</Badge>
						</div>

						<div className="flex justify-between items-center">
							<span className="text-xs text-muted-foreground">Config:</span>
							<Badge variant="outline" className="text-xs">
								{configName}
							</Badge>
						</div>

						<div className="flex justify-between items-center">
							<span className="text-xs text-muted-foreground">Font:</span>
							<Badge variant="outline" className="text-xs">
								{settings.font}
							</Badge>
						</div>

						<div className="space-y-2">
							<span className="text-xs text-muted-foreground">
								Theme Preview:
							</span>
							<div className="flex gap-1">
								<div
									className="h-6 w-6 rounded-sm border flex-1"
									style={{
										background: `linear-gradient(135deg, ${settings.themes.default.start}, ${settings.themes.default.end})`,
									}}
									title="Default theme"
								/>
								<div
									className="h-6 w-6 rounded-sm border flex-1"
									style={{
										background: `linear-gradient(135deg, ${settings.themes.new.start}, ${settings.themes.new.end})`,
									}}
									title="New theme"
								/>
								<div
									className="h-6 w-6 rounded-sm border flex-1"
									style={{
										background: `linear-gradient(135deg, ${settings.themes.sale.start}, ${settings.themes.sale.end})`,
									}}
									title="Sale theme"
								/>
							</div>
						</div>
					</div>

					<div className="pt-2 border-t">
						<div className="text-xs text-muted-foreground">
							💡 These settings are applied automatically when you visit this
							domain for the first time
						</div>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}

/**
 * Compact version that just shows a small badge
 */
export function DomainIndicatorCompact() {
	const { configName, hasCustomization, isHydrated } = useDomainSettings();

	if (!isHydrated || !hasCustomization) {
		return null;
	}

	return (
		<Badge variant="secondary" className="text-xs gap-1">
			<Globe className="h-3 w-3" />
			{configName}
		</Badge>
	);
}
