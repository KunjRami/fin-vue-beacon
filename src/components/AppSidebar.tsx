import {
  LayoutDashboard,
  LineChart,
  BrainCircuit,
  TestTube2,
  Star,
  Zap,
  User,
  Moon,
  Sun,
  LogOut,
  TrendingUp,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Analysis", url: "/analysis", icon: LineChart },
  { title: "Prediction", url: "/prediction", icon: BrainCircuit },
  { title: "Backtesting", url: "/backtesting", icon: TestTube2 },
  { title: "Watchlist", url: "/watchlist", icon: Star },
  { title: "Signals", url: "/signals", icon: Zap },
  { title: "Profile", url: "/profile", icon: User },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-3">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-gain animate-pulse" />
                </div>
                <span className="text-lg font-bold tracking-tight gradient-text">
                  FinDash
                </span>
              </div>
            )}
            {collapsed && (
              <div className="relative">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-gain animate-pulse" />
              </div>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className={`relative transition-all duration-200 rounded-md ${
                          isActive
                            ? "bg-primary/10 text-primary font-semibold"
                            : "hover:bg-sidebar-accent/50 hover:text-foreground"
                        }`}
                        activeClassName="bg-primary/10 text-primary font-semibold"
                      >
                        <div
                          className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full transition-all duration-200 ${
                            isActive ? "bg-primary" : "bg-transparent"
                          }`}
                        />
                        <item.icon
                          className={`mr-2 h-4 w-4 transition-colors ${isActive ? "text-primary" : ""}`}
                        />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-2 space-y-1">
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "sm"}
          onClick={toggleTheme}
          className="w-full justify-start hover:bg-primary/10 hover:text-primary transition-colors"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          {!collapsed && (
            <span className="ml-2">
              {theme === "dark" ? "Light" : "Dark"} Mode
            </span>
          )}
        </Button>
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "sm"}
          onClick={signOut}
          className="w-full justify-start text-loss hover:text-loss hover:bg-loss-muted transition-colors"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Sign Out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
