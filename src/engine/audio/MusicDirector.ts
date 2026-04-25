interface BiomeMusicProfile {
  readonly explorationMotif: string;
  readonly combatMotif: string;
  readonly bossMotif: string;
}

export interface MusicStemLevels {
  readonly exploration: number;
  readonly threat: number;
  readonly combat: number;
  readonly clutch: number;
  readonly boss: number;
}

export interface MusicMixSnapshot {
  readonly biomeId: string;
  readonly motif: string;
  readonly stems: MusicStemLevels;
  readonly mixLabel: string;
}

interface StemMix {
  readonly exploration: number;
  readonly threat: number;
  readonly combat: number;
  readonly clutch: number;
  readonly boss: number;
}

const DEFAULT_PROFILE: BiomeMusicProfile = {
  explorationMotif: 'broken sun drones',
  combatMotif: 'cathedral strike pulses',
  bossMotif: 'cantor verdict choir'
};

const BIOME_MUSIC_PROFILES: Record<string, BiomeMusicProfile> = {
  'ember-ossuary': {
    explorationMotif: 'ember choir hush',
    combatMotif: 'furnace drum assault',
    bossMotif: 'cinder bell litany'
  },
  'moon-reservoir': {
    explorationMotif: 'moon-water glass bed',
    combatMotif: 'undertow bass swell',
    bossMotif: 'thirteen-eyed refraction choir'
  },
  'birch-astrarium': {
    explorationMotif: 'pollen string lattice',
    combatMotif: 'rootbeat percussion',
    bossMotif: 'oracle bark canticle'
  },
  'obsidian-artery': {
    explorationMotif: 'blackglass resonance',
    combatMotif: 'split-brass pressure motif',
    bossMotif: 'reflection fracture chorus'
  },
  'dawn-foundry': {
    explorationMotif: 'forge hymn ambience',
    combatMotif: 'rail overcharge march',
    bossMotif: 'daybreak engine requiem'
  },
  'broken-sun-choir': {
    explorationMotif: 'ruined cathedral air',
    combatMotif: 'choir collapse pulse',
    bossMotif: 'last cantor apotheosis'
  }
};

export class MusicDirector {
  private biomeId = 'default';
  private profile: BiomeMusicProfile = DEFAULT_PROFILE;
  private mix: StemMix = {
    exploration: 1,
    threat: 0,
    combat: 0,
    clutch: 0,
    boss: 0
  };

  configureBiome(biomeId: string): void {
    this.biomeId = biomeId;
    this.profile = BIOME_MUSIC_PROFILES[biomeId] ?? DEFAULT_PROFILE;
  }

  evaluateMix(input: {
    readonly enemiesRemaining: number;
    readonly overburn: number;
    readonly health: number;
    readonly bossActive: boolean;
    readonly bossPhaseTitle: string | null;
  }): void {
    const enemyPressure = Math.min(1, input.enemiesRemaining / 6);
    const overburnPressure = Math.min(1, input.overburn / 100);
    const clutch = input.health <= 35 ? Math.min(1, (35 - input.health) / 20 + enemyPressure * 0.35) : 0;
    const bossSend = input.bossActive ? 1 : 0;

    const exploration = input.bossActive ? 0.05 : Math.max(0.08, 1 - enemyPressure * 0.85 - overburnPressure * 0.3);
    const threat = input.bossActive ? 0.45 : Math.min(1, enemyPressure * 0.55 + overburnPressure * 0.35);
    const combat = input.bossActive ? 0.55 : Math.min(1, enemyPressure * 0.75 + overburnPressure * 0.45);

    this.mix = {
      exploration,
      threat,
      combat,
      clutch,
      boss: bossSend
    };

    if (input.bossActive && input.bossPhaseTitle) {
      this.profile = {
        ...this.profile,
        combatMotif: `${this.profile.combatMotif} · ${input.bossPhaseTitle}`
      };
    } else {
      this.profile = BIOME_MUSIC_PROFILES[this.biomeId] ?? DEFAULT_PROFILE;
    }
  }

  snapshot(): MusicMixSnapshot {
    const motif = this.mix.boss > 0.5
      ? this.profile.bossMotif
      : this.mix.combat > this.mix.exploration
        ? this.profile.combatMotif
        : this.profile.explorationMotif;
    return {
      biomeId: this.biomeId,
      motif,
      stems: { ...this.mix },
      mixLabel: `Music Mix E${this.toPercent(this.mix.exploration)} T${this.toPercent(this.mix.threat)} C${this.toPercent(this.mix.combat)} K${this.toPercent(this.mix.clutch)} B${this.toPercent(this.mix.boss)} · ${motif}`
    };
  }

  private toPercent(value: number): number {
    return Math.round(Math.min(1, Math.max(0, value)) * 100);
  }
}
