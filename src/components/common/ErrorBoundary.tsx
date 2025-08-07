import { AlertTriangle, RefreshCw } from "lucide-react";
import type React from "react";
import { Component, type ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
	errorInfo: string | null;
}

interface ErrorBoundaryProps {
	children: ReactNode;
	fallback?: ReactNode;
	onError?: (error: Error, errorInfo: string) => void;
	resetOnPropsChange?: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
			errorInfo: null,
		};
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return {
			hasError: true,
			error,
			errorInfo: null,
		};
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		this.setState({
			error,
			errorInfo: errorInfo.componentStack,
		});

		// Log error to external service if callback provided
		this.props.onError?.(error, errorInfo.componentStack);
		
		// Log to console in development
		if (process.env.NODE_ENV === 'development') {
			console.error('Error caught by boundary:', error);
			console.error('Error info:', errorInfo);
		}
	}

	componentDidUpdate(prevProps: ErrorBoundaryProps) {
		// Reset error state when props change (useful for route changes)
		if (this.props.resetOnPropsChange && prevProps.children !== this.props.children) {
			if (this.state.hasError) {
				this.resetError();
			}
		}
	}

	resetError = () => {
		this.setState({
			hasError: false,
			error: null,
			errorInfo: null,
		});
	};

	render() {
		if (this.state.hasError) {
			// Custom fallback UI if provided
			if (this.props.fallback) {
				return this.props.fallback;
			}

			// Default error UI
			return (
				<div className="p-4 max-w-lg mx-auto">
					<Alert variant="destructive">
						<AlertTriangle className="h-4 w-4" />
						<AlertTitle>Что-то пошло не так</AlertTitle>
						<AlertDescription className="mt-2">
							<div className="space-y-2">
								<p>
									Произошла непредвиденная ошибка. Попробуйте обновить страницу или обратитесь к разработчику.
								</p>
								
								{process.env.NODE_ENV === 'development' && this.state.error && (
									<details className="mt-4">
										<summary className="cursor-pointer text-sm font-medium">
											Подробности ошибки (только в режиме разработки)
										</summary>
										<div className="mt-2 p-2 bg-muted rounded text-xs font-mono overflow-auto max-h-40">
											<div className="text-red-600 font-semibold">
												{this.state.error.name}: {this.state.error.message}
											</div>
											{this.state.errorInfo && (
												<div className="mt-2 text-gray-600 whitespace-pre-wrap">
													{this.state.errorInfo}
												</div>
											)}
										</div>
									</details>
								)}

								<Button 
									onClick={this.resetError}
									size="sm" 
									variant="outline"
									className="mt-3"
								>
									<RefreshCw className="h-4 w-4 mr-2" />
									Попробовать снова
								</Button>
							</div>
						</AlertDescription>
					</Alert>
				</div>
			);
		}

		return this.props.children;
	}
}

// Specialized error boundaries for different parts of the app

export const DataImportErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
	<ErrorBoundary
		onError={(error, errorInfo) => {
			// Log import-specific errors
			console.error('Data import error:', error, errorInfo);
		}}
		fallback={
			<Alert variant="destructive">
				<AlertTriangle className="h-4 w-4" />
				<AlertTitle>Ошибка импорта данных</AlertTitle>
				<AlertDescription>
					Не удалось импортировать данные. Проверьте формат файла и попробуйте снова.
				</AlertDescription>
			</Alert>
		}
	>
		{children}
	</ErrorBoundary>
);

export const ExportErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
	<ErrorBoundary
		onError={(error, errorInfo) => {
			console.error('Export error:', error, errorInfo);
		}}
		fallback={
			<Alert variant="destructive">
				<AlertTriangle className="h-4 w-4" />
				<AlertTitle>Ошибка экспорта</AlertTitle>
				<AlertDescription>
					Не удалось экспортировать данные. Попробуйте снова или обратитесь к разработчику.
				</AlertDescription>
			</Alert>
		}
	>
		{children}
	</ErrorBoundary>
);

export const RenderErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
	<ErrorBoundary
		onError={(error, errorInfo) => {
			console.error('Render error:', error, errorInfo);
		}}
		fallback={
			<div className="p-4 text-center text-muted-foreground">
				<AlertTriangle className="h-8 w-8 mx-auto mb-2" />
				<p>Не удалось отобразить этот компонент</p>
			</div>
		}
	>
		{children}
	</ErrorBoundary>
);