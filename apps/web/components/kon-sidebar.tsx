"use client";

import * as React from "react";
import {
  BarChart3,
  Bot,
  BrainCircuit,
  GitBranch,
  LayoutDashboard,
  Search,
  Settings,
  Users,
  Bell,
  Package,
  Megaphone,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarFooter,
} from "@workspace/ui/components/sidebar";
import { NavUser } from "@/components/nav-user";

const navMain = [
  {
    title: "Bảng điều khiển",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Tìm kiếm ngữ nghĩa",
    url: "/dashboard/search",
    icon: Search,
  },
  {
    title: "AI Agent",
    url: "/dashboard/agent",
    icon: Bot,
  },
];

const navPredictions = [
  {
    title: "Tất cả mô hình",
    url: "/predictions",
    icon: BrainCircuit,
  },
  {
    title: "Cây quyết định",
    url: "/predictions/decision-tree",
    icon: GitBranch,
  },
  {
    title: "Phân cụm",
    url: "/predictions/clustering",
    icon: Users,
  },
  {
    title: "Rời bỏ (Logistic)",
    url: "/predictions/logistic-regression",
    icon: BarChart3,
  },
];

const navManagement = [
  {
    title: "Sản phẩm",
    url: "/dashboard/products",
    icon: Package,
  },
  {
    title: "Khách hàng",
    url: "/dashboard/customers",
    icon: Users,
  },
  {
    title: "Đơn hàng",
    url: "/dashboard/orders",
    icon: Package,
  },
  {
    title: "Phân tích",
    url: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Thông báo",
    url: "/dashboard/notifications",
    icon: Bell,
  },
  {
    title: "Chiến dịch",
    url: "/dashboard/campaigns",
    icon: Megaphone,
  },
];

export function KonSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="sidebar" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <BrainCircuit className="size-5" />
                </div>
                <div className="grid flex-1 text-start text-sm leading-tight">
                  <span className="truncate font-bold text-lg">Kon AI</span>
                  <span className="truncate text-xs opacity-70">Autonomous ERP</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>AI Cốt lõi</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>ML Predictions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navPredictions.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Quản lý</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navManagement.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Cài đặt">
                  <a href="/dashboard/settings">
                    <Settings />
                    <span>Cài đặt</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
