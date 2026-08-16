import { createFileRoute, redirect } from "@tanstack/react-router";
import { AutoCalcSheet } from "@/components/auto-calc-sheet";
import { PortalGate } from "@/components/portal-gate";
import { useStore } from "@/context/store";

export const Route = createFileRoute("/portal/cong-cu")({
  beforeLoad: () => {
    throw redirect({ to: "/portal/cong-cu-du-toan" });
  },
  head: () => ({
    meta: [
      { title: "Công cụ tính toán | Hoàng Vĩnh VKT" },
      {
        name: "description",
        content: "Bảng tính AUTO: tiền điện, tấm pin, diện tích lắp đặt và pin lưu trữ.",
      },
      { property: "og:title", content: "Công cụ tính toán | Hoàng Vĩnh VKT" },
      { property: "og:description", content: "Bảng tính AUTO hệ thống điện mặt trời trên Portal." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalCalculator,
});

function PortalCalculator() {
  const { user } = useStore();
  if (!user) return <PortalGate />;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden px-6 pt-6 lg:px-8">
      <AutoCalcSheet />
    </div>
  );
}
