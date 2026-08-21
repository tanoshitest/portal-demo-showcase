import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { company, categories } from "@/data/mock";
import { loadAdminSolutions } from "@/data/solutions-store";

export function SiteFooter() {
  const [solutions, setSolutions] = useState(loadAdminSolutions);
  useEffect(() => setSolutions(loadAdminSolutions()), []);
  return (
    <footer className="border-t border-brand-foreground/10 bg-[#062a68] text-brand-foreground">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-11 w-11 place-items-center rounded-full border-2 border-highlight bg-white/10 text-sm font-black italic">
              HV
            </span>
            <span className="text-base font-black uppercase">Hoàng Vĩnh IOT</span>
          </div>
          <p className="mt-3 text-sm opacity-80">{company.slogan}</p>
          <ul className="mt-4 space-y-2 text-sm opacity-90">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              {company.address}
            </li>
            <li className="flex gap-2">
              <Phone className="h-4 w-4 shrink-0" />
              {company.hotline} · {company.phone}
            </li>
            <li className="flex gap-2">
              <Mail className="h-4 w-4 shrink-0" />
              {company.email}
            </li>
            <li className="flex gap-2">
              <Clock className="h-4 w-4 shrink-0" />
              {company.workingHours}
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide">Danh mục sản phẩm</h3>
          <ul className="mt-3 space-y-2 text-sm opacity-85">
            {categories.slice(0, 5).map((c) => (
              <li key={c.slug}>
                <Link to="/san-pham" search={{ danh_muc: c.slug }} className="hover:underline">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide">Giải pháp</h3>
          <ul className="mt-3 space-y-2 text-sm opacity-85">
            {solutions.map((s) => (
              <li key={s.slug}>
                <Link to="/giai-phap/$slug" params={{ slug: s.slug }} className="hover:underline">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide">Hỗ trợ</h3>
          <ul className="mt-3 space-y-2 text-sm opacity-85">
            <li>
              <Link to="/cong-trinh" className="hover:underline">
                Công trình tiêu biểu
              </Link>
            </li>
            <li>
              <Link to="/lien-he" className="hover:underline">
                Đăng ký tư vấn
              </Link>
            </li>
            <li>
              <Link to="/portal/dashboard" search={{}} className="hover:underline">
                Portal
              </Link>
            </li>
            <li>
              <Link to="/gio-hang" className="hover:underline">
                Giỏ hàng &amp; đặt hàng
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-brand-foreground/15 py-4 text-center text-xs opacity-70">
        © 2026 Công ty TNHH Hoàng Vĩnh IOT. All rights reserved.
      </div>
    </footer>
  );
}
