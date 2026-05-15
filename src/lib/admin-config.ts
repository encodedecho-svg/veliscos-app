import { supabase } from "./supabase";

export interface AppConfig {
  shippingFlat: number;
  freeShippingThreshold: number;
  brandEmail: string | null;
  brandPhone: string | null;
  brandWhatsapp: string | null;
  payoutBank: string | null;
  payoutJazzcash: string | null;
  payoutEasypaisa: string | null;
}

const DEFAULTS: AppConfig = {
  shippingFlat: 200,
  freeShippingThreshold: 3000,
  brandEmail: null,
  brandPhone: null,
  brandWhatsapp: null,
  payoutBank: null,
  payoutJazzcash: null,
  payoutEasypaisa: null,
};

type Row = {
  shipping_flat: number;
  free_shipping_threshold: number;
  brand_email: string | null;
  brand_phone: string | null;
  brand_whatsapp: string | null;
  payout_bank: string | null;
  payout_jazzcash: string | null;
  payout_easypaisa: string | null;
};

function rowToConfig(r: Row): AppConfig {
  return {
    shippingFlat: r.shipping_flat,
    freeShippingThreshold: r.free_shipping_threshold,
    brandEmail: r.brand_email,
    brandPhone: r.brand_phone,
    brandWhatsapp: r.brand_whatsapp,
    payoutBank: r.payout_bank,
    payoutJazzcash: r.payout_jazzcash,
    payoutEasypaisa: r.payout_easypaisa,
  };
}

export async function getConfig(): Promise<AppConfig> {
  const { data, error } = await supabase
    .from("config")
    .select(
      "shipping_flat, free_shipping_threshold, brand_email, brand_phone, brand_whatsapp, payout_bank, payout_jazzcash, payout_easypaisa"
    )
    .eq("id", 1)
    .maybeSingle();
  if (error || !data) return DEFAULTS;
  return rowToConfig(data as Row);
}

export async function updateConfig(
  patch: Partial<AppConfig>
): Promise<{ error: string | null }> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.shippingFlat !== undefined) dbPatch.shipping_flat = patch.shippingFlat;
  if (patch.freeShippingThreshold !== undefined)
    dbPatch.free_shipping_threshold = patch.freeShippingThreshold;
  if (patch.brandEmail !== undefined) dbPatch.brand_email = patch.brandEmail || null;
  if (patch.brandPhone !== undefined) dbPatch.brand_phone = patch.brandPhone || null;
  if (patch.brandWhatsapp !== undefined)
    dbPatch.brand_whatsapp = patch.brandWhatsapp || null;
  if (patch.payoutBank !== undefined) dbPatch.payout_bank = patch.payoutBank || null;
  if (patch.payoutJazzcash !== undefined)
    dbPatch.payout_jazzcash = patch.payoutJazzcash || null;
  if (patch.payoutEasypaisa !== undefined)
    dbPatch.payout_easypaisa = patch.payoutEasypaisa || null;
  const { error } = await supabase.from("config").update(dbPatch).eq("id", 1);
  return { error: error?.message ?? null };
}
