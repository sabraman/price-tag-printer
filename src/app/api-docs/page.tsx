"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Copy,
	ExternalLink,
	Play,
	Download,
	Zap,
	Shield,
	Globe,
	Bot,
} from "lucide-react";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - RequestInit is available in the Web Fetch API runtime
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type __RequestInit = RequestInit;

interface ApiEndpoint {
	method: string;
	path: string;
	description: string;
	parameters?: string[];
	requestBody?: any;
	responses: { [key: string]: string };
}

const apiEndpoints: ApiEndpoint[] = [
	{
		method: "GET",
		path: "/api/health",
		description: "Check API health status and get service information",
		responses: {
			"200": "Health status and service info",
		},
	},
	{
		method: "GET",
		path: "/api/price-tags",
		description: "Get all price tags with filtering and pagination",
		parameters: [
			"page",
			"limit",
			"search",
			"designType",
			"hasDiscount",
			"minPrice",
			"maxPrice",
			"sortBy",
			"sortOrder",
		],
		responses: {
			"200": "Paginated list of price tags",
		},
	},
	{
		method: "POST",
		path: "/api/price-tags",
		description: "Create new price tag(s) - single or bulk",
		requestBody: {
			data: "Product Name",
			price: 1000,
			designType: "new",
			hasDiscount: true,
		},
		responses: {
			"201": "Price tag created successfully",
			"400": "Validation error",
		},
	},
	{
		method: "GET",
		path: "/api/price-tags/{id}",
		description: "Get specific price tag by ID",
		responses: {
			"200": "Price tag details",
			"404": "Price tag not found",
		},
	},
	{
		method: "PUT",
		path: "/api/price-tags/{id}",
		description: "Update specific price tag",
		requestBody: {
			data: "Updated Product Name",
			price: 1200,
		},
		responses: {
			"200": "Price tag updated successfully",
			"404": "Price tag not found",
		},
	},
	{
		method: "DELETE",
		path: "/api/price-tags/{id}",
		description: "Delete specific price tag",
		responses: {
			"200": "Price tag deleted successfully",
			"404": "Price tag not found",
		},
	},
	{
		method: "POST",
		path: "/api/generate-pdf-v2",
		description: "Generate PDF from price tags with full customization",
		requestBody: {
			items: [{ id: 1, data: "Product", price: 1000 }],
			settings: { design: true, designType: "new" },
			format: "A4",
		},
		responses: {
			"200": "PDF file (binary)",
			"400": "Validation error",
		},
	},
	{
		method: "POST",
		path: "/api/generate-html",
		description: "Generate HTML preview of price tags",
		requestBody: {
			items: [{ id: 1, data: "Product", price: 1000 }],
			settings: { design: true },
		},
		responses: {
			"200": "HTML content and metadata",
		},
	},
];

