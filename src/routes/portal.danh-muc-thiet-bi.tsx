import { createFileRoute } from "@tanstack/react-router";
import { PortalGate } from "@/components/portal-gate";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { equipmentCatalogGroups, type EquipmentCatalogGroup } from "@/data/equipment-catalog";
import { useStore } from "@/context/store";
import { formatVnd } from "@/lib/format";

export const Route = createFileRoute("/portal/danh-muc-thiet-bi")({
  head: () => ({
    meta: [
      { title: "Danh mục thiết bị | Hoàng Vĩnh VKT" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EquipmentCatalogPage,
});

function EquipmentCatalogPage() {
  const { user } = useStore();
  if (!user) return <PortalGate />;

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden px-3 pt-3 pb-3 lg:px-4">
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-none border border-border bg-card">
        <div className="shrink-0 bg-brand-dark px-4 py-2 text-sm font-bold uppercase tracking-wide text-brand-foreground">
          Danh mục thiết bị
        </div>
        <Tabs defaultValue={equipmentCatalogGroups[0].id} className="flex min-h-0 flex-1 flex-col p-3">
          <TabsList className="grid h-auto shrink-0 grid-cols-2 gap-1 rounded-none border border-border bg-secondary/40 p-1 sm:grid-cols-3 xl:grid-cols-6">
            {equipmentCatalogGroups.map((group) => (
              <TabsTrigger
                key={group.id}
                value={group.id}
                className="min-h-9 rounded-none px-2 py-1.5 text-[11px] font-semibold data-[state=active]:bg-brand data-[state=active]:text-brand-foreground data-[state=active]:shadow-none sm:text-xs"
              >
                {group.tabLabel}
              </TabsTrigger>
            ))}
          </TabsList>

          {equipmentCatalogGroups.map((group) => (
            <TabsContent key={group.id} value={group.id} className="mt-2 min-h-0 flex-1 overflow-hidden">
              <CatalogTable group={group} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

function CatalogTable({ group }: { group: EquipmentCatalogGroup }) {
  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden border border-brand-dark bg-card">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-secondary px-3 py-2">
        <h2 className="text-xs font-bold uppercase tracking-wide text-brand-dark">{group.title}</h2>
        <span className="whitespace-nowrap rounded-sm border border-brand/20 bg-brand/5 px-2 py-0.5 text-[10px] font-semibold text-brand">
          {group.items.length} mục
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full min-w-[920px] table-fixed border-collapse text-[11px]">
          <colgroup>
            <col className="w-[6%]" />
            <col className="w-[14%]" />
            <col className="w-[24%]" />
            <col className="w-[22%]" />
            <col className="w-[8%]" />
            <col className="w-[13%]" />
            <col className="w-[13%]" />
          </colgroup>
          <thead className="sticky top-0 z-10 bg-amber-100 text-[10px] font-bold uppercase text-amber-950">
            <tr>
              <th className="border-b border-r border-border px-2 py-2 text-center">STT</th>
              <th className="border-b border-r border-border px-2 py-2 text-left">Mã</th>
              <th className="border-b border-r border-border px-2 py-2 text-left">Tên thiết bị / dịch vụ</th>
              <th className="border-b border-r border-border px-2 py-2 text-left">Thông số</th>
              <th className="border-b border-r border-border px-2 py-2 text-center">ĐVT</th>
              <th className="border-b border-r border-border px-2 py-2 text-right">Đơn giá tham khảo</th>
              <th className="border-b border-border px-2 py-2 text-left">Bảo hành / ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {group.items.map((item, index) => (
              <tr key={item.code} className="border-b border-border hover:bg-secondary/30">
                <td className="border-r border-border px-2 py-2.5 text-center font-semibold tabular-nums">{index + 1}</td>
                <td className="border-r border-border px-2 py-2.5 font-medium text-muted-foreground">{item.code}</td>
                <td className="border-r border-border px-2 py-2.5 font-semibold">{item.name}</td>
                <td className="border-r border-border px-2 py-2.5 text-muted-foreground">{item.specification}</td>
                <td className="border-r border-border px-2 py-2.5 text-center">{item.unit}</td>
                <td className="border-r border-border px-2 py-2.5 text-right font-semibold tabular-nums">{formatVnd(item.referencePrice)}</td>
                <td className="px-2 py-2.5 text-muted-foreground">{item.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
