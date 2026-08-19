import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Phone, Mail, Clock, MessageCircle, Send } from "lucide-react";
import { ConsultForm } from "@/components/consult-form";
import { company } from "@/data/mock";

export const Route = createFileRoute("/lien-he")({
  head: () => ({
    meta: [
      { title: "Liên hệ & đăng ký tư vấn | Hoàng Vĩnh VKT" },
      {
        name: "description",
        content:
          "Liên hệ Hoàng Vĩnh VKT: hotline 1900 6868, email info@hoangvinhvkt.vn, địa chỉ tại TP.HCM. Đăng ký khảo sát và báo giá miễn phí.",
      },
      { property: "og:title", content: "Liên hệ Hoàng Vĩnh VKT" },
      {
        property: "og:description",
        content: "Hotline, email, địa chỉ và form đăng ký tư vấn kỹ thuật.",
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  const info = [
    { icon: Phone, label: "Hotline", value: `${company.hotline} · ${company.phone}` },
    { icon: Mail, label: "Email", value: company.email },
    { icon: MapPin, label: "Địa chỉ", value: company.address },
    { icon: Clock, label: "Giờ làm việc", value: company.workingHours },
  ];

  return (
    <div className="container-page py-6 lg:py-12">
      <nav className="text-xs text-muted-foreground">
        <Link to="/" className="hover:text-brand">
          Trang chủ
        </Link>
        <span className="mx-1">/</span>
        <span className="text-foreground">Liên hệ</span>
      </nav>
      <div className="mt-4 rounded-2xl bg-gradient-to-r from-brand-dark to-brand p-5 text-white sm:p-9">
      <p className="text-[9px] font-bold uppercase tracking-widest text-highlight sm:text-xs">Chúng tôi luôn sẵn sàng hỗ trợ bạn</p>
      <h1 className="mt-2 text-[23px] font-black uppercase sm:text-4xl">Liên hệ</h1>
      <p className="mt-1 max-w-2xl text-sm text-white/80">
        Gửi yêu cầu báo giá, khảo sát công trình hoặc hỗ trợ kỹ thuật. Chúng tôi phản hồi trong 4
        giờ làm việc.
      </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: Phone, label: "Gọi ngay", value: company.hotline, href: `tel:${company.hotline.replace(/\s/g, "")}` },
          { icon: MessageCircle, label: "Chat Zalo", value: company.phone, href: "https://zalo.me" },
          { icon: Send, label: "Messenger", value: "Nhắn tin", href: "https://m.me" },
          { icon: MessageCircle, label: "WhatsApp", value: company.phone, href: "https://wa.me" },
        ].map((channel) => <a key={channel.label} href={channel.href} target={channel.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="flex flex-col items-center rounded-xl border border-brand/10 bg-white p-3 text-center shadow-card transition hover:-translate-y-0.5 hover:border-brand/30 sm:rounded-2xl sm:p-4"><span className="grid h-9 w-9 place-items-center rounded-full bg-brand-soft text-brand sm:h-11 sm:w-11"><channel.icon className="h-4 w-4 sm:h-5 sm:w-5" /></span><strong className="mt-2 text-[9px] sm:text-sm">{channel.label}</strong><span className="mt-1 text-[7px] font-semibold text-brand sm:text-xs">{channel.value}</span></a>)}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="order-2 rounded-2xl border border-brand/10 bg-card p-5 shadow-card sm:p-6 lg:order-1">
          <h2 className="text-lg font-bold">Form liên hệ</h2>
          <div className="mt-4">
            <ConsultForm source="Trang liên hệ" />
          </div>
        </div>

        <div className="order-1 space-y-4 lg:order-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-lg font-bold">Thông tin công ty</h2>
            <ul className="mt-4 space-y-4 text-sm">
              {info.map((i) => (
                <li key={i.label} className="flex gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
                    <i.icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-xs uppercase text-muted-foreground">{i.label}</span>
                    <span className="font-medium">{i.value}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-5 grid gap-2">
              <a
                href={`tel:${company.hotline.replace(/\s/g, "")}`}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <Phone className="h-4 w-4" /> Gọi hotline
              </a>
              <a
                href="https://zalo.me"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-input px-4 py-2.5 text-sm font-semibold hover:bg-accent"
              >
                <MessageCircle className="h-4 w-4" /> Chat Zalo
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border">
            <iframe
              title="Bản đồ Hoàng Vĩnh VKT"
              src="https://www.openstreetmap.org/export/embed.html?bbox=106.60%2C10.78%2C106.66%2C10.82&layer=mapnik"
              className="h-64 w-full border-0"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
