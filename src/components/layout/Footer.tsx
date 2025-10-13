import { ExternalLink, FileText, Github, MessageCircle } from "lucide-react";
import Link from "next/link";

const Footer = () => {
	return (
		<footer className="border-t border-border bg-card/50 backdrop-blur-sm">
			<div className="container mx-auto px-6 py-8">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{/* Product Info */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-foreground">
							Price Tag Generator
						</h3>
						<p className="text-sm text-muted-foreground">
							Профессиональный генератор ценников с поддержкой PDF экспорта и
							настраиваемых тем.
						</p>
					</div>

					{/* Links */}
					<div className="space-y-4">
						<h4 className="text-sm font-semibold text-foreground">
							Документация
						</h4>
						<div className="space-y-2">
							<Link
								href="/api-docs"
								className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
							>
								<FileText className="h-4 w-4" />
								API Документация
							</Link>
							<Link
								href="https://github.com/sabraman/price-tag-printer"
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
							>
								<Github className="h-4 w-4" />
								GitHub
								<ExternalLink className="h-3 w-3" />
							</Link>
						</div>
					</div>

					{/* API Info */}
					<div className="space-y-4">
						<h4 className="text-sm font-semibold text-foreground">
							API Endpoints
						</h4>
						<div className="space-y-2 text-sm text-muted-foreground">
							<div>
								<code className="text-xs bg-muted px-2 py-1 rounded">
									GET /api/health
								</code>
								<span className="ml-2">Статус API</span>
							</div>
							<div>
								<code className="text-xs bg-muted px-2 py-1 rounded">
									POST /api/price-tags
								</code>
								<span className="ml-2">Создание ценников</span>
							</div>
							<div>
								<code className="text-xs bg-muted px-2 py-1 rounded">
									POST /api/generate-pdf-v2
								</code>
								<span className="ml-2">Генерация PDF</span>
							</div>
						</div>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="border-t border-border mt-8 pt-6">
					<div className="flex flex-col sm:flex-row justify-between items-center gap-4">
						<div className="text-sm text-muted-foreground">
							© 2025 Price Tag Generator. Создано для удобства.
						</div>
						<div className="flex items-center gap-4">
							<Link
								href="/api-docs"
								className="text-sm text-primary hover:text-primary/80 transition-colors"
							>
								API Docs
							</Link>
							<Link
								href="/api/health"
								target="_blank"
								className="text-sm text-primary hover:text-primary/80 transition-colors"
							>
								API Status
							</Link>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
