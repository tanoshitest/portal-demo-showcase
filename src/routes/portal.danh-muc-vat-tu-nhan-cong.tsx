import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/portal/danh-muc-vat-tu-nhan-cong")({
  beforeLoad: () => {
    throw redirect({ to: "/portal/danh-muc-thiet-bi" });
  },
});