const ApiTestingPlayground: React.FC = () => {
	const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint>(
		apiEndpoints[0],
	);
	const [requestBody, setRequestBody] = useState<string>("");
	const [apiKey, setApiKey] = useState<string>("");
	const [response, setResponse] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);

	const handleTest = async () => {
		setLoading(true);
		try {
			const url = selectedEndpoint.path.replace("{id}", "1"); // Example ID
			const options: RequestInit = {
				method: selectedEndpoint.method,
				headers: {
					"Content-Type": "application/json",
					...(apiKey && { Authorization: `Bearer ${apiKey}` }),
				},
			};

			if (selectedEndpoint.method !== "GET" && requestBody) {
				options.body = requestBody;
			}

			const res = await fetch(url, options);
			const data =
				selectedEndpoint.path === "/api/generate-pdf-v2"
					? "[PDF Binary Data]"
					: JSON.stringify(await res.json(), null, 2);

			setResponse(`Status: ${res.status}\n\n${data}`);
		} catch (error) {
			setResponse(
				`Error: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		} finally {
			setLoading(false);
		}
	};

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
			<div className="container mx-auto py-8 px-4 max-w-7xl">
				{/* Hero Section */}
				<div className="text-center mb-12 py-12">
					<div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-primary/10 rounded-full">
						<Bot className="h-4 w-4 text-primary" />
						<span className="text-sm font-medium text-primary">
							LLM-Friendly API
						</span>
					</div>
					<h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
						Price Tag API
					</h1>
					<p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
						Professional REST API for creating, managing, and generating price
						tags. Optimized for AI assistants and LLM function calling.
					</p>

					{/* Feature Pills */}
					<div className="flex flex-wrap justify-center gap-3 mb-8">
						<div className="flex items-center gap-2 px-4 py-2 bg-card/50 rounded-full border">
							<Zap className="h-4 w-4 text-yellow-500" />
							<span className="text-sm font-medium">
								Function Calling Ready
							</span>
						</div>
						<div className="flex items-center gap-2 px-4 py-2 bg-card/50 rounded-full border">
							<Shield className="h-4 w-4 text-green-500" />
							<span className="text-sm font-medium">Type-Safe</span>
						</div>
						<div className="flex items-center gap-2 px-4 py-2 bg-card/50 rounded-full border">
							<Globe className="h-4 w-4 text-blue-500" />
							<span className="text-sm font-medium">OpenAPI 3.0</span>
						</div>
					</div>

					{/* Quick Actions */}
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button
							size="lg"
							className="px-8"
							onClick={() =>
								copyToClipboard(
									JSON.stringify(
										{
											openapi: "3.0.3",
											info: { title: "Price Tag API", version: "1.0.0" },
											servers: [
												{
													url:
														typeof window !== "undefined"
															? `${window.location.origin}/api`
															: "https://your-domain.com/api",
												},
											],
										},
										null,
										2,
									),
								)
							}
						>
							<Download className="h-4 w-4 mr-2" />
							Download OpenAPI Spec
						</Button>
						<Button
							size="lg"
							variant="outline"
							className="px-8"
							onClick={() =>
								window.open(
									`${typeof window !== "undefined" ? window.location.origin : ""}/api/health`,
									"_blank",
								)
							}
						>
							<ExternalLink className="h-4 w-4 mr-2" />
							API Health Check
						</Button>
					</div>
				</div>

				<Tabs defaultValue="overview" className="w-full">
					<TabsList className="grid w-full grid-cols-5 bg-card/50 backdrop-blur-sm">
						<TabsTrigger value="overview">Overview</TabsTrigger>
						<TabsTrigger value="llm-integration">LLM Integration</TabsTrigger>
						<TabsTrigger value="endpoints">Endpoints</TabsTrigger>
						<TabsTrigger value="playground">Playground</TabsTrigger>
						<TabsTrigger value="examples">Examples</TabsTrigger>
					</TabsList>

					<TabsContent value="overview" className="space-y-8">
						{/* Quick Stats */}
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							<Card className="text-center bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
								<CardContent className="pt-6">
									<div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
										8
									</div>
									<div className="text-sm text-blue-600/80 dark:text-blue-400/80">
										API Endpoints
									</div>
								</CardContent>
							</Card>
							<Card className="text-center bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 border-green-200 dark:border-green-800">
								<CardContent className="pt-6">
									<div className="text-2xl font-bold text-green-600 dark:text-green-400">
										17
									</div>
									<div className="text-sm text-green-600/80 dark:text-green-400/80">
										Design Themes
									</div>
								</CardContent>
							</Card>
							<Card className="text-center bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
								<CardContent className="pt-6">
									<div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
										1000
									</div>
									<div className="text-sm text-purple-600/80 dark:text-purple-400/80">
										Max Items/Request
									</div>
								</CardContent>
							</Card>
							<Card className="text-center bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20 border-orange-200 dark:border-orange-800">
								<CardContent className="pt-6">
									<div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
										3
									</div>
									<div className="text-sm text-orange-600/80 dark:text-orange-400/80">
										PDF Formats
									</div>
								</CardContent>
							</Card>
						</div>

						{/* API Configuration */}
						<Card className="bg-gradient-to-r from-card/50 to-card/30 backdrop-blur-sm">
							<CardHeader>
								<CardTitle className="text-2xl">API Configuration</CardTitle>
								<CardDescription>
									Essential information for integrating with the Price Tag API
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
									<div className="space-y-2">
										<div className="flex items-center gap-2">
											<Globe className="h-4 w-4 text-primary" />
											<Label className="text-sm font-semibold">Base URL</Label>
										</div>
										<div className="bg-muted/50 p-3 rounded-lg font-mono text-sm border">
											{typeof window !== "undefined"
												? window.location.origin
												: "https://your-domain.com"}
											/api
										</div>
										<Button
											variant="ghost"
											size="sm"
											onClick={() =>
												copyToClipboard(
													typeof window !== "undefined"
														? `${window.location.origin}/api`
														: "https://your-domain.com/api",
												)
											}
											className="h-8 px-2"
										>
											<Copy className="h-3 w-3" />
										</Button>
									</div>

									<div className="space-y-2">
										<div className="flex items-center gap-2">
											<Shield className="h-4 w-4 text-green-500" />
											<Label className="text-sm font-semibold">
												Authentication
											</Label>
										</div>
										<Badge
											variant="secondary"
											className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
										>
											No Authentication Required
										</Badge>
										<p className="text-xs text-muted-foreground">
											Currently open for testing. Production should implement
											proper auth.
										</p>
									</div>

									<div className="space-y-2">
										<div className="flex items-center gap-2">
											<Zap className="h-4 w-4 text-yellow-500" />
											<Label className="text-sm font-semibold">
												Response Format
											</Label>
										</div>
										<div className="bg-muted/50 p-3 rounded-lg">
											<code className="text-sm">application/json</code>
										</div>
										<p className="text-xs text-muted-foreground">
											Consistent response structure for all endpoints
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Core Features */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							<Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/50 dark:border-blue-800/50">
								<CardHeader>
									<CardTitle className="text-lg flex items-center gap-2">
										<div className="h-8 w-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
											📝
										</div>
										CRUD Operations
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-2">
									<p className="text-sm text-muted-foreground">
										Complete price tag lifecycle management with validation
									</p>
									<ul className="text-sm space-y-1">
										<li>• Create single or bulk price tags</li>
										<li>• Update with automatic recalculation</li>
										<li>• Delete with confirmation</li>
										<li>• List with filtering & pagination</li>
									</ul>
								</CardContent>
							</Card>

							<Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200/50 dark:border-green-800/50">
								<CardHeader>
									<CardTitle className="text-lg flex items-center gap-2">
										<div className="h-8 w-8 bg-green-500/20 rounded-lg flex items-center justify-center">
											📄
										</div>
										PDF Generation
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-2">
									<p className="text-sm text-muted-foreground">
										High-quality PDF export with professional layouts
									</p>
									<ul className="text-sm space-y-1">
										<li>• A4, A3, Letter formats</li>
										<li>• Custom margins & spacing</li>
										<li>• Print-ready cutting lines</li>
										<li>• Batch processing up to 1000 items</li>
									</ul>
								</CardContent>
							</Card>

							<Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200/50 dark:border-purple-800/50">
								<CardHeader>
									<CardTitle className="text-lg flex items-center gap-2">
										<div className="h-8 w-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
											🎨
										</div>
										17 Design Themes
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-2">
									<p className="text-sm text-muted-foreground">
										Professional themes for every use case
									</p>
									<ul className="text-sm space-y-1">
										<li>• Sale, New, Default themes</li>
										<li>• Gradient and solid colors</li>
										<li>• Custom brand colors</li>
										<li>• Theme labels (NEW/SALE)</li>
									</ul>
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					<TabsContent value="llm-integration" className="space-y-8">
						{/* LLM Integration Guide */}
						<Card className="bg-gradient-to-br from-violet-500/10 to-purple-600/5 border-violet-200/50 dark:border-violet-800/50">
							<CardHeader>
								<CardTitle className="text-2xl flex items-center gap-3">
									<Bot className="h-8 w-8 text-violet-600" />
									LLM Function Calling Integration
								</CardTitle>
								<CardDescription>
									This API is optimized for AI assistants and Large Language
									Models with structured outputs and function calling.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								{/* OpenAPI Spec Download */}
								<div className="bg-muted/30 p-6 rounded-xl border-2 border-dashed border-muted-foreground/20">
									<h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
										<Globe className="h-5 w-5 text-blue-500" />
										OpenAPI 3.0 Specification
									</h4>
									<p className="text-muted-foreground mb-4">
										Download the complete OpenAPI spec for function calling
										integration with ChatGPT, Claude, and other LLMs.
									</p>
									<div className="flex gap-3">
										<Button
											onClick={() => window.open("/openapi.json", "_blank")}
											className="flex-1"
										>
											<Download className="h-4 w-4 mr-2" />
											Download openapi.json
										</Button>
										<Button
											variant="outline"
											onClick={() =>
												copyToClipboard(
													`${typeof window !== "undefined" ? window.location.origin : "https://your-domain.com"}/openapi.json`,
												)
											}
										>
											<Copy className="h-4 w-4" />
										</Button>
									</div>
								</div>

								{/* Function Calling Examples */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-4">
										<h4 className="text-lg font-semibold">
											OpenAI Function Calling
										</h4>
										<div className="bg-muted/50 p-4 rounded-lg">
											<pre className="text-xs overflow-x-auto">
												{`{
  "name": "createPriceTags",
  "description": "Create price tags for products",
  "parameters": {
    "type": "object",
    "properties": {
      "items": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "data": {"type": "string"},
            "price": {"type": "integer"},
            "designType": {"type": "string"}
          }
        }
      }
    }
  }
}`}
											</pre>
										</div>
									</div>

									<div className="space-y-4">
										<h4 className="text-lg font-semibold">
											Claude Function Usage
										</h4>
										<div className="bg-muted/50 p-4 rounded-lg">
											<pre className="text-xs overflow-x-auto">
												{`<function_calls>
