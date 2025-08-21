"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getDomainSettingsFromUrl } from "@/hooks/useDomainSettings";
import { hasDomainCustomization, getDomainConfigName } from "@/config/domain-settings";

/**
 * Test component to demonstrate domain-specific settings
 * Shows how different domains get different configurations
 */
export function DomainSettingsTest() {
  const [testUrl, setTestUrl] = useState("https://print.archsmoke.ru");
  const [testResult, setTestResult] = useState<any>(null);

  const handleTest = () => {
    try {
      const settings = getDomainSettingsFromUrl(testUrl);
      const hostname = new URL(testUrl).hostname;
      const hasCustomization = hasDomainCustomization(hostname);
      const configName = getDomainConfigName(hostname);
      
      setTestResult({
        hostname,
        hasCustomization,
        configName,
        settings,
      });
    } catch (error) {
      setTestResult({
        error: error instanceof Error ? error.message : "Invalid URL",
      });
    }
  };

  const testUrls = [
    "https://print.archsmoke.ru",
    "https://vapar-print.vercel.app", 
    "https://example.com",
    "https://localhost:3000",
  ];

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-lg">🌐 Domain Settings Test</CardTitle>
        <CardDescription>
          Test how different domains get different default settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="test-url">Test URL</Label>
          <div className="flex gap-2">
            <Input
              id="test-url"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="https://example.com"
            />
            <Button onClick={handleTest}>Test</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {testUrls.map((url) => (
            <Button
              key={url}
              variant="outline"
              size="sm"
              onClick={() => {
                setTestUrl(url);
                setTimeout(handleTest, 100);
              }}
              className="text-xs"
            >
              {new URL(url).hostname}
            </Button>
          ))}
        </div>

        {testResult && (
          <div className="mt-4 p-4 bg-muted rounded-lg space-y-3">
            {testResult.error ? (
              <div className="text-red-500">Error: {testResult.error}</div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Domain:</span>
                  <Badge variant="secondary">{testResult.hostname}</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Has Customization:</span>
                  <Badge variant={testResult.hasCustomization ? "default" : "outline"}>
                    {testResult.hasCustomization ? "✅ Yes" : "❌ No"}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Config Name:</span>
                  <Badge variant="outline">{testResult.configName}</Badge>
                </div>
                
                <div className="space-y-2">
                  <span className="text-sm font-medium">Settings:</span>
                  <div className="text-xs space-y-1">
                    <div>Font: <strong>{testResult.settings.font}</strong></div>
                    <div>Design Type: <strong>{testResult.settings.designType}</strong></div>
                    <div>Show Theme Labels: <strong>{testResult.settings.showThemeLabels ? "Yes" : "No"}</strong></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <span className="text-sm font-medium">Theme Preview:</span>
                  <div className="flex gap-1">
                    <div
                      className="h-8 w-8 rounded border"
                      style={{
                        background: `linear-gradient(135deg, ${testResult.settings.themes.default.start}, ${testResult.settings.themes.default.end})`,
                      }}
                      title="Default"
                    />
                    <div
                      className="h-8 w-8 rounded border"
                      style={{
                        background: `linear-gradient(135deg, ${testResult.settings.themes.new.start}, ${testResult.settings.themes.new.end})`,
                      }}
                      title="New"
                    />
                    <div
                      className="h-8 w-8 rounded border"
                      style={{
                        background: `linear-gradient(135deg, ${testResult.settings.themes.sale.start}, ${testResult.settings.themes.sale.end})`,
                      }}
                      title="Sale"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}