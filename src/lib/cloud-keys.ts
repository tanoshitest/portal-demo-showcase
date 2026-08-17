export const CLOUD_STATE_KEYS = [
  "portal-equipment-catalog-v5",
  "hv_admin_documents",
  "hv_site_contacts_v1",
  "hv_solar_estimate_v1",
  "hv_admin_materials_v2",
  "hv_admin_products",
  "hv_admin_projects",
  "hv_site_orders_v1",
  "hv_solar_quotes_v3",
  "hv_solar_catalog",
  "hv_admin_solutions",
  "hv_auto_calc_v1",
  "hv_solar_v1",
] as const;

export type CloudStateKey = (typeof CLOUD_STATE_KEYS)[number];

export const ADMIN_ONLY_STATE_KEYS = new Set<CloudStateKey>([
  "portal-equipment-catalog-v5",
  "hv_admin_documents",
  "hv_admin_materials_v2",
  "hv_admin_products",
  "hv_admin_projects",
  "hv_solar_catalog",
  "hv_admin_solutions",
]);

export function isCloudStateKey(value: string): value is CloudStateKey {
  return (CLOUD_STATE_KEYS as readonly string[]).includes(value);
}
