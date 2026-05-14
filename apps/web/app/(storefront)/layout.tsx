import { ModeToggle } from "@/components/mode-toggle";
import Link from "next/link";
import { Search, User } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { CartProvider } from "@/context/cart-context";
import { CartSheet } from "@/components/cart-sheet";
import { AIChatWidget } from "@/components/ai-chat-widget";
import { NavUser } from "@/components/nav-user";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-2xl font-bold tracking-tighter text-primary">KON STORE</span>
              </Link>
              <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                <Link href="/products" className="transition-colors hover:text-primary">Sản phẩm</Link>
                <Link href="/categories" className="transition-colors hover:text-primary">Danh mục</Link>
                <Link href="/deals" className="transition-colors hover:text-primary">Ưu đãi</Link>
                <Link href="/track-order" className="transition-colors hover:text-primary">Theo dõi đơn</Link>
                <Link href="/register" className="transition-colors hover:text-primary font-medium text-primary">Đăng ký</Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative hidden md:flex items-center">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Tìm kiếm sản phẩm..."
                  className="h-9 w-64 rounded-md border border-input bg-muted px-9 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <ModeToggle />
              <NavUser />
              <CartSheet />
            </div>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t py-12">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>© 2026 Kon AI ERP & CRM. All rights reserved.</p>
          </div>
        </footer>
        <AIChatWidget />
      </div>
    </CartProvider>
  );
}
