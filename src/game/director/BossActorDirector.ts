import { resolveBossForm, type BossContract, type BossPhaseRule } from '../encounters/BossContracts';

export type BossAttackType =
  | 'strike'
  | 'sweep'
  | 'thrust'
  | 'beam'
  | 'burst'
  | 'ground-hazard'
  | 'summon'
  | 'lock-on-projectile';

export interface BossAttackPattern {
  readonly id: string;
  readonly label: string;
  readonly type: BossAttackType;
  readonly baseDamage: number;
  readonly baseGuardDamage: number;
  readonly baseInterval: number;
  readonly baseTelegraphLead: number;
}

interface BossProfile {
  readonly biomeId: string;
  readonly maxHealth: number;
  readonly attacks: readonly BossAttackPattern[];
}

export interface BossActorSnapshot {
  readonly active: boolean;
  readonly bossName: string;
  readonly currentHealth: number;
  readonly maxHealth: number;
  readonly phaseIndex: number;
  readonly phasesTotal: number;
  readonly attackLabel: string;
  readonly telegraphLabel: string;
}

export interface BossAttackResolution {
  readonly dealtHealthDamage: number;
  readonly dealtGuardDamage: number;
  readonly objectiveCallout: string | null;
}

const DEFAULT_PROFILE: BossProfile = {
  biomeId: 'default',
  maxHealth: 600,
  attacks: [
    {
      id: 'cantor-strike',
      label: 'Cantor Strike',
      type: 'strike',
      baseDamage: 12,
      baseGuardDamage: 8,
      baseInterval: 3.4,
      baseTelegraphLead: 0.9
    },
    {
      id: 'cantor-burst',
      label: 'Cantor Burst',
      type: 'burst',
      baseDamage: 15,
      baseGuardDamage: 11,
      baseInterval: 5,
      baseTelegraphLead: 1
    }
  ]
};

const BOSS_PROFILES: readonly BossProfile[] = [
  {
    biomeId: 'ember-ossuary',
    maxHealth: 520,
    attacks: [
      { id: 'cinder-sweep', label: 'Cinder Sweep', type: 'sweep', baseDamage: 14, baseGuardDamage: 10, baseInterval: 3.2, baseTelegraphLead: 0.85 },
      { id: 'ash-thrust', label: 'Ash Thrust', type: 'thrust', baseDamage: 18, baseGuardDamage: 14, baseInterval: 4.6, baseTelegraphLead: 1.05 },
      { id: 'furnace-burst', label: 'Furnace Burst', type: 'burst', baseDamage: 21, baseGuardDamage: 16, baseInterval: 5.6, baseTelegraphLead: 1.2 }
    ]
  },
  {
    biomeId: 'moon-reservoir',
    maxHealth: 560,
    attacks: [
      { id: 'pool-beam', label: 'Moon Beam', type: 'beam', baseDamage: 16, baseGuardDamage: 12, baseInterval: 3.8, baseTelegraphLead: 0.95 },
      {
        id: 'refraction-volley',
        label: 'Refraction Volley',
        type: 'lock-on-projectile',
        baseDamage: 12,
        baseGuardDamage: 10,
        baseInterval: 3,
        baseTelegraphLead: 0.78
      },
      {
        id: 'undertow-burst',
        label: 'Undertow Burst',
        type: 'ground-hazard',
        baseDamage: 20,
        baseGuardDamage: 13,
        baseInterval: 5.5,
        baseTelegraphLead: 1.18
      }
    ]
  },
  {
    biomeId: 'birch-astrarium',
    maxHealth: 600,
    attacks: [
      { id: 'root-thrust', label: 'Root Thrust', type: 'thrust', baseDamage: 15, baseGuardDamage: 11, baseInterval: 3.4, baseTelegraphLead: 0.82 },
      {
        id: 'pollen-summon',
        label: 'Pollen Choir Summon',
        type: 'summon',
        baseDamage: 11,
        baseGuardDamage: 9,
        baseInterval: 4.2,
        baseTelegraphLead: 1
      },
      {
        id: 'barkflare-sweep',
        label: 'Barkflare Sweep',
        type: 'sweep',
        baseDamage: 22,
        baseGuardDamage: 17,
        baseInterval: 5.2,
        baseTelegraphLead: 1.12
      }
    ]
  },
  {
    biomeId: 'obsidian-artery',
    maxHealth: 640,
    attacks: [
      {
        id: 'mirror-slice',
        label: 'Mirror Slice',
        type: 'strike',
        baseDamage: 16,
        baseGuardDamage: 13,
        baseInterval: 2.9,
        baseTelegraphLead: 0.72
      },
      {
        id: 'split-beam',
        label: 'Split Reflection Beam',
        type: 'beam',
        baseDamage: 19,
        baseGuardDamage: 15,
        baseInterval: 4.4,
        baseTelegraphLead: 0.95
      },
      {
        id: 'shard-burst',
        label: 'Blackglass Burst',
        type: 'burst',
        baseDamage: 24,
        baseGuardDamage: 18,
        baseInterval: 5.8,
        baseTelegraphLead: 1.2
      }
    ]
  },
  {
    biomeId: 'dawn-foundry',
    maxHealth: 680,
    attacks: [
      {
        id: 'rail-thrust',
        label: 'Rail Thrust',
        type: 'thrust',
        baseDamage: 18,
        baseGuardDamage: 14,
        baseInterval: 3.1,
        baseTelegraphLead: 0.8
      },
      {
        id: 'solar-sweep',
        label: 'Solar Sweep',
        type: 'sweep',
        baseDamage: 22,
        baseGuardDamage: 18,
        baseInterval: 4.6,
        baseTelegraphLead: 1.04
      },
      {
        id: 'engine-overburst',
        label: 'Engine Overburst',
        type: 'ground-hazard',
        baseDamage: 26,
        baseGuardDamage: 20,
        baseInterval: 6,
        baseTelegraphLead: 1.25
      }
    ]
  },
  {
    biomeId: 'broken-sun-choir',
    maxHealth: 760,
    attacks: [
      {
        id: 'cantor-chord',
        label: 'Cantor Chord Strike',
        type: 'strike',
        baseDamage: 19,
        baseGuardDamage: 15,
        baseInterval: 2.9,
        baseTelegraphLead: 0.75
      },
      {
        id: 'choir-lance',
        label: 'Choir Lance',
        type: 'lock-on-projectile',
        baseDamage: 17,
        baseGuardDamage: 13,
        baseInterval: 3.6,
        baseTelegraphLead: 0.86
      },
      {
        id: 'broken-verdict',
        label: 'Broken Sun Verdict',
        type: 'beam',
        baseDamage: 29,
        baseGuardDamage: 24,
        baseInterval: 6.4,
        baseTelegraphLead: 1.3
      }
    ]
  }
] as const;

