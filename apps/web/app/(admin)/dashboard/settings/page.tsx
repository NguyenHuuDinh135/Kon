"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Separator } from "@workspace/ui/components/separator";
import { Settings as SettingsIcon, Database, Palette, Shield } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Cài đặt hệ thống</h2>
        <p className="text-muted-foreground">
          Cấu hình môi trường Kon AI và tùy chọn nền tảng.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <CardTitle>Giao diện</CardTitle>
            </div>
            <CardDescription>
              Tùy chỉnh giao diện hiển thị của Kon AI.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Chế độ giao diện</Label>
                <p className="text-xs text-muted-foreground">Chuyển đổi giữa giao diện sáng và tối.</p>
              </div>
              <ModeToggle />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Màu nhấn</Label>
              <div className="flex gap-2">
                {["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"].map((color) => (
                  <div key={color} className={`h-8 w-8 rounded-full ${color} cursor-pointer border-2 border-transparent hover:border-foreground transition-all`} />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <CardTitle>API & Dữ liệu</CardTitle>
            </div>
            <CardDescription>
              Quản lý kết nối đến AI Engine.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-url">API Base URL</Label>
              <Input id="api-url" defaultValue="http://localhost:8000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gemini-model">Gemini Model</Label>
              <Input id="gemini-model" defaultValue="gemini-flash-latest" disabled />
              <p className="text-[10px] text-muted-foreground">Cấu hình model được khóa theo biến môi trường.</p>
            </div>
            <Button className="w-full">Lưu kết nối</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Bảo mật</CardTitle>
            </div>
            <CardDescription>
              Quản lý xác thực và phiên đăng nhập.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Hết phiên</Label>
              <p className="text-sm">30 phút (Đang hoạt động)</p>
            </div>
            <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive">
              Thu hồi tất cả token
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
