import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortalGate } from "@/components/portal-gate";
import { useStore } from "@/context/store";
import { loadSolarQuotes } from "@/data/solar-quotes";
import { company, images } from "@/data/mock";
import { formatVnd } from "@/lib/format";

export const Route = createFileRoute("/portal/quan-ly-bao-gia/$id")({
  head: () => ({
    meta: [
      { title: "Xem báo giá | Hoàng Vĩnh VKT" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: QuoteInvoicePage,
});

function QuoteInvoicePage() {
  const { id } = useParams({ from: "/portal/quan-ly-bao-gia/$id" });
  const { user } = useStore();
  const quote = loadSolarQuotes().find((q) => q.id === id);

  if (!user) return <PortalGate />;

  if (!quote) {
    return (
      <div className="flex h-full items-center justify-center bg-background px-4">
        <div className="text-center">
          <h1 className="text-xl font-black">Không tìm thấy báo giá</h1>
          <Button asChild className="mt-4" variant="outline">
            <Link to="/portal/quan-ly-bao-gia">
              <ArrowLeft className="h-4 w-4" /> Quay lại
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const date = new Intl.DateTimeFormat("vi-VN").format(new Date(quote.createdAt));

  return (
    <div className="fixed inset-0 z-20 min-h-full overflow-auto bg-[#edf3ff] p-2 print:static print:bg-white print:p-0">
      <div className="mx-auto max-w-[1140px]">
        <div className="mb-2 flex items-center justify-between print:hidden">
          <Button asChild variant="outline" size="sm">
            <Link to="/portal/quan-ly-bao-gia">
              <ArrowLeft className="h-4 w-4" /> Quay lại
            </Link>
          </Button>
          <Button size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> In / Lưu PDF
          </Button>
        </div>

        <article className="overflow-hidden border border-[#1f5da8] bg-white shadow-[0_10px_40px_rgba(15,23,42,0.12)] print:shadow-none">
          <header className="grid grid-cols-[1.15fr_1fr] border-b-4 border-[#2d6dc0] bg-[#143c74] text-white">
            <div className="flex min-h-[130px] items-center gap-4 px-5 py-4">
              <div className="grid h-16 w-16 place-items-center rounded-[20px] bg-white/10">
                <span className="text-2xl font-black">HV</span>
              </div>
              <div className="min-w-0">
                <p className="text-[28px] font-black leading-none tracking-tight">CÔNG TY TNHH HOÀNG VĨNH IOT</p>
                <p className="mt-2 inline-flex rounded-full border border-[#f8b545] px-3 py-1 text-sm font-bold text-[#f8b545]">
                  GIẢI PHÁP ĐIỆN NĂNG LƯỢNG MẶT TRỜI
                </p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold">
                  <span>MST: 3002273022</span>
                  <span>0777 28 4444</span>
                </div>
              </div>
            </div>
            <div
              className="min-h-[130px] bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(90deg, rgba(20,60,116,.15), rgba(20,60,116,.55)), url(${images.hero})`,
              }}
            />
          </header>

          <div className="border-b border-[#94a3b8] bg-[#f8fbff] px-4 py-3 text-center">
            <h1 className="text-[30px] font-black uppercase tracking-wide text-[#3c78c3]">
              BÁO GIÁ LẮP ĐẶT TRỌN GÓI
            </h1>
            <p className="mt-1 text-[18px] font-bold uppercase text-[#4b5563]">
              HỆ THỐNG ĐIỆN NĂNG LƯỢNG MẶT TRỜI HYBRID SOFAR 1 PHA
            </p>
          </div>

          <section className="border-b border-[#8ea2bf]">
            <div className="grid grid-cols-[1fr_290px] border-b border-dashed border-[#808080] bg-[#f2f4f7] text-[15px] font-bold text-[#1f4b8f]">
              <div className="border-r border-dashed border-[#808080] px-4 py-2">THÔNG TIN KHÁCH HÀNG</div>
              <div className="px-4 py-2 text-right">Ngày báo giá: {date}</div>
            </div>
            <div className="grid grid-cols-2 border-b border-dashed border-[#808080] text-[15px]">
              <div className="border-r border-dashed border-[#808080] px-4 py-2">
                <span className="font-semibold">Kính gửi :</span> {quote.customer}
              </div>
              <div className="px-4 py-2">
                <span className="font-semibold">Địa chỉ :</span> {quote.address || " "}
              </div>
            </div>
            <div className="grid grid-cols-2 text-[15px]">
              <div className="border-r border-dashed border-[#808080] px-4 py-2">
                <span className="font-semibold">Hotline :</span> {quote.phone || " "}
              </div>
              <div className="px-4 py-2">
                <span className="font-semibold">Mã báo giá :</span> {quote.code}
              </div>
            </div>
          </section>

          <section className="px-1 pt-1">
            <table className="w-full border-collapse text-[15px]">
              <thead>
                <tr className="bg-[#edf4ff] text-[#1f4b8f]">
                  <th className="border border-[#9ca3af] px-2 py-2 text-center w-[48px]">STT</th>
                  <th className="border border-[#9ca3af] px-3 py-2 text-left">SẢN PHẨM - THÔNG SỐ KỸ THUẬT</th>
                  <th className="border border-[#9ca3af] px-3 py-2 text-center w-[160px]">HÌNH ẢNH</th>
                  <th className="border border-[#9ca3af] px-3 py-2 text-center w-[86px]">ĐVT</th>
                  <th className="border border-[#9ca3af] px-3 py-2 text-center w-[76px]">SL</th>
                  <th className="border border-[#9ca3af] px-3 py-2 text-right w-[140px]">ĐƠN GIÁ</th>
                  <th className="border border-[#9ca3af] px-3 py-2 text-right w-[150px] text-[#f97316]">THÀNH TIỀN</th>
                </tr>
              </thead>
              <tbody>
                {quote.lines.map((line, index) => (
                  <tr key={line.id} className="align-top">
                    <td className="border border-[#c7ced8] px-2 py-3 text-center">{index + 1}</td>
                    <td className="border border-[#c7ced8] px-3 py-3">
                      <div className="whitespace-pre-line font-medium leading-6">{line.name}</div>
                    </td>
                    <td className="border border-[#c7ced8] px-2 py-3">
                      {line.image ? (
                        <img
                          src={line.image}
                          alt={line.name}
                          className="mx-auto h-[96px] w-[96px] object-contain"
                        />
                      ) : null}
                    </td>
                    <td className="border border-[#c7ced8] px-2 py-3 text-center">{line.unit}</td>
                    <td className="border border-[#c7ced8] px-2 py-3 text-center">{line.qty}</td>
                    <td className="border border-[#c7ced8] px-3 py-3 text-right">{formatVnd(line.unitPrice)}</td>
                    <td className="border border-[#c7ced8] px-3 py-3 text-right font-semibold">
                      {formatVnd(line.qty * line.unitPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[#5a88be] text-white">
                  <td colSpan={6} className="border border-[#5a88be] px-3 py-3 text-right font-black uppercase">
                    TỔNG CỘNG CHI PHÍ
                  </td>
                  <td className="border border-[#5a88be] px-3 py-3 text-right text-[20px] font-black text-[#ff8a00]">
                    {formatVnd(quote.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </section>

          <section className="grid grid-cols-[1.15fr_1fr] gap-0 border-t border-[#8ea2bf]">
            <div className="border-r border-[#8ea2bf] p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-md border border-[#c8d6ea] p-3">
                  <p className="text-[15px] font-black text-[#1f4b8f]">CAM KẾT CHẤT LƯỢNG</p>
                  <ul className="mt-2 space-y-1 text-[13px]">
                    <li>Hàng chính hãng 100%</li>
                    <li>Bảo hành dài hạn</li>
                    <li>Thi công chuyên nghiệp</li>
                    <li>Hỗ trợ kỹ thuật 24/7</li>
                  </ul>
                </div>
                <div className="rounded-md border border-[#c8d6ea] p-3">
                  <p className="text-[15px] font-black text-[#f97316]">LỢI ÍCH KHI DÙNG ĐIỆN MẶT TRỜI</p>
                  <ul className="mt-2 space-y-1 text-[13px]">
                    <li>Tiết kiệm 40-70% tiền điện</li>
                    <li>Năng lượng xanh cho cuộc sống bền vững</li>
                    <li>Tăng giá trị công trình</li>
                    <li>Giảm phát thải CO2</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 text-[13px]">
                <p className="font-bold">Lưu ý :</p>
                <p>* Giá trên chưa bao gồm Vat</p>
                <p>* Chưa bao gồm làm khung gia tăng</p>
                <p>* Không bao gồm chi phí phát sinh khác ngoài báo giá</p>
                <p>* Hiệu lực báo giá 5 ngày kể từ ngày phát hành.</p>
              </div>
            </div>
            <div className="flex flex-col justify-between p-4">
              <div className="mx-auto max-w-[260px] text-center">
                <div className="text-[30px] font-black italic text-[#f97316]">
                  Năng lượng xanh
                </div>
                <div className="text-[22px] font-semibold text-[#f97316]">
                  cho cuộc sống bền vững!
                </div>
              </div>
              <div className="text-right text-[15px]">
                <p>Ngày báo giá: {date}</p>
                <p className="mt-4 font-black uppercase">GIÁM ĐỐC</p>
                <p className="mt-6 text-[18px] font-black text-[#143c74]">TRẦN ĐÌNH HOÀNG</p>
              </div>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
