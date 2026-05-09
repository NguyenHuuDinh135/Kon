"use client";

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { fetchUnreadCount, fetchNotifications, markNotificationRead } from "@/lib/api";

interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUnreadCount();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const data = await fetchUnreadCount();
      setUnreadCount(data.count ?? 0);
    } catch {
      // Silently handle - bell just won't show count
    }
  };

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await fetchNotifications();
      setNotifications(Array.isArray(data) ? data.slice(0, 10) : []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      loadNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkRead = async (id: number) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Silent fail
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={handleToggle}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-teal-500 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-zinc-800/50 bg-zinc-950/95 backdrop-blur-xl shadow-2xl z-50">
          <div className="border-b border-zinc-800/50 px-4 py-3">
            <h3 className="text-sm font-semibold text-zinc-100">Notifications</h3>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-6 text-center text-sm text-zinc-400">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-zinc-400">No notifications</div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  className={`w-full text-left px-4 py-3 border-b border-zinc-800/30 hover:bg-zinc-900/50 transition-colors ${
                    !notification.is_read ? "bg-teal-950/20" : ""
                  }`}
                  onClick={() => handleMarkRead(notification.id)}
                >
                  <div className="flex items-start gap-2">
                    {!notification.is_read && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal-400" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-100 truncate">
                        {notification.title}
                      </p>
                      <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-1">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
          <div className="border-t border-zinc-800/50 px-4 py-2">
            <a
              href="/dashboard/notifications"
              className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
            >
              View all notifications
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
