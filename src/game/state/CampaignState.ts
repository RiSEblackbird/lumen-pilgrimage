const FINAL_ZONE_ID = 'Choir of the Broken Sun';

export interface CampaignSnapshot {
  readonly unlockedBiomes: readonly string[];
  readonly currentObjective: string;
  readonly finalZoneUnlocked: boolean;
}

export class CampaignState {
  private unlockedBiomes: string[];

  constructor(unlockedBiomes: readonly string[]) {
    this.unlockedBiomes = [...new Set(unlockedBiomes)];
    if (this.unlockedBiomes.length === 0) {
      this.unlockedBiomes = ['Ember Ossuary'];
    }
  }

  getSnapshot(): CampaignSnapshot {
    const finalZoneUnlocked = this.unlockedBiomes.includes(FINAL_ZONE_ID);
    const nextBiome = this.nextLockedBiomeLabel();
    const currentObjective = finalZoneUnlocked
      ? 'Final Zone を攻略し Broken Sun Choir を討伐せよ'
      : `次の攻略対象: ${nextBiome}`;

    return {
      unlockedBiomes: [...this.unlockedBiomes],
      currentObjective,
      finalZoneUnlocked
    };
  }

  unlockBiome(biomeId: string): void {
    if (!this.unlockedBiomes.includes(biomeId)) {
      this.unlockedBiomes.push(biomeId);
    }
  }

  replaceUnlockedBiomes(next: readonly string[]): void {
    this.unlockedBiomes = [...new Set(next)];
    if (this.unlockedBiomes.length === 0) {
      this.unlockedBiomes = ['Ember Ossuary'];
    }
  }

  private nextLockedBiomeLabel(): string {
    const campaignOrder = [
      'Ember Ossuary',
      'Moon Reservoir',
      'Birch Astrarium',
      'Obsidian Artery',
      'Dawn Foundry',
      FINAL_ZONE_ID
    ];

    return campaignOrder.find((biome) => !this.unlockedBiomes.includes(biome)) ?? FINAL_ZONE_ID;
  }
}
