import {
  FINAL_BIOME_ID,
  campaignBiomeLabel,
  nextCampaignBiomeId,
  normalizeCampaignBiomeId,
  normalizeUnlockedBiomes
} from './CampaignBiomes';

export interface CampaignSnapshot {
  readonly unlockedBiomes: readonly string[];
  readonly currentObjective: string;
  readonly finalZoneUnlocked: boolean;
}

export class CampaignState {
  private unlockedBiomes: string[];

  constructor(unlockedBiomes: readonly string[]) {
    this.unlockedBiomes = normalizeUnlockedBiomes(unlockedBiomes);
  }

  getSnapshot(): CampaignSnapshot {
    const finalZoneUnlocked = this.unlockedBiomes.includes(FINAL_BIOME_ID);
    const nextBiomeId = nextCampaignBiomeId(this.unlockedBiomes);
    const currentObjective = finalZoneUnlocked
      ? 'Final Zone を攻略し Broken Sun Choir を討伐せよ'
      : `次の攻略対象: ${campaignBiomeLabel(nextBiomeId)}`;

    return {
      unlockedBiomes: [...this.unlockedBiomes],
      currentObjective,
      finalZoneUnlocked
    };
  }

  unlockBiome(biomeId: string): void {
    const normalized = normalizeCampaignBiomeId(biomeId);
    if (!this.unlockedBiomes.includes(normalized)) {
      this.unlockedBiomes.push(normalized);
    }
  }

  replaceUnlockedBiomes(next: readonly string[]): void {
    this.unlockedBiomes = normalizeUnlockedBiomes(next);
  }
}
