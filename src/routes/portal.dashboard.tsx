import { useEffect, useState } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Eye, Plus, Printer, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PortalGate } from "@/components/portal-gate";
import { EstimateWorksheet } from "@/components/estimate-worksheet";
import { blankQuoteDoc, QuoteDocument, type QuoteDocForm } from "@/components/quote-document";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/context/store";
import { company } from "@/data/mock";
import { loadAdminMaterials } from "@/data/materials-store";
import { type Material } from "@/data/materials";
import {
  emptyQuoteLine,
  loadSolarQuotes,
  newQuoteCode,
  newQuoteId,
  quoteTotal,
  saveSolarQuotes,
  seedSolarQuotes,
  type SolarQuote,
  type SolarQuoteStatus,
} from "@/data/solar-quotes";
import { formatVnd } from "@/lib/format";

type SearchTab = "du-toan" | "bao-gia" | "create";

export const Route = createFileRoute("/portal/dashboard")({
  beforeLoad: () => {
    throw redirect({ to: "/portal/cong-cu-du-toan" });
  },
  validateSearch: (search: Record<string, unknown>): { tab?: SearchTab; edit?: string } => {
    if (search.tab === "create" || search.tab === "bao-gia" || search.tab === "du-toan") {
      return {
        tab: search.tab,
        edit: typeof search.edit === "string" ? search.edit : undefined,
      };
    }
    return { edit: typeof search.edit === "string" ? search.edit : undefined };
  },
  head: () => ({
    meta: [
      { title: "Dự toán - Báo giá | Hoàng Vĩnh VKT" },
      { name: "description", content: "Dự toán hệ thống điện mặt trời và quản lý báo giá trên Portal." },
      { property: "og:title", content: "Dự toán - Báo giá | Hoàng Vĩnh VKT" },
      { property: "og:description", content: "Dự toán và danh sách báo giá dành cho Admin và Sale." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SolarDashboard,
});

export { PortalGate };

function formFromQuote(quote: SolarQuote): QuoteDocForm {
  return {
    customer: quote.customer === "Chưa đặt tên" ? "" : quote.customer,
    address: quote.address ?? "",
    phone: quote.phone ?? "",
    systemTitle: quote.systemTitle ?? "",
    lines: quote.lines?.length ? quote.lines.map((l) => ({ ...l, specs: [...l.specs] })) : [emptyQuoteLine()],
  };
}

function SolarDashboard() {
  const { user } = useStore();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/portal/dashboard" });
  const creating = search.tab === "create";
  const mainTab = search.tab === "bao-gia" || creating ? "bao-gia" : "du-toan";
  const setMainTab = (next: "du-toan" | "bao-gia") => {
    navigate({ search: next === "du-toan" ? {} : { tab: "bao-gia" }, replace: true });
  };
  const setView = (next: "list" | "create") => {
    navigate({ search: next === "list" ? { tab: "bao-gia" } : { tab: "create" }, replace: true });
  };

  const [quotes, setQuotes] = useState<SolarQuote[]>(seedSolarQuotes);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [form, setForm] = useState<QuoteDocForm>(() => blankQuoteDoc());
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setQuotes(loadSolarQuotes());
    setMaterials(loadAdminMaterials());
  }, []);

  useEffect(() => {
    if (!search.edit || !quotes.length) return;
    const target = quotes.find((q) => q.id === search.edit);
    if (!target) return;
    setEditingId(target.id);
    setForm(formFromQuote(target));
    navigate({ search: { tab: "create" }, replace: true });
  }, [search.edit, quotes, navigate]);

  if (!user) return <PortalGate />;

  const persistQuotes = (next: SolarQuote[]) => {
    setQuotes(next);
    saveSolarQuotes(next);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(blankQuoteDoc());
    setView("create");
  };

  const openDraft = (quote: SolarQuote) => {
    setEditingId(quote.id);
    setForm(formFromQuote(quote));
    setView("create");
  };

  const saveQuote = (status: SolarQuoteStatus) => {
    const name = form.customer.trim() || (status === "draft" ? "Chưa đặt tên" : "");
    if (status === "issued" && !form.customer.trim()) {
      toast.error("Vui lòng nhập tên khách hàng.");
      return;
    }
    const lines = form.lines.filter((l) => l.materialId);
    if (status === "issued" && !lines.length) {
      toast.error("Chọn ít nhất một sản phẩm.");
      return;
    }

    const existing = editingId ? quotes.find((q) => q.id === editingId) : undefined;
    const total = quoteTotal(lines);
    const quote: SolarQuote = {
      id: existing?.id ?? newQuoteId(),
      code: existing?.code ?? newQuoteCode(quotes),
      customer: name,
      address: form.address.trim(),
      phone: form.phone.trim(),
      packageType: existing?.packageType ?? "Mái tôn",
      systemTitle: form.systemTitle.trim(),
      solution: existing?.solution ?? "Hòa lưới bám tải",
      capacityKwp: existing?.capacityKwp ?? 0,
      monthlyKwh: existing?.monthlyKwh ?? 0,
      tariff: existing?.tariff ?? 0,
      total,
      paybackYears: existing?.paybackYears ?? 0,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      status,
      lines,
    };

    persistQuotes(
      existing ? quotes.map((q) => (q.id === existing.id ? quote : q)) : [quote, ...quotes],
    );
    toast.success(status === "draft" ? `Đã lưu nháp ${quote.code}` : `Đã lưu ${quote.code}`);
    setForm(blankQuoteDoc());
    setEditingId(null);
    setView("list");
  };

  const deleteQuote = (id: string) => {
    const target = quotes.find((q) => q.id === id);
    if (!target) return;
    if (!window.confirm(`Xóa ${target.status === "draft" ? "bản nháp" : "báo giá"} ${target.code}?`))
      return;
    persistQuotes(quotes.filter((q) => q.id !== id));
    toast.success(`Đã xóa ${target.code}`);
  };

  const openQuotePreview = (quote: SolarQuote, print: boolean) => {
    const w = window.open("", "_blank", "noopener,noreferrer,width=900,height=1100");
    if (!w) {
      toast.info("Không mở được cửa sổ xem. Cho phép pop-up rồi thử lại.");
      return;
    }
    const date = new Intl.DateTimeFormat("vi-VN").format(new Date(quote.createdAt));
    const rows = quote.lines
      .map((line, i) => {
        const specs = line.specs.map((s) => `<li>${escapeHtml(s)}</li>`).join("");
        const img = line.image
          ? `<img src="${escapeHtml(line.image)}" alt="" style="width:56px;height:56px;object-fit:cover;border-radius:6px;border:1px solid #e2e8f0"/>`
          : "";
        return `<tr>
          <td style="text-align:center">${i + 1}</td>
          <td><b>${escapeHtml(line.name)}</b><ul>${specs}</ul></td>
          <td style="text-align:center">${img}</td>
          <td style="text-align:center">${escapeHtml(line.unit)}</td>
          <td style="text-align:center">${line.qty}</td>
          <td style="text-align:right">${formatVnd(line.unitPrice)}</td>
          <td style="text-align:right"><b>${formatVnd(line.qty * line.unitPrice)}</b></td>
        </tr>`;
      })
      .join("");

    w.document.write(`<!doctype html><html lang="vi"><head><meta charset="utf-8"/>
      <title>${escapeHtml(quote.code)}</title>
      <style>
        body{font-family:Be Vietnam Pro,Arial,sans-serif;color:#0f172a;padding:28px;max-width:900px;margin:auto}
        .head{display:flex;justify-content:space-between;gap:16px;background:#1e3a5f;color:#fff;padding:18px;border-radius:10px}
        h1{font-size:20px;margin:18px 0 4px;text-align:center;color:#1d4ed8;text-transform:uppercase}
        .sub{text-align:center;font-weight:700;margin:0 0 16px}
        .muted{color:#64748b;font-size:12px}
        table{width:100%;border-collapse:collapse;font-size:12px}
        th{background:#1e3a5f;color:#fff;padding:8px 6px;text-align:left;text-transform:uppercase;font-size:11px}
        td{border-bottom:1px solid #e2e8f0;padding:8px 6px;vertical-align:top}
        ul{margin:4px 0 0;padding-left:16px;color:#64748b}
        .tot{background:#2563eb;color:#fff;display:flex;justify-content:space-between;padding:10px 14px;font-weight:800;text-transform:uppercase;border-radius:6px;margin-top:12px}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px;font-size:12px}
        .box{border:1px solid #e2e8f0;border-radius:8px;padding:12px}
      </style></head><body>
      <div class="head">
        <div>
          <div style="font-size:18px;font-weight:800;letter-spacing:.04em">HOÀNG VĨNH VKT</div>
          <div class="muted" style="color:#cbd5e1">${escapeHtml(company.name)} – Giải pháp điện năng lượng mặt trời</div>
          <div class="muted" style="color:#cbd5e1;margin-top:8px">Hotline: ${escapeHtml(company.hotline)} · ${escapeHtml(company.phone)}</div>
        </div>
        <div style="font-size:12px;text-align:right">${escapeHtml(quote.code)}</div>
      </div>
      <h1>Báo giá lắp đặt trọn gói</h1>
      <p class="sub">${escapeHtml(quote.systemTitle || "")}</p>
      <p>Kính gửi: <b>${escapeHtml(quote.customer)}</b><br/>
      Địa chỉ: ${escapeHtml(quote.address || "—")}<br/>
      Hotline: ${escapeHtml(quote.phone || "—")}<br/>
      <span class="muted">Ngày báo giá: ${date}</span></p>
      <table><thead><tr>
        <th>STT</th><th>Sản phẩm – Thông số kỹ thuật</th><th>Hình ảnh</th><th>ĐVT</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th>
      </tr></thead><tbody>${rows}</tbody></table>
      <div class="tot"><span>Tổng cộng chi phí</span><span>${formatVnd(quote.total)}</span></div>
      <div class="grid">
        <div class="box"><b>Cam kết chất lượng</b><p>100% hàng chính hãng · Bảo hành dài hạn · Thi công chuyên nghiệp · Hỗ trợ 24/7</p></div>
        <div class="box"><b>Lợi ích</b><p>Tiết kiệm 40–70% tiền điện · Năng lượng xanh · Tăng giá trị công trình</p></div>
      </div>
      <p class="muted" style="margin-top:16px">Giá chưa gồm VAT. Báo giá có hiệu lực 5 ngày. Bản demo — in hoặc lưu PDF từ hộp thoại trình duyệt.</p>
      </body></html>`);
    w.document.close();
    w.focus();
    if (print) {
      setTimeout(() => w.print(), 250);
      toast.success("Đã mở bản in / Xuất PDF (demo)", { description: quote.code });
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden px-6 pt-6 lg:px-8">
      <header className="shrink-0 border-b border-border bg-background pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-black sm:text-3xl">Dự toán - Báo giá</h1>
          {mainTab === "bao-gia" ? (
            creating ? (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setView("list")}>
                  Về danh sách
                </Button>
                <Button type="button" variant="outline" onClick={() => saveQuote("draft")}>
                  Lưu nháp
                </Button>
                <Button
                  type="button"
                  className="bg-brand-dark text-brand-foreground hover:bg-brand-dark/90"
                  onClick={() => saveQuote("issued")}
                >
                  <Plus className="h-4 w-4" /> Lưu báo giá
                </Button>
              </div>
            ) : (
              <Button
                className="shrink-0 bg-brand-dark text-brand-foreground hover:bg-brand-dark/90"
                onClick={openCreate}
              >
                <Plus className="h-4 w-4" /> Tạo báo giá
              </Button>
            )
          ) : null}
        </div>

        <Tabs
          value={mainTab}
          onValueChange={(v) => setMainTab(v as "du-toan" | "bao-gia")}
          className="mt-4"
        >
          <TabsList>
            <TabsTrigger value="du-toan">Dự toán</TabsTrigger>
            <TabsTrigger value="bao-gia">Báo giá</TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-5 pb-6">
      {mainTab === "du-toan" ? (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <EstimateWorksheet />
        </div>
      ) : creating ? (
        <form
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          onSubmit={(e) => {
            e.preventDefault();
            saveQuote("issued");
          }}
        >
          <QuoteDocument form={form} onChange={setForm} materials={materials} />
        </form>
      ) : (
          <section className="min-h-0 flex-1 overflow-auto rounded-xl border border-border bg-card">
            {quotes.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted-foreground">
                Chưa có báo giá. Bấm “Tạo báo giá” để thêm.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Hệ thống</TableHead>
                    <TableHead className="text-right">Tổng tiền</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotes.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell className="font-semibold text-brand">{q.code}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-2">
                          {q.customer}
                          {q.status === "draft" ? (
                            <Badge variant="secondary" className="font-normal">
                              Nháp
                            </Badge>
                          ) : null}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="block max-w-[280px] truncate">
                          {q.systemTitle || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {q.total ? formatVnd(q.total) : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="outline" size="sm" onClick={() => openDraft(q)}>
                            <Eye className="h-4 w-4" /> Xem
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openQuotePreview(q, true)}>
                            <Printer className="h-4 w-4" /> Xuất PDF
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            aria-label={`Xóa ${q.code}`}
                            onClick={() => deleteQuote(q.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </section>
      )}
      </div>
    </div>
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
