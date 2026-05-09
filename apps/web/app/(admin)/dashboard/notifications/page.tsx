"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { fetchNotifications, markNotificationRead } from "@/lib/api";

interface Notification {
  id: number;
  title: string;
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
      // Silent fail
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    await Promise.allSettled(unread.map((n) => markNotificationRead(n.id)));
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Notifications</h1>
          <p className="text-sm text-zinc-400 mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/50 text-zinc-300"
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl overflow-hidden">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
            <Bell className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/30">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-5 py-4 transition-colors hover:bg-zinc-900/40 ${
                  !notification.is_read ? "bg-teal-950/10 border-l-2 border-l-teal-500" : "border-l-2 border-l-transparent"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {!notification.is_read && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-teal-400" />
                      )}
                      <h3 className="text-sm font-medium text-zinc-100 truncate">
                        {notification.title}
                      </h3>
                    </div>
                    <p className="text-sm text-zinc-400 mt-1">{notification.message}</p>
                    <p className="text-xs text-zinc-600 mt-2">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkRead(notification.id)}
                      className="text-xs text-teal-400 hover:text-teal-300 hover:bg-teal-950/30 shrink-0"
                    >
                      Mark read
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
