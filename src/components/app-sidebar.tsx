import { Link, useMatches } from "@tanstack/react-router";
import { QrCode, Tag } from "lucide-react";
import { Button } from "./ui/button";
import { Sidebar } from "./ui/sidebar";

export function AppSidebar() {
	const matches = useMatches();
	const currentPath = matches[matches.length - 1].pathname;

	return (
		<Sidebar variant="inset" className="p-2">
			<div className="space-y-4 py-4 bg-sidebar">
				<div className="px-3 py-2">
					<h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
						Меню
					</h2>
					<div className="space-y-1">
						<Button
							asChild
							variant={currentPath === "/" ? "secondary" : "ghost"}
							className="w-full justify-start"
						>
							<Link to="/" className="flex items-center">
								<Tag className="h-4 w-4 mr-2" />
								Ценники
							</Link>
						</Button>
						<Button
							asChild
							variant={currentPath === "/marketing" ? "secondary" : "ghost"}
							className="w-full justify-start"
						>
							<Link to="/marketing" className="flex items-center">
								<QrCode className="h-4 w-4 mr-2" />В разработке
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</Sidebar>
	);
}
