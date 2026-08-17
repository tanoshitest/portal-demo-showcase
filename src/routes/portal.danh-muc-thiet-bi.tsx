import { Fragment, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { PortalGate } from "@/components/portal-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  equipmentCatalogGroups,
  type EquipmentCatalogGroup,
  type EquipmentCatalogItem,
} from "@/data/equipment-catalog";
import { useStore } from "@/context/store";
import { formatVnd } from "@/lib/format";
import { persistLocalAndCloud } from "@/lib/cloud-state-client";

const EQUIPMENT_CATALOG_STORAGE_KEY = "portal-equipment-catalog-v5";

type CatalogFormValues = {
  code: string;
  name: string;
  specification: string;
  unit: string;
  referencePrice: string;
  note: string;
  capacityKwp: string;
  lengthMm: string;
  widthMm: string;
  areaM2: string;
  batteryGroup: string;
  capacityKwh: string;
  warrantyYears: string;
  stockQuantity: string;
  inverterGroup: string;
  catalogStt: string;
  capacityKw: string;
  profit: string;
  customerPrice: string;
  accessoryGroup: string;
  quantity: string;
};

type CatalogEditor = {
  groupId: string;
  originalItemId: string | null;
  values: CatalogFormValues;
};

function catalogItemId(item: EquipmentCatalogItem) {
  return item.id ?? item.code;
}

function cloneCatalogGroups(groups: EquipmentCatalogGroup[]) {
  return groups.map((group) => ({
    ...group,
    items: group.items.map((item) => ({ ...item })),
  }));
}

function itemToForm(item?: EquipmentCatalogItem): CatalogFormValues {
  return {
    code: item?.code ?? "",
    name: item?.name ?? "",
    specification: item?.specification ?? "",
    unit: item?.unit ?? "",
    referencePrice: item?.referencePrice == null ? "" : String(item.referencePrice),
    note: item?.note ?? "",
    capacityKwp: item?.capacityKwp == null ? "" : String(item.capacityKwp),
    lengthMm: item?.lengthMm == null ? "" : String(item.lengthMm),
    widthMm: item?.widthMm == null ? "" : String(item.widthMm),
    areaM2: item?.areaM2 == null ? "" : String(item.areaM2),
    batteryGroup: item?.batteryGroup ?? "",
    capacityKwh: item?.capacityKwh == null ? "" : String(item.capacityKwh),
    warrantyYears: item?.warrantyYears == null ? "" : String(item.warrantyYears),
    stockQuantity: item?.stockQuantity == null ? "" : String(item.stockQuantity),
    inverterGroup: item?.inverterGroup ?? "",
    catalogStt: item?.catalogStt == null ? "" : String(item.catalogStt),
    capacityKw: item?.capacityKw == null ? "" : String(item.capacityKw),
    profit: item?.profit == null ? "" : String(item.profit),
    customerPrice: item?.customerPrice == null ? "" : String(item.customerPrice),
    accessoryGroup: item?.accessoryGroup ?? "",
    quantity: item?.quantity == null ? "" : String(item.quantity),
  };
}

function parseOptionalNumber(value: string) {
  const compact = value.trim().replace(/\s/g, "");
  const normalized = compact.includes(".") ? compact.replace(/,/g, "") : compact.replace(",", ".");
  if (!normalized) return undefined;
  return Number(normalized);
}

