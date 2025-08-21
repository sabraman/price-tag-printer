"use client";

import {
	Activity,
	CheckCircle,
	Clock,
	ExternalLink,
	Gauge,
	Globe,
	RefreshCw,
	Server,
	Shield,
	XCircle,
	Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface HealthData {
	status: string;
	timestamp: string;
	uptime: string;
	version: string;
	service: string;
	environment: string;
	memory: {
		used: string;
		total: string;
	};
	responseTime: string;
	endpoints: Record<string, string>;
	services: Record<string, string>;
}

interface HealthResponse {
	success: boolean;
	data: HealthData;
	message: string;
}

const ApiHealthPage = () => {
	const [health, setHealth] = useState<HealthResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [lastChecked, setLastChecked] = useState<Date>(new Date());

	const fetchHealth = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await fetch("/api/health");
			const data = await response.json();
			setHealth(data);
			setLastChecked(new Date());
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to fetch health data",
			);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchHealth();
		// Auto-refresh every 30 seconds
		const interval = setInterval(fetchHealth, 30000);
		return () => clearInterval(interval);
	}, [fetchHealth]);

	const getStatusColor = (status: string) => {
		switch (status?.toLowerCase()) {
			case "healthy":
				return "text-green-600 dark:text-green-400";
			case "degraded":
				return "text-yellow-600 dark:text-yellow-400";
			case "unhealthy":
				return "text-red-600 dark:text-red-400";
			default:
				return "text-gray-600 dark:text-gray-400";
		}
	};

	const getServiceStatus = (status: string) => {
		const isConfigured = status === "configured";
		return (
			<div className="flex items-center gap-2">
				{isConfigured ? (
					<CheckCircle className="h-4 w-4 text-green-500" />
				) : (
					<XCircle className="h-4 w-4 text-gray-400" />
				)}
				<span
					className={
						isConfigured
							? "text-green-600 dark:text-green-400"
							: "text-gray-500"
					}
				>
					{isConfigured ? "Configured" : "Not Configured"}
				</span>
			</div>
		);
	};

	const parseMemoryUsage = (used: string, total: string): number => {
		const usedMB = parseInt(used.replace("MB", ""));
		const totalMB = parseInt(total.replace("MB", ""));
		return totalMB > 0 ? (usedMB / totalMB) * 100 : 0;
	};

	if (loading && !health) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
				<Card className="w-96">
					<CardContent className="flex items-center justify-center py-12">
						<div className="text-center space-y-4">
							<RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
							<p className="text-muted-foreground">Checking API health...</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
				<Card className="w-96">
					<CardContent className="py-12">
						<div className="text-center space-y-4">
							<XCircle className="h-12 w-12 mx-auto text-red-500" />
							<h2 className="text-xl font-semibold text-red-600 dark:text-red-400">
								Health Check Failed
							</h2>
							<p className="text-muted-foreground">{error}</p>
							<Button onClick={fetchHealth} className="mt-4">
								<RefreshCw className="h-4 w-4 mr-2" />
								Retry
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	const memoryUsagePercent = health?.data
		? parseMemoryUsage(health.data.memory.used, health.data.memory.total)
		: 0;

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
			<div className="container mx-auto py-8 px-4 max-w-6xl">
				{/* Header */}
				<div className="text-center mb-8">
					<div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-primary/10 rounded-full">
						<Activity className="h-4 w-4 text-primary" />
						<span className="text-sm font-medium text-primary">
							System Status
						</span>
					</div>
					<h1 className="text-4xl font-bold mb-4">API Health Dashboard</h1>
					<p className="text-muted-foreground mb-4">
						Real-time monitoring and status information for the Price Tag API
					</p>
					<div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
						<div className="flex items-center gap-1">
							<Clock className="h-4 w-4" />
							Last checked: {lastChecked.toLocaleTimeString()}
						</div>
						<Button
							variant="ghost"
							size="sm"
							onClick={fetchHealth}
							disabled={loading}
						>
							<RefreshCw
								className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
							/>
						</Button>
					</div>
				</div>

				{/* Main Status */}
				<Card className="mb-8 bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-sm">
					<CardContent className="py-8">
						<div className="flex items-center justify-center space-x-6">
							<div className="text-center">
								{health?.data.status === "healthy" ? (
									<CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-2" />
								) : (
									<XCircle className="h-16 w-16 mx-auto text-red-500 mb-2" />
								)}
								<h2
									className={`text-2xl font-bold ${getStatusColor(health?.data.status || "")}`}
								>
									{health?.data.status?.toUpperCase() || "UNKNOWN"}
								</h2>
								<p className="text-muted-foreground">API Status</p>
							</div>
							<Separator orientation="vertical" className="h-20" />
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Server className="h-4 w-4 text-blue-500" />
									<span className="font-medium">{health?.data.service}</span>
									<Badge variant="outline">{health?.data.version}</Badge>
								</div>
								<div className="flex items-center gap-2">
									<Globe className="h-4 w-4 text-purple-500" />
									<span>{health?.data.environment}</span>
								</div>
								<div className="flex items-center gap-2">
									<Zap className="h-4 w-4 text-yellow-500" />
									<span>{health?.data.responseTime} response</span>
								</div>
								<div className="flex items-center gap-2">
									<Clock className="h-4 w-4 text-green-500" />
									<span>{health?.data.uptime} uptime</span>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* System Metrics */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
					{/* Memory Usage */}
					<Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/50 dark:border-blue-800/50">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Gauge className="h-5 w-5 text-blue-500" />
								Memory Usage
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								<div className="flex justify-between text-sm">
									<span>Used: {health?.data.memory.used}</span>
									<span>Total: {health?.data.memory.total}</span>
								</div>
								<Progress value={memoryUsagePercent} className="h-2" />
								<p className="text-xs text-muted-foreground">
									{memoryUsagePercent.toFixed(1)}% of available memory
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Response Time */}
					<Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200/50 dark:border-green-800/50">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Zap className="h-5 w-5 text-green-500" />
								Performance
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<div className="text-2xl font-bold text-green-600 dark:text-green-400">
									{health?.data.responseTime}
								</div>
								<p className="text-sm text-muted-foreground">
									Average response time
								</p>
								<Badge
									variant="outline"
									className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
								>
									Excellent
								</Badge>
							</div>
						</CardContent>
					</Card>

					{/* Uptime */}
					<Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200/50 dark:border-purple-800/50">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Activity className="h-5 w-5 text-purple-500" />
								Uptime
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
									{health?.data.uptime}
								</div>
								<p className="text-sm text-muted-foreground">System uptime</p>
								<Badge
									variant="outline"
									className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
								>
									Running
								</Badge>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* API Endpoints */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Globe className="h-5 w-5 text-blue-500" />
								Available Endpoints
							</CardTitle>
							<CardDescription>
								Core API endpoints and their status
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{health?.data.endpoints &&
									Object.entries(health.data.endpoints).map(([name, path]) => (
										<div
											key={name}
											className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
										>
											<div>
												<div className="font-medium capitalize">
													{name.replace(/([A-Z])/g, " $1").trim()}
												</div>
												<div className="text-sm text-muted-foreground font-mono">
													{path}
												</div>
											</div>
											<div className="flex items-center gap-2">
												<CheckCircle className="h-4 w-4 text-green-500" />
												<Button
													variant="ghost"
													size="sm"
													onClick={() => window.open(path, "_blank")}
												>
													<ExternalLink className="h-3 w-3" />
												</Button>
											</div>
										</div>
									))}
							</div>
						</CardContent>
					</Card>

					{/* External Services */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Shield className="h-5 w-5 text-green-500" />
								External Services
							</CardTitle>
							<CardDescription>
								Integration status of external services
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{health?.data.services &&
									Object.entries(health.data.services).map(
										([service, status]) => (
											<div
												key={service}
												className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
											>
												<div>
													<div className="font-medium capitalize">
														{service.replace(/_/g, " ")}
													</div>
													<div className="text-sm text-muted-foreground">
														{service === "telegram_bot" &&
															"Telegram Bot Integration"}
														{service === "google_sheets" && "Google Sheets API"}
													</div>
												</div>
												{getServiceStatus(status)}
											</div>
										),
									)}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Footer */}
				<div className="mt-12 text-center">
					<p className="text-muted-foreground text-sm">
						Health data is refreshed automatically every 30 seconds
					</p>
				</div>
			</div>
		</div>
	);
};

export default ApiHealthPage;
