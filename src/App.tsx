import { Outlet } from "@tanstack/react-router";
import type React from "react";
import { AppSidebar } from "./components/app-sidebar";
import FontLoader from "./components/FontLoader";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
} from "./components/ui/breadcrumb";
import { Separator } from "./components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "./components/ui/sidebar";

const App: React.FC = () => {
	return (
		<SidebarProvider defaultOpen={false}>
			<FontLoader />
			<AppSidebar />
			<SidebarInset className="p-2">
				<div className="rounded-xl bg-background">
					<header className="flex h-16 shrink-0 items-center gap-2 border-b rounded-t-xl">
						<div className="flex items-center gap-2 px-4">
							<SidebarTrigger className="-ml-1" />
							<Separator orientation="vertical" className="mr-2 h-4" />
							<Breadcrumb>
								<BreadcrumbList>
									<BreadcrumbItem>
										<BreadcrumbPage>Ценники</BreadcrumbPage>
									</BreadcrumbItem>
								</BreadcrumbList>
							</Breadcrumb>
						</div>
					</header>
					<div className="flex flex-1 flex-col p-4">
						<Outlet />
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
};

export default App;