<invoke name="createPriceTags">
<parameter name="items">
[{
  "data": "Premium Coffee",
  "price": 1200,
  "designType": "new"
}]
</parameter>
</invoke>
</function_calls>`}
											</pre>
										</div>
									</div>
								</div>

								{/* LLM Best Practices */}
								<div className="space-y-4">
									<h4 className="text-lg font-semibold">
										Best Practices for LLM Integration
									</h4>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<div className="flex items-center gap-2">
												<div className="h-2 w-2 bg-green-500 rounded-full" />
												<span className="text-sm font-medium">
													Structured Outputs
												</span>
											</div>
											<p className="text-sm text-muted-foreground ml-4">
												All responses follow consistent JSON schema for reliable
												parsing
											</p>
										</div>

										<div className="space-y-2">
											<div className="flex items-center gap-2">
												<div className="h-2 w-2 bg-blue-500 rounded-full" />
												<span className="text-sm font-medium">
													Descriptive Errors
												</span>
											</div>
											<p className="text-sm text-muted-foreground ml-4">
												Human-readable error messages for better LLM
												understanding
											</p>
										</div>

										<div className="space-y-2">
											<div className="flex items-center gap-2">
												<div className="h-2 w-2 bg-purple-500 rounded-full" />
												<span className="text-sm font-medium">
													Batch Operations
												</span>
											</div>
											<p className="text-sm text-muted-foreground ml-4">
												Bulk create/update reduces API calls for efficiency
											</p>
										</div>

										<div className="space-y-2">
											<div className="flex items-center gap-2">
												<div className="h-2 w-2 bg-orange-500 rounded-full" />
												<span className="text-sm font-medium">Validation</span>
											</div>
											<p className="text-sm text-muted-foreground ml-4">
												Comprehensive input validation prevents errors
											</p>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="endpoints" className="space-y-4">
						<div className="grid gap-4">
							{apiEndpoints.map((endpoint, index) => (
								<Card key={index}>
									<CardHeader>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<Badge
													variant={
														endpoint.method === "GET"
															? "default"
															: endpoint.method === "POST"
																? "destructive"
																: endpoint.method === "PUT"
																	? "secondary"
																	: "outline"
													}
												>
													{endpoint.method}
												</Badge>
												<code className="font-mono text-sm">
													{endpoint.path}
												</code>
											</div>
											<Button
												variant="outline"
												size="sm"
												onClick={() => copyToClipboard(endpoint.path)}
											>
												<Copy className="h-4 w-4" />
											</Button>
										</div>
									</CardHeader>
									<CardContent>
										<p className="text-sm text-muted-foreground mb-4">
											{endpoint.description}
										</p>

										{endpoint.parameters && (
											<div className="mb-4">
												<h4 className="font-medium mb-2">Query Parameters:</h4>
												<div className="flex flex-wrap gap-1">
													{endpoint.parameters.map((param) => (
														<Badge
															key={param}
															variant="outline"
															className="text-xs"
														>
															{param}
														</Badge>
													))}
												</div>
											</div>
										)}

										{endpoint.requestBody && (
											<div className="mb-4">
												<h4 className="font-medium mb-2">Request Body:</h4>
												<pre className="text-xs bg-muted p-3 rounded overflow-auto">
													{JSON.stringify(endpoint.requestBody, null, 2)}
												</pre>
											</div>
										)}

										<div>
											<h4 className="font-medium mb-2">Responses:</h4>
											<div className="space-y-1">
												{Object.entries(endpoint.responses).map(
													([code, desc]) => (
														<div
															key={code}
															className="flex items-center gap-2 text-sm"
														>
															<Badge variant="outline">{code}</Badge>
															<span className="text-muted-foreground">
																{desc}
															</span>
														</div>
													),
												)}
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</TabsContent>

					<TabsContent value="playground" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>API Testing Playground</CardTitle>
								<CardDescription>
									Test API endpoints directly from your browser
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-4">
										<div>
											<Label htmlFor="endpoint">Select Endpoint</Label>
											<Select
												value={`${selectedEndpoint.method} ${selectedEndpoint.path}`}
												onValueChange={(value) => {
													const endpoint = apiEndpoints.find(
														(e) => `${e.method} ${e.path}` === value,
													);
													if (endpoint) {
														setSelectedEndpoint(endpoint);
														setRequestBody(
															endpoint.requestBody
																? JSON.stringify(endpoint.requestBody, null, 2)
																: "",
														);
													}
												}}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{apiEndpoints.map((endpoint, index) => (
														<SelectItem
															key={index}
															value={`${endpoint.method} ${endpoint.path}`}
														>
															<div className="flex items-center gap-2">
																<Badge
																	variant={
																		endpoint.method === "GET"
																			? "default"
																			: endpoint.method === "POST"
																				? "destructive"
																				: endpoint.method === "PUT"
																					? "secondary"
																					: "outline"
																	}
																	className="text-xs"
																>
																	{endpoint.method}
																</Badge>
																<span className="font-mono text-xs">
																	{endpoint.path}
																</span>
															</div>
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>

										<div>
											<Label htmlFor="apikey">API Key (Optional)</Label>
											<Input
												id="apikey"
												placeholder="Bearer token..."
												value={apiKey}
												onChange={(e) => setApiKey(e.target.value)}
											/>
										</div>

										{selectedEndpoint.method !== "GET" && (
											<div>
												<Label htmlFor="requestbody">Request Body</Label>
												<Textarea
													id="requestbody"
													placeholder="JSON request body..."
													value={requestBody}
													onChange={(e) => setRequestBody(e.target.value)}
													className="font-mono text-sm min-h-[200px]"
												/>
											</div>
										)}

										<Button
											onClick={handleTest}
											disabled={loading}
											className="w-full"
										>
											{loading ? (
												"Testing..."
											) : (
												<>
													<Play className="h-4 w-4 mr-2" />
													Send Request
												</>
											)}
										</Button>
									</div>

									<div className="space-y-4">
										<div>
											<Label>Response</Label>
											<Textarea
												value={response}
												readOnly
												placeholder="Response will appear here..."
												className="font-mono text-sm min-h-[400px]"
											/>
										</div>
										{response && (
											<Button
												variant="outline"
												size="sm"
												onClick={() => copyToClipboard(response)}
												className="w-full"
											>
												<Copy className="h-4 w-4 mr-2" />
												Copy Response
											</Button>
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="examples" className="space-y-6">
						<div className="grid gap-6">
							<Card>
								<CardHeader>
									<CardTitle>Quick Start Examples</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<h4 className="font-medium mb-2">1. Create a Price Tag</h4>
										<pre className="text-xs bg-muted p-3 rounded overflow-auto">
											{`curl -X POST ${typeof window !== "undefined" ? window.location.origin : "https://your-domain.com"}/api/price-tags \\
  -H "Content-Type: application/json" \\
  -d '{
    "data": "Premium Coffee",
    "price": 1200,
    "designType": "new",
    "hasDiscount": true
  }'`}
										</pre>
									</div>

									<div>
										<h4 className="font-medium mb-2">2. Generate PDF</h4>
										<pre className="text-xs bg-muted p-3 rounded overflow-auto">
											{`curl -X POST ${typeof window !== "undefined" ? window.location.origin : "https://your-domain.com"}/api/generate-pdf-v2 \\
  -H "Content-Type: application/json" \\
  -d '{
    "items": [
      {
        "id": 1,
        "data": "Premium Coffee",
        "price": 1200,
        "discountPrice": 700
      }
    ],
    "settings": {
      "design": true,
      "designType": "new"
    },
    "format": "A4"
  }' \\
  --output price-tags.pdf`}
										</pre>
									</div>

									<div>
										<h4 className="font-medium mb-2">3. Get All Price Tags</h4>
										<pre className="text-xs bg-muted p-3 rounded overflow-auto">
											{`curl "${typeof window !== "undefined" ? window.location.origin : "https://your-domain.com"}/api/price-tags?limit=20&sortBy=price&sortOrder=desc"`}
										</pre>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>SDKs and Libraries</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<h4 className="font-medium mb-2">JavaScript/TypeScript</h4>
										<pre className="text-xs bg-muted p-3 rounded overflow-auto">
											{`// Using fetch
const response = await fetch('/api/price-tags', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: 'Product Name',
    price: 1000,
    designType: 'new'
  })
});

const result = await response.json();`}
										</pre>
									</div>

									<div>
										<h4 className="font-medium mb-2">Python</h4>
										<pre className="text-xs bg-muted p-3 rounded overflow-auto">
											{`import requests

# Create price tag
response = requests.post('${typeof window !== "undefined" ? window.location.origin : "https://your-domain.com"}/api/price-tags', 
  json={
    'data': 'Product Name',
    'price': 1000,
    'designType': 'new'
  }
)

result = response.json()`}
										</pre>
									</div>
								</CardContent>
							</Card>
						</div>
					</TabsContent>
				</Tabs>

				{/* Additional Resources */}
				<Card className="mt-8">
					<CardHeader>
						<CardTitle>Additional Resources</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<Button
								variant="outline"
								className="h-auto p-4"
								onClick={() => window.open("/openapi.json", "_blank")}
							>
								<div className="text-center">
									<Download className="h-6 w-6 mx-auto mb-2" />
									<div className="font-medium">Download OpenAPI Spec</div>
									<div className="text-sm text-muted-foreground">
										Get the complete API specification
									</div>
								</div>
							</Button>
							<Button
								variant="outline"
								className="h-auto p-4"
								onClick={() => window.open("/api-health", "_blank")}
							>
								<div className="text-center">
									<ExternalLink className="h-6 w-6 mx-auto mb-2" />
									<div className="font-medium">Health Dashboard</div>
									<div className="text-sm text-muted-foreground">
										Real-time API monitoring
									</div>
								</div>
							</Button>
							<Button
								variant="outline"
								className="h-auto p-4"
								onClick={() =>
									window.open("https://t.me/PriceTagPrinterBot", "_blank")
								}
							>
								<div className="text-center">
									<ExternalLink className="h-6 w-6 mx-auto mb-2" />
									<div className="font-medium">Telegram Bot</div>
									<div className="text-sm text-muted-foreground">
										Try our bot interface
									</div>
								</div>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default ApiTestingPlayground;
