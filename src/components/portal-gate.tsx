import { Link } from "@tanstack/react-router";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PortalGate() {
  return (
    <div className="container-page py-16 text-center">
      <LockKeyhole className="mx-auto h-12 w-12 text-muted-foreground" />
      <h1 className="mt-4 text-xl font-bold">Bạn cần đăng nhập để sử dụng Portal</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Khu vực này chỉ dành cho tài khoản Admin hoặc Sale được cấp quyền.
      </p>
      <Button asChild className="mt-6">
        <Link to="/">Đăng nhập từ trang chủ</Link>
      </Button>
    </div>
  );
}
