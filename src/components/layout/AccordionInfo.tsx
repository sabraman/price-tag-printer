// AccordionInfo.tsx
import { CheckCircle, HelpCircle, Settings, Share2 } from "lucide-react";
import type React from "react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

const AccordionInfo: React.FC = () => {
	return (
		<Accordion
			type="single"
			collapsible
			className="rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm"
		>
			<AccordionItem value="google-sheets-access" className="border-none">
				<AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-accent/50 rounded-lg transition-colors">
					<div className="flex items-center gap-3">
						<div className="p-1.5 rounded-full bg-amber-500/20">
							<HelpCircle className="w-4 h-4 text-amber-500" />
						</div>
						<span className="text-sm font-medium text-foreground">
							Проблемы с доступом к Google Таблицам?
						</span>
					</div>
				</AccordionTrigger>
				<AccordionContent className="px-4 pb-4">
					<div className="space-y-4">
						{/* Header */}
						<div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
							<Settings className="w-5 h-5 text-blue-500" />
							<div>
								<h4 className="text-sm font-semibold text-foreground">
									Настройка доступа к таблице
								</h4>
								<p className="text-xs text-muted-foreground">
									Следуйте инструкциям ниже для открытия доступа
								</p>
							</div>
						</div>

						{/* Steps */}
						<div className="space-y-3">
							<div className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border/30">
								<div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
									1
								</div>
								<div className="flex-1">
									<p className="text-sm font-medium text-foreground">
										Откройте настройки доступа
									</p>
									<p className="text-xs text-muted-foreground mt-1">
										В верхнем правом углу нажмите на кнопку "Настройки доступа"
									</p>
								</div>
								<Share2 className="w-4 h-4 text-muted-foreground" />
							</div>

							<div className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border/30">
								<div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
									2
								</div>
								<div className="flex-1">
									<p className="text-sm font-medium text-foreground">
										Измените настройки доступа
									</p>
									<p className="text-xs text-muted-foreground mt-1">
										Нажмите на "Изменить" или "Доступ по ссылке"
									</p>
								</div>
								<Settings className="w-4 h-4 text-muted-foreground" />
							</div>

							<div className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border/30">
								<div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
									3
								</div>
								<div className="flex-1">
									<p className="text-sm font-medium text-foreground">
										Включите доступ по ссылке
									</p>
									<p className="text-xs text-muted-foreground mt-1">
										Убедитесь, что опция "Доступ по ссылке" включена
									</p>
								</div>
								<CheckCircle className="w-4 h-4 text-green-500" />
							</div>
						</div>

						{/* Success message */}
						<div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
							<CheckCircle className="w-4 h-4 text-green-500" />
							<p className="text-xs text-green-600 dark:text-green-400 font-medium">
								После выполнения этих шагов таблица станет доступна для импорта
							</p>
						</div>
					</div>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
};

export default AccordionInfo;
