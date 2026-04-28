import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-muted/30">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border/60 px-4 glass sticky top-0 z-30">
            <SidebarTrigger className="hover:bg-primary/10 hover:text-primary transition-colors" />
            <div className="ml-3 flex items-center gap-2 hidden sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-gain animate-pulse" />
              <span className="text-xs font-mono text-muted-foreground">
                Market Open · Live Data
              </span>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                FinDash Pro
              </span>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6 scrollbar-thin">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
