import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { PortalHeader } from "@/components/portal-header";
import { PortalSidebar } from "@/components/portal-sidebar";
import { useStore } from "@/context/store";

export const Route = createFileRoute("/portal")({
  component: PortalLayout,
});

function isAuthFreePath(pathname: string) {
  return pathname === "/portal/quen-mat-khau";
}

function PortalLayout() {
  const { user } = useStore();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (!user || isAuthFreePath(pathname)) {
    return <Outlet />;
  }

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col">
      <PortalHeader />
      <div className="flex min-h-0 w-full min-w-0 flex-1">
        <PortalSidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