export class BossActorDirector {
  private active = false;
  private contract: BossContract | null = null;
  private phaseRule: BossPhaseRule | null = null;
  private profile: BossProfile = DEFAULT_PROFILE;
  private currentHealth = 0;
  private currentAttackIndex = 0;
  private attackTimer = 0;
  private telegraphActive = false;

  begin(contract: BossContract, phaseRule: BossPhaseRule): void {
    this.contract = contract;
    this.phaseRule = phaseRule;
    this.profile = BOSS_PROFILES.find((entry) => entry.biomeId === contract.biomeId) ?? DEFAULT_PROFILE;
    this.active = true;
    this.currentHealth = this.profile.maxHealth;
    this.currentAttackIndex = 0;
    this.armNextAttackTimer();
    this.telegraphActive = false;
  }

  stop(): void {
    this.active = false;
    this.contract = null;
    this.phaseRule = null;
    this.profile = DEFAULT_PROFILE;
    this.currentHealth = 0;
    this.currentAttackIndex = 0;
    this.attackTimer = 0;
    this.telegraphActive = false;
  }

  isActive(): boolean {
    return this.active;
  }

  setPhaseRule(rule: BossPhaseRule | null): void {
    this.phaseRule = rule;
  }

  applyPlayerDamage(baseDamage: number): boolean {
    if (!this.active) {
      return false;
    }

    this.currentHealth = Math.max(0, this.currentHealth - baseDamage);
    if (this.currentHealth > 0) {
      return false;
    }

    this.currentHealth = 0;
    this.active = false;
    return true;
  }

  update(deltaSeconds: number, guarding: boolean): BossAttackResolution {
    if (!this.active) {
      return {
        dealtHealthDamage: 0,
        dealtGuardDamage: 0,
        objectiveCallout: null
      };
    }

    const attack = this.currentAttack();
    const telegraphLead = this.getTelegraphLead(attack);
    this.attackTimer -= deltaSeconds;

    if (!this.telegraphActive && this.attackTimer <= telegraphLead) {
      this.telegraphActive = true;
    }

    if (this.attackTimer > 0) {
      return {
        dealtHealthDamage: 0,
        dealtGuardDamage: 0,
        objectiveCallout: null
      };
    }

    const damageMultiplier = this.phaseRule?.incomingDamageMultiplier ?? 1;
    const guardMultiplier = this.phaseRule?.guardDamageMultiplier ?? 1;
    const dealtHealthDamage = guarding ? 0 : attack.baseDamage * damageMultiplier;
    const dealtGuardDamage = guarding ? attack.baseGuardDamage * guardMultiplier : 0;
    const objectiveCallout = `${attack.label} (${attack.type})`;

    this.currentAttackIndex = (this.currentAttackIndex + 1) % this.profile.attacks.length;
    this.telegraphActive = false;
    this.armNextAttackTimer();

    return {
      dealtHealthDamage,
      dealtGuardDamage,
      objectiveCallout
    };
  }

  snapshot(): BossActorSnapshot {
    if (!this.active || !this.contract) {
      return {
        active: false,
        bossName: 'No Warden contact',
        currentHealth: 0,
        maxHealth: 0,
        phaseIndex: 0,
        phasesTotal: 0,
        attackLabel: 'Idle',
        telegraphLabel: 'No immediate telegraph'
      };
    }

    const attack = this.currentAttack();
    return {
      active: true,
      bossName: resolveBossForm(this.contract, this.phaseRule?.index ?? 1)?.displayName ?? this.contract.bossName,
      currentHealth: this.currentHealth,
      maxHealth: this.profile.maxHealth,
      phaseIndex: this.phaseRule?.index ?? 1,
      phasesTotal: this.contract.phases.length,
      attackLabel: `${attack.label} (${attack.type})`,
      telegraphLabel: this.telegraphActive ? `${attack.label} incoming` : 'No immediate telegraph'
    };
  }

  private armNextAttackTimer(): void {
    const attack = this.currentAttack();
    const intervalMultiplier = this.phaseRule?.attackIntervalMultiplier ?? 1;
    this.attackTimer = Math.max(0.75, attack.baseInterval * intervalMultiplier);
  }

  private getTelegraphLead(attack: BossAttackPattern): number {
    const telegraphMultiplier = this.phaseRule?.telegraphLeadMultiplier ?? 1;
    return Math.max(0.2, attack.baseTelegraphLead * telegraphMultiplier);
  }

  private currentAttack(): BossAttackPattern {
    return this.profile.attacks[this.currentAttackIndex] ?? this.profile.attacks[0] ?? DEFAULT_PROFILE.attacks[0];
  }
}
