import { createFileRoute } from "@tanstack/react-router";
import { EstimateToolsForm } from "@/components/estimate-tools-form";
import { PortalGate } from "@/components/portal-gate";
import { useStore } from "@/context/store";

export const Route = createFileRoute("/portal/du-toan-thu-cong")({
  head: () => ({
    meta: [{ title: "Dự toán thủ công | Hoàng Vĩnh VKT" }, { name: "robots", content: "noindex" }],
  }),
  component: ManualEstimatePage,
});

function ManualEstimatePage() {
  const { user } = useStore();
  if (!user) return <PortalGate />;

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden px-2 py-2 sm:px-3 lg:px-4">
      <EstimateToolsForm mode="manual" />
    </div>
  );
}
