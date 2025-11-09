import { Home, Users, FileText, BarChart3, Scale, FileCheck, LogOut, User } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useVolunteer } from "@/context/VolunteerContext";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarFooter,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Clients", url: "/clients", icon: Users },
  { title: "Transcripts", url: "/transcripts", icon: FileText },
  { title: "Analyse", url: "/analyze", icon: BarChart3 },
  { title: "Form Generator", url: "/form-generator", icon: FileCheck },
  { title: "Commissioner Breakdown", url: "/commissioner-breakdown", icon: Scale },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { currentVolunteer, logout } = useVolunteer();

  const isActive = (path: string) => currentPath === path;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Sidebar className={open ? "w-60" : "w-14"} collapsible="icon">
      <SidebarContent>
        <div className="flex items-center gap-2 px-4 py-4">
          <Scale className="h-6 w-6 text-primary" />
          {open && <span className="font-bold text-lg">JusticeMAP</span>}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {currentVolunteer && (
        <SidebarFooter className="border-t p-4">
          {open ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{currentVolunteer.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{currentVolunteer.role}</p>
                </div>
              </div>
              <SidebarMenuButton onClick={handleLogout} className="w-full justify-start text-muted-foreground hover:text-foreground">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </SidebarMenuButton>
            </div>
          ) : (
            <SidebarMenuButton onClick={handleLogout} className="justify-center">
              <LogOut className="h-4 w-4" />
            </SidebarMenuButton>
          )}
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
