import { useRef, useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Leaf, Phone, Printer, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortalGate } from "@/components/portal-gate";
import { useStore } from "@/context/store";
import { loadSolarQuotes } from "@/data/solar-quotes";
import { images } from "@/data/mock";
import { formatVnd } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/portal/quan-ly-bao-gia/$id")({
  head: () => ({ meta: [{ title: "Xem báo giá | Hoàng Vĩnh VKT" }, { name: "robots", content: "noindex" }] }),
  component: QuoteInvoicePage,
});

function QuoteInvoicePage() {
  const { id } = useParams({ from: "/portal/quan-ly-bao-gia/$id" });
  const { user } = useStore();
  const quote = loadSolarQuotes().find((item) => item.id === id);
  const pageRef = useRef<HTMLElement>(null);
  const [downloading, setDownloading] = useState(false);
  if (!user) return <PortalGate />;
  if (!quote) return <div className="grid h-full place-items-center"><Button asChild><Link to="/portal/quan-ly-bao-gia"><ArrowLeft /> Quay lại</Link></Button></div>;
  const date = new Intl.DateTimeFormat("vi-VN").format(new Date(quote.createdAt));
  const promises = ["Hàng chính hãng 100%", "Bảo hành dài hạn", "Thi công chuyên nghiệp", "Hỗ trợ kỹ thuật 24/7"];
  const benefits = ["Tiết kiệm 40 - 70% tiền điện", "Chủ động nguồn điện", "Giảm phát thải CO₂", "Tăng giá trị bất động sản"];

  const downloadPdf = async () => {
    const page = pageRef.current;
    if (!page || downloading) return;
    setDownloading(true);
    try {
      await document.fonts.ready;
      await Promise.all(Array.from(page.querySelectorAll("img")).map((image) => image.complete ? Promise.resolve() : new Promise<void>((resolve) => {
        image.addEventListener("load", () => resolve(), { once: true });
        image.addEventListener("error", () => resolve(), { once: true });
      })));
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
      const canvas = await html2canvas(page, { scale: 2, useCORS: true, backgroundColor: "#ffffff", logging: false });
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      const pageWidth = 210;
      const pageHeight = 297;
      const renderedHeight = (canvas.height * pageWidth) / canvas.width;
      const pageImage = canvas.toDataURL("image/jpeg", 0.92);
      let offset = 0;
      let pageIndex = 0;
      while (offset + 0.5 < renderedHeight) {
        if (pageIndex > 0) pdf.addPage();
        pdf.addImage(pageImage, "JPEG", 0, -offset, pageWidth, renderedHeight, undefined, "FAST");
        offset += pageHeight;
        pageIndex += 1;
      }
      const safeCode = quote.code.replace(/[^a-zA-Z0-9_-]+/g, "-");
      pdf.save(`Bao-gia-${safeCode}.pdf`);
      toast.success("Đã tải báo giá PDF");
    } catch {
      toast.error("Không thể tạo PDF. Vui lòng thử lại.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-20 overflow-auto bg-[#dce5f2] py-4 print:static print:bg-white print:py-0">
      <style>{`@page{size:A4 portrait;margin:0}.quote-page{width:210mm;min-height:297mm}.quote-table{table-layout:fixed}.quote-table thead{display:table-header-group}.quote-table tr{break-inside:avoid;page-break-inside:avoid}@media print{html,body{width:210mm;margin:0!important;padding:0!important;background:#fff!important}.quote-page{margin:0!important;border:0!important;box-shadow:none!important}*{print-color-adjust:exact!important;-webkit-print-color-adjust:exact!important}}`}</style>
      <div className="mx-auto mb-3 flex w-[210mm] justify-between print:hidden">
        <Button asChild variant="outline" size="sm"><Link to="/portal/quan-ly-bao-gia"><ArrowLeft className="h-4 w-4" /> Quay lại</Link></Button>
        <Button size="sm" disabled={downloading} onClick={downloadPdf}><Printer className="h-4 w-4" /> {downloading ? "Đang tạo PDF..." : "Tải PDF"}</Button>
      </div>
      <article ref={pageRef} className="quote-page mx-auto overflow-hidden border-2 border-[#1364ad] bg-white text-[#111] shadow-xl print:shadow-none">
        <header className="grid h-[37mm] grid-cols-[1.18fr_.82fr] overflow-hidden border-b-[2.5mm] border-[#f5a623] bg-[#05326e] text-white">
          <div className="flex items-center gap-[4mm] px-[8mm]">
            <div className="grid h-[18mm] w-[18mm] shrink-0 place-items-center rounded border-2 border-[#f5a623] text-[15pt] font-black italic">HV</div>
            <div><p className="whitespace-nowrap text-[14pt] font-black">CÔNG TY TNHH HOÀNG VĨNH IOT</p><p className="mt-1 text-[8.5pt] font-extrabold text-[#ffb224]">GIẢI PHÁP ĐIỆN NĂNG LƯỢNG MẶT TRỜI</p><div className="mt-2 flex gap-5 text-[8pt] font-bold"><span>MST: <b className="text-[#ffb224]">3002273022</b></span><span className="flex gap-1"><Phone className="h-3 w-3" />0777 28 4444</span></div></div>
          </div>
          <div className="bg-cover bg-center" style={{ backgroundImage: `url(${images.hero})` }} />
        </header>
        <section className="bg-[linear-gradient(135deg,#fff,#edf5ff,#fff)] px-[5mm] py-[4mm] text-center"><h1 className="text-[17pt] font-black text-[#467dbb]">BÁO GIÁ LẮP ĐẶT TRỌN GÓI</h1><p className="mt-1 text-[10pt] font-bold uppercase text-[#555]">{quote.systemTitle}</p></section>
        <section className="border-y border-[#8da8c2] text-[8pt]">
          <div className="grid grid-cols-[1fr_62mm] border-b border-dashed border-[#888] bg-[#f1f3f5] font-bold text-[#174e8f]"><div className="border-r border-dashed border-[#888] px-[5mm] py-[1.5mm] text-center">THÔNG TIN KHÁCH HÀNG</div><div className="px-[4mm] py-[1.5mm] text-center">Ngày báo giá: {date}</div></div>
          <div className="grid grid-cols-[1fr_1.14fr]"><div className="border-r border-dashed border-[#888] px-[5mm] py-[1.8mm]"><b>Kính gửi:</b> {quote.customer}</div><div className="px-[5mm] py-[1.8mm]"><b>Địa chỉ:</b> {quote.address || "........................"} &nbsp; <b>Hotline:</b> {quote.phone}</div></div>
        </section>
        <p className="border-b border-[#9ab1c8] px-2 py-1 text-center text-[9pt] font-bold text-[#00a65a]">CÔNG TY ĐIỆN MẶT TRỜI HOÀNG VĨNH - LẬP DỰ TOÁN BÁO GIÁ NHƯ SAU</p>
        <table className="quote-table w-full border-collapse text-[7.2pt] leading-[1.25]">
          <colgroup><col className="w-[5%]"/><col className="w-[41%]"/><col className="w-[19%]"/><col className="w-[5%]"/><col className="w-[5%]"/><col className="w-[12%]"/><col className="w-[13%]"/></colgroup>
          <thead><tr className="bg-[#dfeaf5] font-black text-[#144b86]"><th className="border border-[#aeb8c2] py-1">STT</th><th className="border border-[#aeb8c2]">SẢN PHẨM - THÔNG SỐ KỸ THUẬT</th><th className="border border-[#aeb8c2]">HÌNH ẢNH</th><th className="border border-[#aeb8c2]">ĐVT</th><th className="border border-[#aeb8c2]">SL</th><th className="border border-[#aeb8c2]">ĐƠN GIÁ</th><th className="border border-[#aeb8c2] text-[#f26a21]">THÀNH TIỀN</th></tr></thead>
          <tbody>{quote.lines.map((line, index) => {
            const mergeAccessoryPrices = index === 4 && quote.lines[5]?.name.includes("Dây dẫn");
            const priceMergedAbove = index === 5 && quote.lines[4]?.name.includes("Gói phụ kiện");
            return <tr key={line.id} className="align-middle"><td className="border border-[#bfc6cd] text-center">{index + 1}</td><td className="border border-[#bfc6cd] px-[2mm] py-[1.2mm] align-top"><p className="whitespace-pre-line font-semibold">{line.name}</p>{line.specs.map((spec) => <p key={spec}>• {spec}</p>)}</td><td className="border border-[#bfc6cd] p-1">{line.image && <img src={line.image} alt="" className="mx-auto h-[19mm] w-[25mm] object-contain"/>}</td><td className="border border-[#bfc6cd] text-center">{line.unit}</td><td className="border border-[#bfc6cd] text-center">{line.qty}</td>{!priceMergedAbove && <td rowSpan={mergeAccessoryPrices ? 2 : 1} className="border border-[#bfc6cd] px-1 text-right align-middle">{line.unitPrice ? formatVnd(line.unitPrice) : ""}</td>}{!priceMergedAbove && <td rowSpan={mergeAccessoryPrices ? 2 : 1} className="border border-[#bfc6cd] px-1 text-right align-middle font-semibold">{line.unitPrice ? formatVnd(line.qty * line.unitPrice) : ""}</td>}</tr>;
          })}</tbody>
          <tfoot><tr><td colSpan={6} className="border border-[#1d5d9d] bg-[#4e83b9] py-1.5 text-center text-[9pt] font-black text-white">TỔNG CỘNG CHI PHÍ</td><td className="border border-[#1d5d9d] bg-[#e6eef7] px-1 text-right text-[9pt] font-black text-[#f26a21]">{formatVnd(quote.total)}</td></tr></tfoot>
        </table>
        <section className="grid grid-cols-[1.45fr_.85fr] border-b border-[#b4c8dc] bg-[linear-gradient(160deg,#eef7ff,#fff_45%,#e9f5ff)] text-[6.8pt]">
          <div className="grid grid-cols-2 gap-3 p-3"><div><p className="flex items-center gap-1 font-black text-[#174e8f]"><ShieldCheck className="h-5 w-5"/>CAM KẾT CHẤT LƯỢNG</p>{promises.map(x=><p key={x} className="mt-1 flex gap-1"><CheckCircle2 className="h-2.5 w-2.5 text-[#2373b9]"/>{x}</p>)}</div><div><p className="flex items-center gap-1 font-black text-[#ef7b16]"><Leaf className="h-5 w-5"/>LỢI ÍCH KHI SỬ DỤNG</p>{benefits.map(x=><p key={x} className="mt-1 flex gap-1"><CheckCircle2 className="h-2.5 w-2.5 text-[#ef7b16]"/>{x}</p>)}</div></div>
          <div className="flex items-center justify-center text-center text-[11pt] font-bold italic text-[#f28c22]">Năng lượng xanh<br/>cho cuộc sống bền vững!</div>
        </section>
        <footer className="grid grid-cols-[1.4fr_.6fr] px-[7mm] py-[3mm] text-[7.5pt]"><div><p className="font-bold">Lưu ý:</p><p>* Giá trên chưa bao gồm VAT</p><p>* Chưa bao gồm làm khung giàn thay đổi kết cấu</p><p>* Không bao gồm chi phí phát sinh khác ngoài báo giá</p><p>* Hiệu lực báo giá 5 ngày kể từ ngày phát hành.</p></div><div className="text-center"><p className="italic">Ngày báo giá: {date}</p><p className="mt-1 font-black">GIÁM ĐỐC</p><p className="mt-[7mm] text-[9pt] font-black">TRẦN ĐÌNH HOÀNG</p></div></footer>
      </article>
    </div>
  );
}
