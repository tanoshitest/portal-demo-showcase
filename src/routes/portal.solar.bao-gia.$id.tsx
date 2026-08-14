import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSolar } from "@/context/solar-store";
import { useStore } from "@/context/store";
import { formatVnd } from "@/lib/format";
import { company } from "@/data/mock";
import { categoryLabel, scenarioLabel } from "@/data/solar";

export const Route = createFileRoute("/portal/solar/bao-gia/$id")({
  head: () => ({
    meta: [
      { title: "Báo giá trọn gói điện mặt trời | Hoàng Vĩnh VKT" },
      { name: "description", content: "Bản báo giá trọn gói hệ thống điện mặt trời, sẵn sàng in / xuất PDF." },
      { property: "og:title", content: "Báo giá trọn gói điện mặt trời" },
      { property: "og:description", content: "Bản in báo giá gồm vật tư, giá, bảo hành và hiệu quả đầu tư." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: QuotePrintPage,
});

const numberFmt = new Intl.NumberFormat("vi-VN");

function QuotePrintPage() {
  const { id } = useParams({ from: "/portal/solar/bao-gia/$id" });
  const { quotes } = useSolar();
  const { user } = useStore();
  const quote = quotes.find((q) => q.id === id);

  if (!user) {
    return (
      <div className="container-page py-16 text-center">
        <p className="text-sm text-muted-foreground">Vui lòng đăng nhập Portal để xem báo giá.</p>
        <Button asChild className="mt-4">
          <Link to="/portal">Đăng nhập</Link>
        </Button>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="container-page py-16 text-center">
        <p className="text-sm text-muted-foreground">Không tìm thấy báo giá này.</p>
        <Button asChild className="mt-4" variant="outline">
          <Link to="/portal/solar">Về danh sách báo giá</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-secondary/40 py-6 print:bg-white print:py-0">
      <div className="container-page">
        <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
          <Button asChild variant="outline" size="sm">
            <Link to="/portal/solar">
              <ArrowLeft className="h-4 w-4" /> Danh sách báo giá
            </Link>
          </Button>
          <Button size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> In / Lưu PDF
          </Button>
        </div>

        <article className="mx-auto mt-4 max-w-[860px] rounded-xl border border-border bg-card p-6 shadow-card print:mt-0 print:border-0 print:shadow-none sm:p-10">
          <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-lg bg-gradient-brand text-sm font-black text-brand-foreground">
                HV
              </span>
              <div>
                <p className="text-base font-black uppercase text-brand-dark">Hoàng Vĩnh VKT</p>
                <p className="text-xs text-muted-foreground">{company.address}</p>
                <p className="text-xs text-muted-foreground">
                  Hotline: {company.hotline} · {company.email}
                </p>
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-lg font-black">BÁO GIÁ TRỌN GÓI</h1>
              <p className="text-xs text-muted-foreground">Số: {quote.code}</p>
              <p className="text-xs text-muted-foreground">
                Ngày: {new Date(quote.createdAt).toLocaleDateString("vi-VN")}
              </p>
            </div>
          </header>

          <section className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">Kính gửi khách hàng</p>
              <p className="mt-1 font-semibold">{quote.customer.name}</p>
              <p className="text-sm text-muted-foreground">{quote.customer.phone}</p>
              {quote.customer.email && (
                <p className="text-sm text-muted-foreground">{quote.customer.email}</p>
              )}
              {quote.customer.address && (
                <p className="text-sm text-muted-foreground">{quote.customer.address}</p>
              )}
            </div>
            <div className="sm:text-right">
              <p className="text-xs font-bold uppercase text-muted-foreground">Phương án hệ thống</p>
              <p className="mt-1 font-semibold">{scenarioLabel[quote.scenario]}</p>
              <p className="text-sm text-muted-foreground">Công suất: {quote.systemKwp} kWp</p>
              <p className="text-sm text-muted-foreground">
                Nhân viên phụ trách: {quote.createdByName}
              </p>
            </div>
          </section>

          <table className="mt-6 w-full border-collapse text-sm">
            <thead>
              <tr className="bg-secondary/80 text-left text-xs uppercase text-muted-foreground">
                <th className="border border-border px-3 py-2">Hạng mục thiết bị</th>
                <th className="border border-border px-3 py-2 text-right">SL</th>
                <th className="border border-border px-3 py-2 text-right">Đơn giá</th>
                <th className="border border-border px-3 py-2 text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {quote.lines.map((l) => (
                <tr key={l.productId} className="align-top">
                  <td className="border border-border px-3 py-2">
                    <div className="flex gap-3">
                      <img
                        src={l.image}
                        alt={l.name}
                        loading="lazy"
                        width={64}
                        height={64}
                        className="h-16 w-16 shrink-0 rounded-md object-cover"
                      />
                      <div>
                        <p className="font-semibold">{l.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {categoryLabel[l.category]} · Mã: {l.sku}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {Object.entries(l.specsSnapshot)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(" · ")}
                        </p>
                        <p className="mt-1 text-xs text-success">{l.warrantySnapshot}</p>
                      </div>
                    </div>
                  </td>
                  <td className="border border-border px-3 py-2 text-right whitespace-nowrap">
                    {numberFmt.format(l.quantity)} {l.unit}
                  </td>
                  <td className="border border-border px-3 py-2 text-right whitespace-nowrap">
                    {numberFmt.format(l.unitPriceSnapshot)}
                  </td>
                  <td className="border border-border px-3 py-2 text-right font-semibold whitespace-nowrap">
                    {numberFmt.format(l.unitPriceSnapshot * l.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="border border-border px-3 py-2 text-right">
                  Tạm tính
                </td>
                <td className="border border-border px-3 py-2 text-right">
                  {formatVnd(quote.subtotal)}
                </td>
              </tr>
              <tr>
                <td colSpan={3} className="border border-border px-3 py-2 text-right">
                  VAT {Math.round(quote.vatRate * 100)}%
                </td>
                <td className="border border-border px-3 py-2 text-right">
                  {formatVnd(quote.vatAmount)}
                </td>
              </tr>
              <tr className="bg-brand/5">
                <td colSpan={3} className="border border-border px-3 py-2 text-right font-bold">
                  TỔNG CỘNG (đã gồm VAT)
                </td>
                <td className="border border-border px-3 py-2 text-right text-base font-black text-brand">
                  {formatVnd(quote.total)}
                </td>
              </tr>
            </tfoot>
          </table>

          <section className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs font-bold uppercase text-muted-foreground">Hiệu quả đầu tư</p>
              <p className="mt-2 text-sm">
                Tiết kiệm dự kiến: <strong>{formatVnd(quote.yearlySaving)}</strong>/năm
              </p>
              <p className="text-sm">
                Thời gian hoàn vốn: <strong>{quote.roiYears} năm</strong>
              </p>
              <p className="text-sm">
                Lợi ích 25 năm: <strong>{formatVnd(quote.yearlySaving * 25)}</strong>
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs font-bold uppercase text-muted-foreground">Điều kiện chung</p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-muted-foreground">
                <li>Báo giá có hiệu lực 15 ngày kể từ ngày phát hành.</li>
                <li>Thanh toán: 50% tạm ứng – 40% khi giao thiết bị – 10% sau nghiệm thu.</li>
                <li>Thời gian thi công: 3 – 7 ngày làm việc tuỳ quy mô.</li>
                <li>Bảo hành hệ thống & bảo trì định kỳ theo cam kết từng thiết bị.</li>
              </ul>
            </div>
          </section>

          <footer className="mt-8 grid gap-6 text-center text-sm sm:grid-cols-2">
            <div>
              <p className="font-semibold">ĐẠI DIỆN KHÁCH HÀNG</p>
              <p className="mt-10 text-xs text-muted-foreground">(Ký, ghi rõ họ tên)</p>
            </div>
            <div>
              <p className="font-semibold">ĐẠI DIỆN HOÀNG VĨNH VKT</p>
              <p className="mt-10 text-xs text-muted-foreground">{quote.createdByName}</p>
            </div>
          </footer>
        </article>
      </div>
    </div>
  );
}