function parseOptionalMoney(value: string) {
  const normalized = value.trim().replace(/[\s,.]/g, "");
  if (!normalized) return undefined;
  return Number(normalized);
}

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
  const [groups, setGroups] = useState(() => cloneCatalogGroups(equipmentCatalogGroups));
  const [activeGroupId, setActiveGroupId] = useState(equipmentCatalogGroups[0].id);
  const [editor, setEditor] = useState<CatalogEditor | null>(null);
  const [catalogReady, setCatalogReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(EQUIPMENT_CATALOG_STORAGE_KEY);
      if (saved) setGroups(JSON.parse(saved) as EquipmentCatalogGroup[]);
    } catch {
      localStorage.removeItem(EQUIPMENT_CATALOG_STORAGE_KEY);
    } finally {
      setCatalogReady(true);
    }
  }, []);

  useEffect(() => {
    if (catalogReady) persistLocalAndCloud(EQUIPMENT_CATALOG_STORAGE_KEY, groups);
  }, [catalogReady, groups]);

  const openCreate = (groupId: string) => {
    const values = itemToForm();
    values.unit = groupId === "pin" ? "Tấm" : "bộ";
    setEditor({ groupId, originalItemId: null, values });
  };

  const openEdit = (groupId: string, item: EquipmentCatalogItem) => {
    setEditor({ groupId, originalItemId: catalogItemId(item), values: itemToForm(item) });
  };

  const patchEditor = <K extends keyof CatalogFormValues>(key: K, value: CatalogFormValues[K]) => {
    setEditor((current) =>
      current ? { ...current, values: { ...current.values, [key]: value } } : current,
    );
  };

  const handleSave = (event: FormEvent) => {
    event.preventDefault();
    if (!editor) return;

    const code = editor.values.code.trim();
    const inputName = editor.values.name.trim();
    const specification = editor.values.specification.trim();
    const unit = editor.values.unit.trim();
    const name =
      editor.groupId === "bien-tan"
        ? specification.split("\n")[0]?.trim() || code || "Biến tần"
        : inputName;
    if (
      (editor.groupId !== "bien-tan" && !code) ||
      !name ||
      (!specification && editor.groupId !== "phu-kien") ||
      !unit
    ) {
      toast.error("Vui lòng nhập đủ mã, tên, diễn giải và đơn vị tính");
      return;
    }

    const referencePrice = parseOptionalMoney(editor.values.referencePrice);
    const capacityKwp = parseOptionalNumber(editor.values.capacityKwp);
    const lengthMm = parseOptionalNumber(editor.values.lengthMm);
    const widthMm = parseOptionalNumber(editor.values.widthMm);
    const areaM2 = parseOptionalNumber(editor.values.areaM2);
    const capacityKwh = parseOptionalNumber(editor.values.capacityKwh);
    const warrantyYears = parseOptionalNumber(editor.values.warrantyYears);
    const stockQuantity = parseOptionalNumber(editor.values.stockQuantity);
    const capacityKw = parseOptionalNumber(editor.values.capacityKw);
    const profit = parseOptionalMoney(editor.values.profit);
    const customerPrice = parseOptionalMoney(editor.values.customerPrice);
    const quantity = parseOptionalNumber(editor.values.quantity);
    if (
      [
        referencePrice,
        capacityKwp,
        lengthMm,
        widthMm,
        areaM2,
        capacityKwh,
        warrantyYears,
        stockQuantity,
        capacityKw,
        profit,
        customerPrice,
        quantity,
      ].some((value) => Number.isNaN(value))
    ) {
      toast.error("Các trường số đang có giá trị không hợp lệ");
      return;
    }

    const group = groups.find((item) => item.id === editor.groupId);
    const duplicateCode = code
      ? group?.items.some(
          (item) =>
            item.code.toLowerCase() === code.toLowerCase() && catalogItemId(item) !== editor.originalItemId,
        )
      : false;
    if (duplicateCode) {
      toast.error(`Mã ${code} đã tồn tại trong danh mục`);
      return;
    }

    const nextItem: EquipmentCatalogItem = {
      id: editor.originalItemId ?? `catalog-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      code,
      name,
      specification,
      unit,
      referencePrice: referencePrice ?? null,
      note: editor.values.note.trim(),
      ...(editor.groupId === "pin"
        ? {
            capacityKwp,
            lengthMm,
            widthMm,
            areaM2,
          }
        : {}),
      ...(editor.groupId === "pin-luu-tru"
        ? {
            batteryGroup: editor.values.batteryGroup.trim(),
            capacityKwh,
            warrantyYears,
            stockQuantity,
          }
        : {}),
      ...(editor.groupId === "bien-tan"
        ? {
            inverterGroup: editor.values.inverterGroup.trim(),
            catalogStt: editor.values.catalogStt.trim() || null,
            capacityKw,
            profit: profit ?? null,
            customerPrice: customerPrice ?? null,
          }
        : {}),
      ...(editor.groupId === "phu-kien"
        ? {
            accessoryGroup: editor.values.accessoryGroup.trim(),
            catalogStt: editor.values.catalogStt.trim() || null,
            quantity,
          }
        : {}),
    };

    setGroups((current) =>
      current.map((catalogGroup) => {
        if (catalogGroup.id !== editor.groupId) return catalogGroup;
        const itemIndex = catalogGroup.items.findIndex(
          (item) => catalogItemId(item) === editor.originalItemId,
        );
        const items = [...catalogGroup.items];
        if (itemIndex === -1) items.push(nextItem);
        else items[itemIndex] = nextItem;
        return { ...catalogGroup, items };
      }),
    );
    toast.success(editor.originalItemId ? "Đã cập nhật sản phẩm" : "Đã thêm sản phẩm", {
      description: name,
    });
    setEditor(null);
  };

  if (!user) return <PortalGate />;

  const editorGroup = groups.find((group) => group.id === editor?.groupId);
  const isPanelEditor = editor?.groupId === "pin";
  const isBatteryEditor = editor?.groupId === "pin-luu-tru";
  const isInverterEditor = editor?.groupId === "bien-tan";
  const isAccessoryEditor = editor?.groupId === "phu-kien";

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden px-3 pt-3 pb-3 lg:px-4">
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-none border border-border bg-card">
        <div className="shrink-0 bg-brand-dark px-4 py-2 text-sm font-bold uppercase tracking-wide text-brand-foreground">
          Danh mục thiết bị
        </div>
        <Tabs
          value={activeGroupId}
          onValueChange={setActiveGroupId}
          className="flex min-h-0 flex-1 flex-col p-3"
        >
          <TabsList className="grid h-auto shrink-0 grid-cols-2 gap-1 rounded-none border border-border bg-secondary/40 p-1 sm:grid-cols-3 xl:grid-cols-6">
            {groups.map((group) => (
              <TabsTrigger
                key={group.id}
                value={group.id}
                className="min-h-9 rounded-none px-2 py-1.5 text-[11px] font-semibold data-[state=active]:bg-brand data-[state=active]:text-brand-foreground data-[state=active]:shadow-none sm:text-xs"
              >
                {group.tabLabel}
              </TabsTrigger>
            ))}
          </TabsList>

          {groups.map((group) => (
            <TabsContent key={group.id} value={group.id} className="mt-2 min-h-0 flex-1 overflow-hidden">
              <CatalogTable
                group={group}
                onAdd={() => openCreate(group.id)}
                onEdit={(item) => openEdit(group.id, item)}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <Sheet open={editor != null} onOpenChange={(open) => !open && setEditor(null)}>
        <SheetContent
          side="right"
          className="flex h-full w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
        >
          <SheetHeader className="space-y-1 border-b border-border px-5 py-4 pr-12 text-left">
            <SheetTitle>{editor?.originalItemId ? "Sửa sản phẩm" : "Thêm sản phẩm"}</SheetTitle>
            <SheetDescription>
              {editorGroup?.tabLabel}. Có thể chỉnh sửa toàn bộ thông tin của sản phẩm.
            </SheetDescription>
          </SheetHeader>

          {editor ? (
            <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSave}>
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <CatalogField label={isPanelEditor ? "Mã hàng" : "Mã"} htmlFor="catalog-code">
                    <Input
                      id="catalog-code"
                      value={editor.values.code}
                      onChange={(event) => patchEditor("code", event.target.value)}
                      placeholder={isPanelEditor ? "Ví dụ: TRINA 630" : "Mã sản phẩm"}
                    />
                  </CatalogField>
                  {!isInverterEditor ? (
                    <CatalogField label="Tên sản phẩm" htmlFor="catalog-name">
                      <Input
                        id="catalog-name"
                        value={editor.values.name}
                        onChange={(event) => patchEditor("name", event.target.value)}
                        placeholder="Tên sản phẩm"
                      />
                    </CatalogField>
                  ) : null}
                  <CatalogField label="Đơn vị tính" htmlFor="catalog-unit">
                    <Input
                      id="catalog-unit"
                      value={editor.values.unit}
                      onChange={(event) => patchEditor("unit", event.target.value)}
                      placeholder="Tấm, bộ, gói..."
                    />
                  </CatalogField>
                  <CatalogField
                    label={
                      isPanelEditor || isBatteryEditor || isInverterEditor
                        ? "Giá gốc"
                        : isAccessoryEditor
                          ? "Đơn giá"
                          : "Đơn giá tham khảo"
                    }
                    htmlFor="catalog-price"
                  >
                    <Input
                      id="catalog-price"
                      inputMode="numeric"
                      value={editor.values.referencePrice}
                      onChange={(event) => patchEditor("referencePrice", event.target.value)}
                      placeholder="Để trống nếu chưa có giá"
                    />
                  </CatalogField>

                  {isPanelEditor ? (
                    <>
                      <CatalogField label="Công suất" htmlFor="catalog-capacity">
                        <Input
                          id="catalog-capacity"
                          inputMode="decimal"
                          value={editor.values.capacityKwp}
                          onChange={(event) => patchEditor("capacityKwp", event.target.value)}
                          placeholder="Ví dụ: 0.630"
                        />
                      </CatalogField>
                      <CatalogField label="Chiều dài (mm)" htmlFor="catalog-length">
                        <Input
                          id="catalog-length"
                          inputMode="numeric"
                          value={editor.values.lengthMm}
                          onChange={(event) => patchEditor("lengthMm", event.target.value)}
                        />
                      </CatalogField>
                      <CatalogField label="Chiều rộng (mm)" htmlFor="catalog-width">
                        <Input
                          id="catalog-width"
                          inputMode="numeric"
                          value={editor.values.widthMm}
                          onChange={(event) => patchEditor("widthMm", event.target.value)}
                        />
                      </CatalogField>
                      <CatalogField label="Tổng diện tích (m²)" htmlFor="catalog-area">
                        <Input
                          id="catalog-area"
                          inputMode="decimal"
                          value={editor.values.areaM2}
                          onChange={(event) => patchEditor("areaM2", event.target.value)}
                        />
                      </CatalogField>
                    </>
                  ) : null}

                  {isBatteryEditor ? (
                    <>
                      <CatalogField label="Nhóm pin" htmlFor="catalog-battery-group" className="sm:col-span-2">
                        <Input
                          id="catalog-battery-group"
                          value={editor.values.batteryGroup}
                          onChange={(event) => patchEditor("batteryGroup", event.target.value)}
                          placeholder="Ví dụ: PIN EJOR"
                        />
                      </CatalogField>
                      <CatalogField label="Dung lượng (kWh)" htmlFor="catalog-capacity-kwh">
                        <Input
                          id="catalog-capacity-kwh"
                          inputMode="decimal"
                          value={editor.values.capacityKwh}
                          onChange={(event) => patchEditor("capacityKwh", event.target.value)}
                        />
                      </CatalogField>
                      <CatalogField label="Bảo hành (năm)" htmlFor="catalog-warranty-years">
                        <Input
                          id="catalog-warranty-years"
                          inputMode="numeric"
                          value={editor.values.warrantyYears}
                          onChange={(event) => patchEditor("warrantyYears", event.target.value)}
                        />
                      </CatalogField>
                      <CatalogField label="Tồn kho" htmlFor="catalog-stock-quantity">
                        <Input
                          id="catalog-stock-quantity"
                          inputMode="numeric"
                          value={editor.values.stockQuantity}
                          onChange={(event) => patchEditor("stockQuantity", event.target.value)}
                        />
                      </CatalogField>
                    </>
                  ) : null}

                  {isInverterEditor ? (
                    <>
                      <CatalogField label="Nhóm biến tần" htmlFor="catalog-inverter-group" className="sm:col-span-2">
                        <Input
                          id="catalog-inverter-group"
                          value={editor.values.inverterGroup}
                          onChange={(event) => patchEditor("inverterGroup", event.target.value)}
                          placeholder="Ví dụ: Bảng giá biến tần Solis Hybrid 1 pha"
                        />
                      </CatalogField>
                      <CatalogField label="STT" htmlFor="catalog-stt">
                        <Input
                          id="catalog-stt"
                          inputMode="numeric"
                          value={editor.values.catalogStt}
                          onChange={(event) => patchEditor("catalogStt", event.target.value)}
                        />
                      </CatalogField>
                      <CatalogField label="Công suất (kW)" htmlFor="catalog-capacity-kw">
                        <Input
                          id="catalog-capacity-kw"
                          inputMode="decimal"
                          value={editor.values.capacityKw}
                          onChange={(event) => patchEditor("capacityKw", event.target.value)}
                        />
                      </CatalogField>
                      <CatalogField label="Lợi nhuận" htmlFor="catalog-profit">
                        <Input
                          id="catalog-profit"
                          inputMode="numeric"
                          value={editor.values.profit}
                          onChange={(event) => patchEditor("profit", event.target.value)}
                        />
                      </CatalogField>
                      <CatalogField label="Giá khách hàng" htmlFor="catalog-customer-price">
                        <Input
                          id="catalog-customer-price"
                          inputMode="numeric"
                          value={editor.values.customerPrice}
                          onChange={(event) => patchEditor("customerPrice", event.target.value)}
                        />
                      </CatalogField>
                    </>
                  ) : null}

                  {isAccessoryEditor ? (
                    <>
                      <CatalogField label="Nhóm phụ kiện" htmlFor="catalog-accessory-group" className="sm:col-span-2">
                        <Input
                          id="catalog-accessory-group"
                          value={editor.values.accessoryGroup}
                          onChange={(event) => patchEditor("accessoryGroup", event.target.value)}
                          placeholder="Ví dụ: A. PHỤ KIỆN LẮP ĐẶT TẤM PIN - TRƯỜNG HỢP LÀM MÁI TÔN"
                        />
                      </CatalogField>
                      <CatalogField label="STT" htmlFor="catalog-accessory-stt">
                        <Input
                          id="catalog-accessory-stt"
                          inputMode="numeric"
                          value={editor.values.catalogStt}
                          onChange={(event) => patchEditor("catalogStt", event.target.value)}
                        />
                      </CatalogField>
                      <CatalogField label="Số lượng" htmlFor="catalog-accessory-quantity">
                        <Input
                          id="catalog-accessory-quantity"
                          inputMode="decimal"
                          value={editor.values.quantity}
                          onChange={(event) => patchEditor("quantity", event.target.value)}
                        />
                      </CatalogField>
                    </>
                  ) : null}

                  <CatalogField
                    label={
                      isPanelEditor
                        ? "Tên hàng, diễn giải sản phẩm"
                        : isBatteryEditor
                          ? "Thông tin chi tiết pin"
                          : isInverterEditor
                            ? "Mã SP / Thông số kỹ thuật"
                            : "Thông số"
                    }
                    htmlFor="catalog-specification"
                    className="sm:col-span-2"
                  >
                    <Textarea
                      id="catalog-specification"
                      value={editor.values.specification}
                      onChange={(event) => patchEditor("specification", event.target.value)}
                      className="min-h-20"
                    />
                  </CatalogField>
                  {!isInverterEditor && !isAccessoryEditor ? (
                    <CatalogField
                      label="Bảo hành / ghi chú"
                      htmlFor="catalog-note"
                      className="sm:col-span-2"
                    >
                      <Textarea
                        id="catalog-note"
                        value={editor.values.note}
                        onChange={(event) => patchEditor("note", event.target.value)}
                        className="min-h-24"
                        placeholder="Mỗi nội dung có thể nhập trên một dòng"
                      />
                    </CatalogField>
                  ) : null}
                </div>
              </div>

              <SheetFooter className="border-t border-border px-5 py-4">
                <Button type="button" variant="outline" onClick={() => setEditor(null)}>
                  Hủy
                </Button>
                <Button type="submit">Lưu sản phẩm</Button>
              </SheetFooter>
            </form>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function CatalogField({
  label,
  htmlFor,
  className = "",
  children,
}: {
  label: string;
  htmlFor: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function CatalogTable({
  group,
  onAdd,
  onEdit,
}: {
  group: EquipmentCatalogGroup;
  onAdd: () => void;
  onEdit: (item: EquipmentCatalogItem) => void;
}) {
  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden border border-brand-dark bg-card">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-secondary px-3 py-2">
        <h2 className="text-xs font-bold uppercase tracking-wide text-brand-dark">{group.title}</h2>
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap rounded-sm border border-brand/20 bg-brand/5 px-2 py-0.5 text-[10px] font-semibold text-brand">
            {group.items.length} mục
          </span>
          <Button type="button" size="sm" className="h-7 rounded-sm px-2.5" onClick={onAdd}>
            <Plus className="size-3.5" />
            Thêm sản phẩm
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {group.id === "pin" ? (
          <PanelCatalogTable items={group.items} onEdit={onEdit} />
        ) : group.id === "bien-tan" ? (
          <InverterCatalogTable items={group.items} onEdit={onEdit} />
        ) : group.id === "pin-luu-tru" ? (
          <BatteryCatalogTable items={group.items} onEdit={onEdit} />
        ) : group.id === "phu-kien" ? (
          <AccessoryCatalogTable items={group.items} onEdit={onEdit} />
        ) : (
          <GenericCatalogTable items={group.items} onEdit={onEdit} />
        )}
      </div>
    </section>
  );
}

const sourceNumberFormat = new Intl.NumberFormat("en-US");

function EditButton({ item, onEdit }: { item: EquipmentCatalogItem; onEdit: (item: EquipmentCatalogItem) => void }) {
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className="h-7 w-7 text-brand hover:bg-brand/10 hover:text-brand"
      onClick={() => onEdit(item)}
      aria-label={`Sửa ${item.name}`}
      title={`Sửa ${item.name}`}
    >
      <Pencil className="size-3.5" />
    </Button>
  );
}

function PanelCatalogTable({
  items,
  onEdit,
}: {
  items: EquipmentCatalogItem[];
  onEdit: (item: EquipmentCatalogItem) => void;
}) {
  return (
    <table className="w-full min-w-[1180px] table-fixed border-collapse text-[11px]">
      <colgroup>
        <col className="w-[4%]" />
        <col className="w-[11%]" />
        <col className="w-[9%]" />
        <col className="w-[28%]" />
        <col className="w-[7%]" />
        <col className="w-[11%]" />
        <col className="w-[7%]" />
        <col className="w-[7%]" />
        <col className="w-[9%]" />
        <col className="w-[7%]" />
      </colgroup>
      <thead className="sticky top-0 z-10 bg-amber-100 text-[10px] font-bold uppercase text-amber-950">
        <tr>
          <th className="border-b border-r border-border px-1.5 py-2 text-center">STT</th>
          <th className="border-b border-r border-border px-2 py-2 text-center">Mã hàng</th>
          <th className="border-b border-r border-border px-2 py-2 text-center">Công suất (W)</th>
          <th className="border-b border-r border-border px-2 py-2 text-left">Tên hàng, diễn giải sản phẩm</th>
          <th className="border-b border-r border-border px-2 py-2 text-center">ĐVT</th>
          <th className="border-b border-r border-border px-2 py-2 text-right">Giá gốc</th>
          <th className="border-b border-r border-border px-2 py-2 text-center">Dài</th>
          <th className="border-b border-r border-border px-2 py-2 text-center">Rộng</th>
          <th className="border-b border-r border-border px-2 py-2 text-center">Tổng diện tích</th>
          <th className="border-b border-border px-2 py-2 text-center">Sửa</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={catalogItemId(item)} className="border-b border-border align-middle hover:bg-secondary/30">
            <td className="border-r border-border px-1.5 py-1.5 text-center font-semibold tabular-nums">{index + 1}</td>
            <td className="border-r border-border px-2 py-1.5 text-center font-semibold">{item.code}</td>
            <td className="border-r border-border px-2 py-1.5 text-center tabular-nums">
              {item.capacityKwp?.toFixed(3) ?? ""}
            </td>
            <td className="border-r border-border px-2 py-1.5 leading-tight">
              <p>{item.specification}</p>
              {item.note
                .split("\n")
                .filter(Boolean)
                .map((line) => (
                  <p key={line} className="mt-0.5 font-semibold italic">
                    - {line}
                  </p>
                ))}
            </td>
            <td className="border-r border-border px-2 py-1.5 text-center">{item.unit}</td>
            <td className="border-r border-border px-2 py-1.5 text-right font-semibold tabular-nums text-destructive">
              {item.referencePrice == null ? "" : sourceNumberFormat.format(item.referencePrice)}
            </td>
            <td className="border-r border-border px-2 py-1.5 text-center tabular-nums">{item.lengthMm ?? ""}</td>
            <td className="border-r border-border px-2 py-1.5 text-center tabular-nums">{item.widthMm ?? ""}</td>
            <td className="border-r border-border px-2 py-1.5 text-center tabular-nums">{item.areaM2 ?? ""}</td>
            <td className="px-2 py-1.5 text-center">
              <EditButton item={item} onEdit={onEdit} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function InverterCatalogTable({
  items,
  onEdit,
}: {
  items: EquipmentCatalogItem[];
  onEdit: (item: EquipmentCatalogItem) => void;
}) {
  return (
    <table className="w-full min-w-[1320px] table-fixed border-collapse text-[11px]">
      <colgroup>
        <col className="w-[4%]" />
        <col className="w-[15%]" />
        <col className="w-[7%]" />
        <col className="w-[34%]" />
        <col className="w-[6%]" />
        <col className="w-[9%]" />
        <col className="w-[8%]" />
        <col className="w-[10%]" />
        <col className="w-[7%]" />
      </colgroup>
      <thead className="sticky top-0 z-10 bg-amber-100 text-[10px] font-bold uppercase text-amber-950">
        <tr>
          <th className="border-b border-r border-border px-1.5 py-2 text-center">STT</th>
          <th className="border-b border-r border-border px-2 py-2 text-center">Mã</th>
          <th className="border-b border-r border-border px-2 py-2 text-center">Công suất</th>
          <th className="border-b border-r border-border px-2 py-2 text-left">Mã SP / Thông số kỹ thuật</th>
          <th className="border-b border-r border-border px-2 py-2 text-center">ĐVT</th>
          <th className="border-b border-r border-border px-2 py-2 text-right">Giá gốc</th>
          <th className="border-b border-r border-border px-2 py-2 text-right">Lợi nhuận</th>
          <th className="border-b border-r border-border px-2 py-2 text-right">Giá khách hàng</th>
          <th className="border-b border-border px-2 py-2 text-center">Sửa</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => {
          const showGroup = index === 0 || item.inverterGroup !== items[index - 1]?.inverterGroup;
          return (
            <Fragment key={catalogItemId(item)}>
              {showGroup ? (
                <tr className="bg-[#c0504d] text-white">
                  <td colSpan={9} className="border-b border-r border-[#8f3937] px-3 py-2 text-center text-xs font-bold">
                    {item.inverterGroup || "BẢNG GIÁ BIẾN TẦN"}
                  </td>
                </tr>
              ) : null}
              <tr className="align-middle hover:bg-secondary/30">
                <td className="border-b border-r border-border px-1.5 py-2 text-center font-semibold tabular-nums">
                  {item.catalogStt ?? ""}
                </td>
                <td className="whitespace-pre-line border-b border-r border-border px-2 py-2 text-center font-semibold">
                  {item.code}
                </td>
                <td className="border-b border-r border-border px-2 py-2 text-center font-semibold tabular-nums">
                  {item.capacityKw ?? ""}
                </td>
                <td className="whitespace-pre-line border-b border-r border-border px-2 py-2 leading-snug">
                  {item.specification}
                </td>
                <td className="border-b border-r border-border px-2 py-2 text-center">{item.unit}</td>
                <td className="border-b border-r border-border px-2 py-2 text-right font-semibold tabular-nums text-destructive">
                  {item.referencePrice == null ? "" : sourceNumberFormat.format(item.referencePrice)}
                </td>
                <td className="border-b border-r border-border px-2 py-2 text-right font-semibold tabular-nums">
                  {item.profit == null ? "" : sourceNumberFormat.format(item.profit)}
                </td>
                <td className="border-b border-r border-border px-2 py-2 text-right font-semibold tabular-nums">
                  {item.customerPrice == null ? "" : sourceNumberFormat.format(item.customerPrice)}
                </td>
                <td className="border-b border-border px-2 py-2 text-center">
                  <EditButton item={item} onEdit={onEdit} />
                </td>
              </tr>
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );
}

function BatteryCatalogTable({
  items,
  onEdit,
}: {
  items: EquipmentCatalogItem[];
  onEdit: (item: EquipmentCatalogItem) => void;
}) {
  return (
    <table className="w-full min-w-[1050px] table-fixed border-collapse text-[11px]">
      <colgroup>
        <col className="w-[18%]" />
        <col className="w-[9%]" />
        <col className="w-[42%]" />
        <col className="w-[13%]" />
        <col className="w-[7%]" />
        <col className="w-[6%]" />
        <col className="w-[5%]" />
      </colgroup>
      <thead className="sticky top-0 z-10 bg-amber-100 text-[10px] font-bold uppercase text-amber-950">
        <tr>
          <th className="border-b border-r border-border px-2 py-2 text-center">Mã hàng</th>
          <th className="border-b border-r border-border px-2 py-2 text-center">Dung lượng</th>
          <th className="border-b border-r border-border px-2 py-2 text-left">Tên pin</th>
          <th className="border-b border-r border-border px-2 py-2 text-right">Giá gốc</th>
          <th className="border-b border-r border-border px-2 py-2 text-center">Bảo hành</th>
          <th className="border-b border-r border-border px-2 py-2 text-center">Tồn kho</th>
          <th className="border-b border-border px-2 py-2 text-center">Sửa</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => {
          const showGroup = index === 0 || item.batteryGroup !== items[index - 1]?.batteryGroup;
          return (
            <Fragment key={catalogItemId(item)}>
              {showGroup ? (
                <tr className="bg-[#4f81bd] text-white">
                  <td colSpan={7} className="border-b border-r border-[#315f96] px-3 py-1.5 text-center text-xs font-bold">
                    {item.batteryGroup || "PIN LƯU TRỮ"}
                  </td>
                </tr>
              ) : null}
              <tr className={index % 2 === 0 ? "bg-white" : "bg-[#d9edf2]"}>
                <td className="border-b border-r border-border px-2 py-2 text-center font-semibold">{item.code}</td>
                <td className="border-b border-r border-border px-2 py-2 text-center font-semibold tabular-nums">
                  {item.capacityKwh ?? ""}
                </td>
                <td className="border-b border-r border-border px-2 py-2 leading-snug">
                  <p className="font-semibold text-[#3f83d1]">{item.name}</p>
                  {item.specification.split("\n").filter(Boolean).map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                  {item.note ? <p className="mt-1 italic text-muted-foreground">{item.note}</p> : null}
                </td>
                <td className="border-b border-r border-border px-2 py-2 text-right font-semibold tabular-nums text-destructive">
                  {item.referencePrice == null ? "" : sourceNumberFormat.format(item.referencePrice)}
                </td>
                <td className="border-b border-r border-border px-2 py-2 text-center font-semibold tabular-nums">
                  {item.warrantyYears ?? ""}
                </td>
                <td className="border-b border-r border-border px-2 py-2 text-center font-semibold tabular-nums">
                  {item.stockQuantity ?? ""}
                </td>
                <td className="border-b border-border px-2 py-2 text-center">
                  <EditButton item={item} onEdit={onEdit} />
                </td>
              </tr>
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );
}

function AccessoryCatalogTable({
  items,
  onEdit,
}: {
  items: EquipmentCatalogItem[];
  onEdit: (item: EquipmentCatalogItem) => void;
}) {
  return (
    <table className="w-full min-w-[900px] table-fixed border-collapse text-[11px]">
      <colgroup>
        <col className="w-[6%]" />
        <col className="w-[43%]" />
        <col className="w-[9%]" />
        <col className="w-[9%]" />
        <col className="w-[14%]" />
        <col className="w-[14%]" />
        <col className="w-[5%]" />
      </colgroup>
      <thead className="sticky top-0 z-10 bg-amber-100 text-[10px] font-bold uppercase text-amber-950">
        <tr>
          <th className="border-b border-r border-border px-2 py-2 text-center">STT</th>
          <th className="border-b border-r border-border px-2 py-2 text-left">Tên phụ kiện</th>
          <th className="border-b border-r border-border px-2 py-2 text-center">ĐVT</th>
          <th className="border-b border-r border-border px-2 py-2 text-right">Số lượng</th>
          <th className="border-b border-r border-border px-2 py-2 text-right">Đơn giá</th>
          <th className="border-b border-r border-border px-2 py-2 text-right">Thành tiền</th>
          <th className="border-b border-border px-2 py-2 text-center">Sửa</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => {
          const showGroup = index === 0 || item.accessoryGroup !== items[index - 1]?.accessoryGroup;
          const total = (item.quantity ?? 0) * (item.referencePrice ?? 0);
          return (
            <Fragment key={catalogItemId(item)}>
              {showGroup ? (
                <tr className="bg-[#ffd966] text-[#2b2100]">
                  <td colSpan={7} className="border-b border-border px-3 py-1.5 text-left text-xs font-bold uppercase">
                    {item.accessoryGroup || "PHỤ KIỆN"}
                  </td>
                </tr>
              ) : null}
              <tr className="align-middle hover:bg-secondary/30">
                <td className="border-b border-r border-border px-2 py-2 text-center font-semibold tabular-nums">
                  {item.catalogStt ?? ""}
                </td>
                <td className="border-b border-r border-border px-2 py-2 leading-snug">
                  <p className="font-medium">{item.name}</p>
                  {item.specification ? (
                    <p className="mt-0.5 whitespace-pre-line italic text-muted-foreground">({item.specification})</p>
                  ) : null}
                </td>
                <td className="border-b border-r border-border px-2 py-2 text-center">{item.unit}</td>
                <td className="border-b border-r border-border px-2 py-2 text-right font-semibold tabular-nums">
                  {sourceNumberFormat.format(item.quantity ?? 0)}
                </td>
                <td className="border-b border-r border-border px-2 py-2 text-right font-semibold tabular-nums">
                  {item.referencePrice == null ? "" : sourceNumberFormat.format(item.referencePrice)}
                </td>
                <td className="border-b border-r border-border px-2 py-2 text-right font-semibold tabular-nums">
                  {sourceNumberFormat.format(total)}
                </td>
                <td className="border-b border-border px-2 py-2 text-center">
                  <EditButton item={item} onEdit={onEdit} />
                </td>
              </tr>
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );
}

function GenericCatalogTable({
  items,
  onEdit,
}: {
  items: EquipmentCatalogItem[];
  onEdit: (item: EquipmentCatalogItem) => void;
}) {
  return (
    <table className="w-full min-w-[920px] table-fixed border-collapse text-[11px]">
      <colgroup>
        <col className="w-[6%]" />
        <col className="w-[13%]" />
        <col className="w-[22%]" />
        <col className="w-[20%]" />
        <col className="w-[8%]" />
        <col className="w-[12%]" />
        <col className="w-[12%]" />
        <col className="w-[7%]" />
      </colgroup>
      <thead className="sticky top-0 z-10 bg-amber-100 text-[10px] font-bold uppercase text-amber-950">
        <tr>
          <th className="border-b border-r border-border px-2 py-2 text-center">STT</th>
          <th className="border-b border-r border-border px-2 py-2 text-left">Mã</th>
          <th className="border-b border-r border-border px-2 py-2 text-left">Tên thiết bị / dịch vụ</th>
          <th className="border-b border-r border-border px-2 py-2 text-left">Thông số</th>
          <th className="border-b border-r border-border px-2 py-2 text-center">ĐVT</th>
          <th className="border-b border-r border-border px-2 py-2 text-right">Đơn giá tham khảo</th>
          <th className="border-b border-r border-border px-2 py-2 text-left">Bảo hành / ghi chú</th>
          <th className="border-b border-border px-2 py-2 text-center">Sửa</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={catalogItemId(item)} className="border-b border-border hover:bg-secondary/30">
            <td className="border-r border-border px-2 py-2.5 text-center font-semibold tabular-nums">{index + 1}</td>
            <td className="border-r border-border px-2 py-2.5 font-medium text-muted-foreground">{item.code}</td>
            <td className="border-r border-border px-2 py-2.5 font-semibold">{item.name}</td>
            <td className="whitespace-pre-line border-r border-border px-2 py-2.5 leading-snug text-muted-foreground">
              {item.specification}
            </td>
            <td className="border-r border-border px-2 py-2.5 text-center">{item.unit}</td>
            <td className="border-r border-border px-2 py-2.5 text-right font-semibold tabular-nums">
              {item.referencePrice == null ? "" : formatVnd(item.referencePrice)}
            </td>
            <td className="border-r border-border px-2 py-2.5 text-muted-foreground">{item.note}</td>
            <td className="px-2 py-2.5 text-center">
              <EditButton item={item} onEdit={onEdit} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
