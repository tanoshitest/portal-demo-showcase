import { persistLocalAndCloud } from "@/lib/cloud-state-client";

export const ESTIMATE_CONFIG_STORAGE_KEY = "hv_estimate_config_v1";
export const ESTIMATE_CONFIG_CHANGED_EVENT = "hv-estimate-config";

export type EstimateConfig = {
  pshSummer: number;
  pshWinter: number;
  dischargeEff: number;
};

export const DEFAULT_ESTIMATE_CONFIG: EstimateConfig = {
  pshSummer: 4.6,
  pshWinter: 2.3,
  dischargeEff: 80,
};

function clampConfig(value: Partial<EstimateConfig> | null | undefined): EstimateConfig {
  const pshSummer = Number(value?.pshSummer);
  const pshWinter = Number(value?.pshWinter);
  const dischargeEff = Number(value?.dischargeEff);
  return {
    pshSummer: Number.isFinite(pshSummer) && pshSummer > 0 ? pshSummer : DEFAULT_ESTIMATE_CONFIG.pshSummer,
    pshWinter: Number.isFinite(pshWinter) && pshWinter > 0 ? pshWinter : DEFAULT_ESTIMATE_CONFIG.pshWinter,
    dischargeEff:
      Number.isFinite(dischargeEff) && dischargeEff > 0
        ? Math.min(100, dischargeEff)
        : DEFAULT_ESTIMATE_CONFIG.dischargeEff,
  };
}

export function loadEstimateConfig(): EstimateConfig {
  if (typeof window === "undefined") return { ...DEFAULT_ESTIMATE_CONFIG };
  try {
    const raw = localStorage.getItem(ESTIMATE_CONFIG_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_ESTIMATE_CONFIG };
    return clampConfig(JSON.parse(raw) as Partial<EstimateConfig>);
  } catch {
    return { ...DEFAULT_ESTIMATE_CONFIG };
  }
}

export function saveEstimateConfig(next: EstimateConfig) {
  if (typeof window === "undefined") return;
  const config = clampConfig(next);
  persistLocalAndCloud(ESTIMATE_CONFIG_STORAGE_KEY, config);
  window.dispatchEvent(new Event(ESTIMATE_CONFIG_CHANGED_EVENT));
}
