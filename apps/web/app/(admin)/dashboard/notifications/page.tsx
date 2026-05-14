"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { fetchNotifications, markNotificationRead } from "@/lib/api";

interface Notification {
  id: number;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkRead = async (id: number) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {
      // Ignore error
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Thông báo</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Cập nhật các cảnh báo hệ thống tự động và phân tích kinh doanh.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadNotifications}
        >
          Làm mới
        </Button>
      </div>

      <div className="rounded-xl border bg-card/50 backdrop-blur-xl overflow-hidden">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Bell className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm">Không có thông báo nào.</p>
          </div>
        ) : (
          <div className="divide-y border-t">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-5 py-4 transition-colors hover:bg-muted/40 ${
                  !notification.is_read ? "bg-primary/5" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium truncate">
                        {notification.type}
                      </h3>
                      {!notification.is_read && (
                        <Badge className="bg-primary text-primary-foreground text-[10px] h-4 px-1.5 uppercase">Mới</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                    <p className="text-xs text-muted-foreground/60 mt-2">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => handleMarkRead(notification.id)}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
