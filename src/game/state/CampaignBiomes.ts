export interface CampaignBiomeDef {
  readonly id: string;
  readonly label: string;
}

export const CAMPAIGN_BIOME_ORDER: readonly CampaignBiomeDef[] = [
  { id: 'ember-ossuary', label: 'Ember Ossuary' },
  { id: 'moon-reservoir', label: 'Moon Reservoir' },
  { id: 'birch-astrarium', label: 'Birch Astrarium' },
  { id: 'obsidian-artery', label: 'Obsidian Artery' },
  { id: 'dawn-foundry', label: 'Dawn Foundry' },
  { id: 'broken-sun-choir', label: 'Choir of the Broken Sun' }
] as const;

const LEGACY_BIOME_LABEL_TO_ID = new Map(CAMPAIGN_BIOME_ORDER.map((biome) => [biome.label, biome.id]));
const BIOME_ID_SET = new Set(CAMPAIGN_BIOME_ORDER.map((biome) => biome.id));

export const FIRST_BIOME_ID = CAMPAIGN_BIOME_ORDER[0].id;
export const FINAL_BIOME_ID = CAMPAIGN_BIOME_ORDER[CAMPAIGN_BIOME_ORDER.length - 1].id;

export function isCampaignBiomeId(value: string): boolean {
  return BIOME_ID_SET.has(value);
}

export function normalizeCampaignBiomeId(value: string): string {
  if (isCampaignBiomeId(value)) {
    return value;
  }

  return LEGACY_BIOME_LABEL_TO_ID.get(value) ?? FIRST_BIOME_ID;
}

export function normalizeUnlockedBiomes(values: readonly string[]): string[] {
  const normalized = values.map((entry) => normalizeCampaignBiomeId(entry));
  const deduped = [...new Set(normalized)];
  return deduped.length > 0 ? deduped : [FIRST_BIOME_ID];
}

export function campaignBiomeLabel(biomeId: string): string {
  return CAMPAIGN_BIOME_ORDER.find((biome) => biome.id === biomeId)?.label ?? biomeId;
}

export function nextCampaignBiomeId(unlockedBiomes: readonly string[]): string {
  return CAMPAIGN_BIOME_ORDER.find((biome) => !unlockedBiomes.includes(biome.id))?.id ?? FINAL_BIOME_ID;
}
