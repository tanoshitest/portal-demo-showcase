import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { StoreProvider, useStore } from "@/context/store";
import { SolarProvider } from "@/context/solar-store";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BottomNav } from "@/components/bottom-nav";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-black text-brand">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Không tìm thấy trang</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Trang bạn tìm không tồn tại hoặc đã được di chuyển.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Trang này không tải được
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Đã có lỗi xảy ra. Bạn có thể thử lại hoặc về trang chủ.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Thử lại
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Về trang chủ
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Hoàng Vĩnh IOT – Solar, Camera, Điện máy và Vận chuyển" },
      {
        name: "description",
        content:
          "Giải pháp điện mặt trời, camera an ninh, Wi-Fi, thiết bị điện và vận chuyển trọn gói cho gia đình, doanh nghiệp.",
      },
      { name: "author", content: "Hoàng Vĩnh IOT" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function isAuthFreePath(pathname: string) {
  return pathname === "/portal/quen-mat-khau";
}

function AppShell() {
  const { user } = useStore();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isCrm = Boolean(user) && pathname.startsWith("/portal") && !isAuthFreePath(pathname);

  useEffect(() => {
    if (!isCrm) return;

    const clearOrphanedModalLayer = () => {
      const activeDialog = document.querySelector('body > [role="dialog"][data-state="open"]');
      if (activeDialog) return;

      document.querySelectorAll<HTMLElement>("body > div.fixed.inset-0.z-50").forEach((element) => {
        if (element.classList.contains("bg-black/80")) element.remove();
      });

      if (document.body.style.pointerEvents === "none") {
        document.body.style.removeProperty("pointer-events");
      }
      if (document.body.style.overflow === "hidden") {
        document.body.style.removeProperty("overflow");
      }
    };

    clearOrphanedModalLayer();
    const animationFrame = window.requestAnimationFrame(clearOrphanedModalLayer);
    const timeout = window.setTimeout(clearOrphanedModalLayer, 350);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(timeout);
    };
  }, [isCrm]);

  if (isCrm) {
    return (
      <div className="flex h-screen flex-col overflow-hidden bg-background font-sans antialiased">
        <main className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans antialiased">
      <SiteHeader />
      <main className="flex-1 pb-16 lg:pb-0">
        <Outlet />
      </main>
      <SiteFooter />
      <BottomNav />
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <SolarProvider>
          <AppShell />
          <Toaster />
        </SolarProvider>
      </StoreProvider>
    </QueryClientProvider>
  );
}
