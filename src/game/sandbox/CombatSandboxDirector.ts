import type { ActionState } from '../../engine/input/ActionMap';
import { MusicDirector, type MusicMixSnapshot } from '../../engine/audio/MusicDirector';
import { RunSummaryBuilder } from '../../engine/save/RunSummaryBuilder';
import { BossActorDirector } from '../director/BossActorDirector';
import { EncounterDirector } from '../director/EncounterDirector';
import { EnemyCoordinator } from '../director/EnemyCoordinator';
import { RewardDirector, type RewardChoiceState } from '../director/RewardDirector';
import { ArenaMutationDirector } from '../director/ArenaMutationDirector';
import { BossArenaAudioDirector } from '../director/BossArenaAudioDirector';
import {
  getBossContractForBiome,
  resolveBossPhase,
  type BossContract,
  type BossPhaseRule
} from '../encounters/BossContracts';
import { buildEncounterWave } from '../encounters/EncounterSpawnTables';
import type { RouteStyle } from '../encounters/EncounterRuleSet';
import { MISSION_TYPE_DEFS } from '../encounters/MissionTypes';
import { runModeModifier } from '../encounters/RunModeModifiers';
import { OFFHAND_DEFS } from '../items/OffhandDefs';
import { DEFAULT_RELIC_MODIFIERS, buildRelicStatModifiers, type RelicStatModifiers } from '../items/RelicEffects';
import { SIGIL_DEFS } from '../items/SigilDefs';
import { WEAPON_DEFS } from '../items/WeaponDefs';
import type { RunMode } from '../state/RunMode';
import { resolveDifficulty, type DifficultyId } from '../state/DifficultyState';
import { StatsTracker } from '../state/StatsTracker';
import type { ContinueSnapshot } from '../ui/MenuManager';

export interface LoadoutAvailability {
  readonly unlockedWeapons: readonly string[];
  readonly unlockedOffhands: readonly string[];
  readonly unlockedSigils: readonly string[];
}

export interface ExpeditionPlan {
  readonly runMode: RunMode;
  readonly biomeId: string;
  readonly missionId: string;
  readonly weaponId: string;
  readonly offhandId: string;
  readonly sigilId: string;
}

export interface CombatPersistenceSnapshot {
  readonly runSeed: number;
  readonly biomeId: string;
  readonly missionId: string;
  readonly sectorIndex: number;
  readonly sectorsTotal: number;
  readonly roomId: string;
  readonly roomLabel: string;
  readonly routeStyle: RouteStyle;
  readonly missionName: string;
  readonly health: number;
  readonly guard: number;
  readonly focus: number;
  readonly overburn: number;
  readonly relicIds: readonly string[];
  readonly relicModifiers: RelicStatModifiers;
}

interface SandboxEnemy {
  readonly key: string;
  readonly label: string;
  health: number;
  readonly damage: number;
  attackTimer: number;
  readonly attackInterval: number;
  readonly telegraphLead: number;
  staggerTimer: number;
  readonly meleeWeight: number;
  readonly rangedWeight: number;
}

export interface CombatSandboxSnapshot {
  readonly health: number;
  readonly guard: number;
  readonly focus: number;
  readonly overburn: number;
  readonly objective: string;
  readonly weaponName: string;
  readonly offhandName: string;
  readonly sigilName: string;
  readonly enemiesRemaining: number;
  readonly telegraphLabel: string;
  readonly staggeredEnemies: number;
  readonly missionName: string;
  readonly pressureLabel: string;
  readonly rewardLabel: string;
  readonly equippedRelics: readonly string[];
  readonly encounterLabel: string;
  readonly contractLabel: string;
  readonly bossLabel: string;
  readonly bossHealthLabel: string;
  readonly arenaMutationLabel: string;
  readonly arenaEffectsLabel: string;
  readonly loadoutPoolLabel: string;
  readonly ashSightLabel: string;
  readonly musicLabel: string;
  readonly runSummaryLabel: string;
  readonly musicMix: MusicMixSnapshot;
}

const MAX_HEALTH = 100;
const MAX_GUARD = 100;
const MAX_FOCUS = 100;
const MAX_OVERBURN = 100;
const ASH_SIGHT_FOCUS_COST = 20;
const ASH_SIGHT_COOLDOWN_SECONDS = 12;
const ASH_SIGHT_REVEAL_SECONDS = 4;

export class CombatSandboxDirector {
  private readonly enemies: SandboxEnemy[] = [];
  private readonly coordinator = new EnemyCoordinator();
  private readonly rewards = new RewardDirector();
  private readonly encounter = new EncounterDirector();
  private readonly bossActor = new BossActorDirector();
  private readonly arenaMutation = new ArenaMutationDirector();
  private readonly arenaAudio = new BossArenaAudioDirector();
  private readonly musicDirector = new MusicDirector();
  private readonly statsTracker = new StatsTracker();
  private readonly runSummaryBuilder = new RunSummaryBuilder();
  private latestEncounter = this.encounter.snapshot();

  private enemySerial = 0;
  private health = MAX_HEALTH;
  private guard = MAX_GUARD;
  private focus = MAX_FOCUS;
  private overburn = 0;
  private weaponIndex = 0;
  private offhandIndex = 0;
  private sigilIndex = 0;
  private availableWeaponIndices: number[] = [0];
  private availableOffhandIndices: number[] = [0];
  private availableSigilIndices: number[] = [0];
  private missionIndex = 0;
  private objective = MISSION_TYPE_DEFS[0].targetObjective;
  private pressureLabel = 'No active pressure budget';
  private rewardLabel = 'No reward pending';
  private encounterLabel = '';
  private pendingReward: RewardChoiceState | null = null;
  private parryDamageBoostTimer = 0;
  private offhandGuardBoostTimer = 0;
  private roomStartSeconds = 0;
  private elapsedSeconds = 0;
  private roomDamageTaken = 0;
  private previousActions: ActionState;
  private bossPhase = 0;
  private bossContract: BossContract | null = null;
  private bossPhaseRule: BossPhaseRule | null = null;
  private bossPhaseElapsed = 0;
  private bossLabel = 'No Warden contact';
  private bossHealthLabel = 'Boss HP: -';
  private arenaMutationLabel = 'Arena stable';
  private arenaEffectsLabel = 'Arena effects idle';
  private arenaAudioLabel = 'Audio reactive bus idle';
  private musicSnapshot: MusicMixSnapshot = {
    biomeId: 'default',
    motif: 'broken sun drones',
    stems: { exploration: 1, threat: 0, combat: 0, clutch: 0, boss: 0 },
    mixLabel: 'Music Mix E100 T0 C0 K0 B0 · broken sun drones'
  };
  private musicLabel = 'Music Mix E100 T0 C0 K0 B0 · broken sun drones';
  private runSummaryLabel = 'Run 0:00 · K 0 · DMG 0/0 · Parry 0 · Dash 0 · AshSight 0 · Relic 0 · Intensity LOW';
  private hazardTickAccumulator = 0;
  private loadoutPoolLabel = 'Loadout Pool W 1/4 | O 1/4 | S 1/12';
  private ashSightCooldown = 0;
  private ashSightRevealTimer = 0;
  private difficultyId: DifficultyId = 'trial';
  private expeditionPlan: ExpeditionPlan = {
    runMode: 'campaign',
    biomeId: 'ember-ossuary',
    missionId: MISSION_TYPE_DEFS[0].id,
    weaponId: WEAPON_DEFS[0].id,
    offhandId: OFFHAND_DEFS[0].id,
    sigilId: SIGIL_DEFS[0].id
  };

  constructor(snapshot: ContinueSnapshot | null = null) {
    this.previousActions = {
      moveForward: false,
      moveBackward: false,
      moveLeft: false,
      moveRight: false,
      dash: false,
      ashSight: false,
      primaryAttack: false,
      guard: false,
      parry: false,
      offhand: false,
      interact: false,
      openMenu: false
    };

    this.resetForRun(snapshot);
  }

  configureLoadoutAvailability(availability: LoadoutAvailability): void {
    this.availableWeaponIndices = this.resolveAvailableIndices(WEAPON_DEFS, availability.unlockedWeapons, 0);
    this.availableOffhandIndices = this.resolveAvailableIndices(OFFHAND_DEFS, availability.unlockedOffhands, 0);
    this.availableSigilIndices = this.resolveAvailableIndices(SIGIL_DEFS, availability.unlockedSigils, 0);
    this.weaponIndex = this.coerceIndex(this.weaponIndex, this.availableWeaponIndices);
    this.offhandIndex = this.coerceIndex(this.offhandIndex, this.availableOffhandIndices);
    this.sigilIndex = this.coerceIndex(this.sigilIndex, this.availableSigilIndices);
    this.refreshLoadoutPoolLabel();
    this.syncPlanFromRuntimeSelection();
  }

  configureExpeditionPlan(plan: ExpeditionPlan): void {
    this.weaponIndex = this.resolveSelectedIndex(WEAPON_DEFS, this.availableWeaponIndices, plan.weaponId);
    this.offhandIndex = this.resolveSelectedIndex(OFFHAND_DEFS, this.availableOffhandIndices, plan.offhandId);
    this.sigilIndex = this.resolveSelectedIndex(SIGIL_DEFS, this.availableSigilIndices, plan.sigilId);
    const missionIndex = this.resolveMissionIndex(plan.missionId, '');
    this.missionIndex = missionIndex >= 0 ? missionIndex : 0;
    this.encounter.setMissionRouteBias(MISSION_TYPE_DEFS[this.missionIndex].routeBias);
    this.expeditionPlan = {
      runMode: plan.runMode,
      biomeId: plan.biomeId,
      missionId: MISSION_TYPE_DEFS[this.missionIndex].id,
      weaponId: WEAPON_DEFS[this.weaponIndex].id,
      offhandId: OFFHAND_DEFS[this.offhandIndex].id,
      sigilId: SIGIL_DEFS[this.sigilIndex].id
    };
  }


  setDifficulty(difficultyId: DifficultyId): void {
    this.difficultyId = difficultyId;
  }

  getExpeditionPlan(): ExpeditionPlan {
    return this.expeditionPlan;
  }

  getMusicMixSnapshot(): MusicMixSnapshot {
    return this.musicSnapshot;
  }

  resetForRun(snapshot: ContinueSnapshot | null): void {
    this.enemies.splice(0, this.enemies.length);
    this.statsTracker.reset();
    this.enemySerial = 0;
    this.health = MAX_HEALTH;
    this.guard = MAX_GUARD;
    this.focus = MAX_FOCUS;
    this.overburn = 0;
    this.weaponIndex = this.resolveSelectedIndex(WEAPON_DEFS, this.availableWeaponIndices, this.expeditionPlan.weaponId);
    this.offhandIndex = this.resolveSelectedIndex(OFFHAND_DEFS, this.availableOffhandIndices, this.expeditionPlan.offhandId);
    this.sigilIndex = this.resolveSelectedIndex(SIGIL_DEFS, this.availableSigilIndices, this.expeditionPlan.sigilId);
    this.missionIndex = this.resolveMissionIndex(this.expeditionPlan.missionId, '');
    this.objective = MISSION_TYPE_DEFS[this.missionIndex].targetObjective;
    this.pressureLabel = 'No active pressure budget';
    this.rewardLabel = 'No reward pending';
    this.pendingReward = null;
    this.parryDamageBoostTimer = 0;
    this.offhandGuardBoostTimer = 0;
    this.roomStartSeconds = 0;
    this.elapsedSeconds = 0;
    this.roomDamageTaken = 0;
    this.bossPhase = 0;
    this.bossContract = null;
    this.bossPhaseRule = null;
    this.bossPhaseElapsed = 0;
    this.bossLabel = 'No Warden contact';
    this.bossHealthLabel = 'Boss HP: -';
    this.arenaMutationLabel = 'Arena stable';
    this.arenaEffectsLabel = 'Arena effects idle';
    this.arenaAudioLabel = 'Audio reactive bus idle';
    this.musicSnapshot = {
      biomeId: this.expeditionPlan.biomeId,
      motif: 'broken sun drones',
      stems: { exploration: 1, threat: 0, combat: 0, clutch: 0, boss: 0 },
      mixLabel: 'Music Mix E100 T0 C0 K0 B0 · broken sun drones'
    };
    this.musicLabel = this.musicSnapshot.mixLabel;
    this.runSummaryLabel = this.runSummaryBuilder.build(this.statsTracker.snapshot()).summaryLabel;
    this.bossActor.stop();
    this.arenaMutation.stop();
    this.arenaAudio.stop();
    this.hazardTickAccumulator = 0;
    this.ashSightCooldown = 0;
    this.ashSightRevealTimer = 0;
    this.rewards.setEquippedRelics([]);
    this.previousActions = {
      moveForward: false,
      moveBackward: false,
      moveLeft: false,
      moveRight: false,
      dash: false,
      ashSight: false,
      primaryAttack: false,
      guard: false,
      parry: false,
      offhand: false,
      interact: false,
      openMenu: false
    };

    this.initializeFromSnapshot(snapshot);
    this.applyModeObjectiveBias();
    this.updateMusicMix();
    this.encounterLabel = this.latestEncounter.progressLabel;
    this.spawnWave();
  }

  update(actions: ActionState, deltaSeconds: number): CombatSandboxSnapshot {
    this.elapsedSeconds += deltaSeconds;
    this.statsTracker.tick(deltaSeconds);
    this.resolveResources(deltaSeconds);
    this.resolveRewardInput(actions);
    this.resolvePlayerActions(actions);
    this.updateBossState(deltaSeconds);
    this.updateArenaMutationPulse(deltaSeconds);
    this.applyArenaMutationHazards(deltaSeconds);
    this.resolveEnemyPressure(deltaSeconds, actions);
    this.updateMusicMix();
    this.previousActions = actions;

    return {
      health: this.health,
      guard: this.guard,
      focus: this.focus,
      overburn: this.overburn,
      objective: this.objective,
      weaponName: WEAPON_DEFS[this.weaponIndex].displayName,
      offhandName: OFFHAND_DEFS[this.offhandIndex].displayName,
      sigilName: SIGIL_DEFS[this.sigilIndex].displayName,
      enemiesRemaining: this.enemies.length,
      telegraphLabel: this.getTelegraphLabel(),
      staggeredEnemies: this.enemies.filter((enemy) => enemy.staggerTimer > 0).length,
      missionName: MISSION_TYPE_DEFS[this.missionIndex].displayName,
      pressureLabel: this.pressureLabel,
      rewardLabel: this.rewardLabel,
      equippedRelics: this.rewards.getEquippedRelics(),
      encounterLabel: this.encounterLabel,
      contractLabel: this.getContractLabel(),
      bossLabel: this.bossLabel,
      bossHealthLabel: this.bossHealthLabel,
      arenaMutationLabel: `${this.arenaMutationLabel} / ${this.arenaAudioLabel}`,
      arenaEffectsLabel: this.arenaEffectsLabel,
      loadoutPoolLabel: this.loadoutPoolLabel,
      ashSightLabel: this.getAshSightLabel(),
      musicLabel: this.musicLabel,
      runSummaryLabel: this.runSummaryLabel,
      musicMix: this.musicSnapshot
    };
  }

  private updateMusicMix(): void {
    this.musicDirector.configureBiome(this.expeditionPlan.biomeId);
    this.musicDirector.evaluateMix({
      enemiesRemaining: this.enemies.length,
      overburn: this.overburn,
      health: this.health,
      bossActive: this.bossContract !== null,
      bossPhaseTitle: this.bossPhaseRule?.title ?? null
    });
    this.musicSnapshot = this.musicDirector.snapshot();
    this.musicLabel = this.musicSnapshot.mixLabel;
    this.runSummaryLabel = this.runSummaryBuilder.build(this.statsTracker.snapshot()).summaryLabel;
  }

  private initializeFromSnapshot(snapshot: ContinueSnapshot | null): void {
    if (!snapshot) {
      this.encounter.startExpedition(this.expeditionPlan.biomeId, MISSION_TYPE_DEFS[this.missionIndex].routeBias);
      this.latestEncounter = this.encounter.snapshot();
      this.syncPlanFromRuntimeSelection();
      return;
    }

    const missionIndex = this.resolveMissionIndex(snapshot.missionId, snapshot.missionName);
    this.missionIndex = missionIndex >= 0 ? missionIndex : 0;
    this.health = snapshot.health;
    this.guard = snapshot.guard;
    this.focus = snapshot.focus;
    this.overburn = snapshot.overburn;
    this.rewards.setEquippedRelics(snapshot.relicIds);
    this.encounter.setMissionRouteBias(MISSION_TYPE_DEFS[this.missionIndex].routeBias);
    this.encounter.restoreExpedition({
      biomeId: snapshot.biomeId,
      sectorIndex: snapshot.sectorIndex,
      roomId: snapshot.roomId,
      routeStyle: this.resolveRouteStyle(snapshot.routeStyle),
      runSeed: snapshot.runSeed
    });
    this.latestEncounter = this.encounter.snapshot();
    this.syncPlanFromRuntimeSelection();
    this.objective = `${snapshot.missionName} を継続。保存地点 ${snapshot.roomLabel} から再開。`;
  }

  private applyModeObjectiveBias(): void {
    const modeModifier = runModeModifier(this.expeditionPlan.runMode);
    this.objective = `${this.objective} ${modeModifier.objectiveSuffix}`.trim();
  }

  private resolveResources(deltaSeconds: number): void {
    const modifiers = buildRelicStatModifiers(this.rewards.getEquippedRelics());
    const modeModifier = runModeModifier(this.expeditionPlan.runMode);
    this.parryDamageBoostTimer = Math.max(0, this.parryDamageBoostTimer - deltaSeconds);
    this.offhandGuardBoostTimer = Math.max(0, this.offhandGuardBoostTimer - deltaSeconds);
    this.ashSightCooldown = Math.max(0, this.ashSightCooldown - deltaSeconds);
    this.ashSightRevealTimer = Math.max(0, this.ashSightRevealTimer - deltaSeconds);
    this.focus = Math.min(
      MAX_FOCUS,
      this.focus + deltaSeconds * (4 + modifiers.focusRegenPerSecondBonus) * modeModifier.focusRegenMultiplier
    );
    this.guard = Math.min(MAX_GUARD, this.guard + deltaSeconds * 3);
    this.overburn = Math.max(
      0,
      this.overburn - deltaSeconds * 6 * modifiers.overburnDecayMultiplier * modeModifier.overburnDecayMultiplier
    );
  }

  private resolveRewardInput(actions: ActionState): void {
    if (!this.pendingReward) {
      return;
    }

    if (this.isRisingEdge(actions.moveLeft, this.previousActions.moveLeft)) {
      const maxIndex = this.pendingReward.options.length - 1;
      const next = this.pendingReward.selectedIndex === 0 ? maxIndex : this.pendingReward.selectedIndex - 1;
      this.pendingReward = { ...this.pendingReward, selectedIndex: next };
    }

    if (this.isRisingEdge(actions.moveRight, this.previousActions.moveRight)) {
      const next = (this.pendingReward.selectedIndex + 1) % this.pendingReward.options.length;
      this.pendingReward = { ...this.pendingReward, selectedIndex: next };
    }

    if (this.isRisingEdge(actions.interact, this.previousActions.interact)) {
      const selected = this.rewards.claimChoice(this.pendingReward);
      this.pendingReward = null;
      this.statsTracker.recordRelicClaimed();
      this.rewardLabel = `${selected.displayName} claimed (${selected.rarity})`;
      this.objective = `${selected.displayName} を装備。次 room でシナジーを試す。`;
    }
  }

  private resolvePlayerActions(actions: ActionState): void {
    if (this.pendingReward) {
      const selected = this.pendingReward.options[this.pendingReward.selectedIndex];
      this.rewardLabel = this.pendingReward.options
        .map((option, index) => `${index === this.pendingReward!.selectedIndex ? '>' : ' '} ${option.displayName}`)
        .join(' | ');
      this.objective = `Reward選択中: A/D で選択、E で取得 (${selected.displayName})`;
      return;
    }

    if (this.isRisingEdge(actions.primaryAttack, this.previousActions.primaryAttack)) {
      this.primaryAttack();
    }

    if (this.isRisingEdge(actions.ashSight, this.previousActions.ashSight)) {
      this.activateAshSight();
    }

    if (this.isRisingEdge(actions.offhand, this.previousActions.offhand)) {
      this.activateOffhand();
    }

    if (this.isRisingEdge(actions.parry, this.previousActions.parry)) {
      this.tryParry();
      this.statsTracker.recordParry();
    }

    if (this.isRisingEdge(actions.interact, this.previousActions.interact)) {
      this.rotateLoadoutAndMission();
    }

    const dashFocusCost = this.getDashFocusCost();
    if (this.isRisingEdge(actions.dash, this.previousActions.dash) && this.focus >= dashFocusCost) {
      this.focus -= dashFocusCost;
      this.statsTracker.recordDash();
      this.overburn = Math.min(MAX_OVERBURN, this.overburn + 12);
      this.objective = 'Dash cancelled: reposition and break a weak target.';
    }
  }

  private primaryAttack(): void {
    const weapon = WEAPON_DEFS[this.weaponIndex];
    const overburnMultiplier = 1 + this.overburn / 150;
    const parryBoostMultiplier = this.parryDamageBoostTimer > 0 ? 1.2 : 1;

    if (this.bossActor.isActive()) {
      const bossDamage = weapon.baseDamage * overburnMultiplier * parryBoostMultiplier;
      this.statsTracker.recordDamageDealt(bossDamage);
      const defeated = this.bossActor.applyPlayerDamage(bossDamage);
      this.overburn = Math.min(MAX_OVERBURN, this.overburn + weapon.overburnGain);
      const bossSnapshot = this.bossActor.snapshot();
      if (defeated) {
        this.bossLabel = `${this.bossContract?.bossName ?? 'Warden'} neutralized`;
        this.bossHealthLabel = 'Boss HP: 0%';
        this.objective = 'Warden defeated. Extract route stabilized.';
      } else {
        const hpPercent = bossSnapshot.maxHealth > 0 ? (bossSnapshot.currentHealth / bossSnapshot.maxHealth) * 100 : 0;
        this.bossHealthLabel = `Boss HP: ${hpPercent.toFixed(0)}%`;
        this.objective = `Warden stagger pressure maintained (${bossSnapshot.attackLabel}).`;
      }
      return;
    }

    if (this.enemies.length === 0) {
      return;
    }

    const modifiers = buildRelicStatModifiers(this.rewards.getEquippedRelics());
    const target = this.enemies[0];
    const staggerMultiplier = target.staggerTimer > 0 ? modifiers.staggerDamageMultiplier : 1;
    const highOverburnBonus = this.overburn >= 50 && this.rewards.getEquippedRelics().includes('sunshard-buckle') ? 1.12 : 1;
    const totalMultiplier = overburnMultiplier * parryBoostMultiplier * staggerMultiplier * modifiers.primaryDamageMultiplier * highOverburnBonus;
    const dealtDamage = weapon.baseDamage * totalMultiplier;
    target.health -= dealtDamage;
    this.statsTracker.recordDamageDealt(dealtDamage);
    this.overburn = Math.min(MAX_OVERBURN, this.overburn + weapon.overburnGain);

    if (target.health <= 0) {
      this.enemies.shift();
      this.statsTracker.recordEnemyDefeated();
      this.focus = Math.min(MAX_FOCUS, this.focus + 10);
      this.objective = `Target neutralized with ${weapon.displayName}. Keep chain pressure.`;
    } else {
      this.objective = `Hit ${target.label}: ${Math.max(0, target.health).toFixed(0)} HP left.`;
    }
  }

  private activateOffhand(): void {
    const offhand = OFFHAND_DEFS[this.offhandIndex];
    if (this.focus < offhand.focusCost) {
      this.objective = `Insufficient Focus for ${offhand.displayName}.`;
      return;
    }

    this.focus -= offhand.focusCost;
    if (this.rewards.getEquippedRelics().includes('hushed-thurible')) {
      this.offhandGuardBoostTimer = 2;
    }

    if (offhand.id === 'ward-aegis') {
      this.guard = Math.min(MAX_GUARD, this.guard + 24);
      this.objective = 'Ward Aegis raised: guard restored and projectiles reflected.';
      return;
    }

    if (offhand.id === 'beacon-crucible') {
      this.health = Math.min(MAX_HEALTH, this.health + 12);
      this.objective = 'Beacon Crucible deployed: health stabilized and enemies lured.';
      return;
    }

    if (offhand.id === 'siphon-engine') {
      this.overburn = Math.min(MAX_OVERBURN, this.overburn + 18);
      this.focus = Math.min(MAX_FOCUS, this.focus + 8);
      this.objective = 'Siphon Engine converted target resources into combat momentum.';
      return;
    }

    this.overburn = Math.min(MAX_OVERBURN, this.overburn + 20);
    if (this.enemies.length > 0) {
      this.enemies[0].attackTimer = Math.max(0.5, this.enemies[0].attackTimer - 1);
    }
    this.objective = 'Grasp Tether triggered: front enemy pulled into execution range.';
  }

  private rotateLoadoutAndMission(): void {
    const modeModifier = runModeModifier(this.expeditionPlan.runMode);
    this.weaponIndex = this.rotateIndex(this.weaponIndex, this.availableWeaponIndices);
    this.offhandIndex = this.rotateIndex(this.offhandIndex, this.availableOffhandIndices);
    this.sigilIndex = this.rotateIndex(this.sigilIndex, this.availableSigilIndices);
    this.missionIndex = (this.missionIndex + modeModifier.missionStride) % MISSION_TYPE_DEFS.length;
    this.encounter.setMissionRouteBias(MISSION_TYPE_DEFS[this.missionIndex].routeBias);
    this.syncPlanFromRuntimeSelection();
    this.objective = `${MISSION_TYPE_DEFS[this.missionIndex].targetObjective} / Loadout: ${WEAPON_DEFS[this.weaponIndex].displayName} + ${OFFHAND_DEFS[this.offhandIndex].displayName} + ${SIGIL_DEFS[this.sigilIndex].displayName}.`;
  }

  private syncPlanFromRuntimeSelection(): void {
    const biomeId = this.latestEncounter?.biomeId ?? this.expeditionPlan.biomeId;
    this.expeditionPlan = {
      runMode: this.expeditionPlan.runMode,
      biomeId,
      missionId: MISSION_TYPE_DEFS[this.missionIndex].id,
      weaponId: WEAPON_DEFS[this.weaponIndex].id,
      offhandId: OFFHAND_DEFS[this.offhandIndex].id,
      sigilId: SIGIL_DEFS[this.sigilIndex].id
    };
  }

  private resolveEnemyPressure(deltaSeconds: number, actions: ActionState): void {
    const coordinatorResult = this.coordinator.evaluate(
      this.enemies.map((enemy) => ({
        key: enemy.key,
        label: enemy.label,
        meleeWeight: enemy.meleeWeight,
        rangedWeight: enemy.rangedWeight,
        isStaggered: enemy.staggerTimer > 0,
        isTelegraphActive: enemy.attackTimer > 0 && enemy.attackTimer <= enemy.telegraphLead,
        canAttackSoon: enemy.attackTimer <= enemy.telegraphLead
      }))
    );

    this.pressureLabel = `Melee ${coordinatorResult.meleeLoad.toFixed(1)}/${coordinatorResult.config.meleeTokenLimit.toFixed(1)} | Ranged ${coordinatorResult.rangedLoad.toFixed(1)}/${coordinatorResult.config.rangedPressureBudget.toFixed(2)}`;

    for (const enemy of this.enemies) {
      if (enemy.staggerTimer > 0) {
        enemy.staggerTimer = Math.max(0, enemy.staggerTimer - deltaSeconds);
        if (enemy.staggerTimer > 0) {
          continue;
        }
      }

      enemy.attackTimer -= deltaSeconds;
      if (enemy.attackTimer > 0) {
        continue;
      }

      const canAttackNow = coordinatorResult.allowedEnemyKeys.has(enemy.key);
      if (!canAttackNow) {
        enemy.attackTimer = Math.min(enemy.attackInterval * 0.4, enemy.telegraphLead);
        continue;
      }

      if (actions.guard) {
        const relicModifiers = buildRelicStatModifiers(this.rewards.getEquippedRelics());
        const offhandWindowMultiplier = this.offhandGuardBoostTimer > 0 ? 0.82 : 1;
        const guardDamageMultiplier = this.bossPhaseRule?.guardDamageMultiplier ?? 1;
        const ashSightGuardMultiplier = this.ashSightRevealTimer > 0 ? 0.88 : 1;
        const guardDamage = enemy.damage
              * 0.65
              * relicModifiers.guardDamageTakenMultiplier
              * offhandWindowMultiplier
              * guardDamageMultiplier
              * ashSightGuardMultiplier;
        this.guard = Math.max(
          0,
          this.guard - guardDamage
        );
        this.statsTracker.recordGuardBlocked(guardDamage);
        this.overburn = Math.min(MAX_OVERBURN, this.overburn + 5);
      } else {
        const incomingDamageMultiplier = this.bossPhaseRule?.incomingDamageMultiplier ?? 1;
        const ashSightDamageMultiplier = this.ashSightRevealTimer > 0 ? 0.9 : 1;
        const adjustedDamage = enemy.damage * incomingDamageMultiplier * ashSightDamageMultiplier;
        this.health = Math.max(0, this.health - adjustedDamage);
        this.statsTracker.recordDamageTaken(adjustedDamage);
        this.roomDamageTaken += adjustedDamage;
      }
      enemy.attackTimer = enemy.attackInterval;
    }

    if (this.health <= 0) {
      this.resetAfterDown();
      return;
    }

    if (this.enemies.length === 0 && !this.bossActor.isActive()) {
      this.advanceEncounterRoom();
    }
  }

  private advanceEncounterRoom(): void {
    const clearSeconds = this.elapsedSeconds - this.roomStartSeconds;
    const encounter = this.encounter.onRoomCleared(clearSeconds, this.roomDamageTaken >= 24);
    this.latestEncounter = encounter;
    const modeModifier = runModeModifier(this.expeditionPlan.runMode);
    const weightedReward = encounter.rewardWeight * modeModifier.rewardWeightMultiplier;

    const relicModifiers = buildRelicStatModifiers(this.rewards.getEquippedRelics());
    this.focus = Math.min(MAX_FOCUS, this.focus + relicModifiers.roomClearFocusBonus);
    this.pendingReward = this.rewards.rollChoices(3, {
      biomeId: encounter.biomeId,
      routeStyle: encounter.routeStyle,
      rewardWeight: weightedReward,
      roomTags: encounter.roomTags
    });
    this.rewardLabel = `${encounter.biomeName} / ${encounter.progressLabel} / reward x${weightedReward.toFixed(2)}`;
    this.encounterLabel = `${encounter.progressLabel} (${encounter.roomTags.join(', ')})`;
    this.objective = 'Wave cleared. Reward altar is active.';

    this.roomStartSeconds = this.elapsedSeconds;
    this.roomDamageTaken = 0;
    this.updateBossReadout(encounter.roomTags);
    this.spawnWave();
  }

  private resetAfterDown(): void {
    this.health = MAX_HEALTH;
    this.guard = MAX_GUARD;
    this.focus = MAX_FOCUS;
    this.overburn = 0;
    this.roomStartSeconds = this.elapsedSeconds;
    this.roomDamageTaken = 0;
    this.spawnWave();
    this.objective = 'Pilgrim down. Simulation reset and wave restarted.';
  }

  private createEnemy(
    archetypeId: string,
    label: string,
    health: number,
    damage: number,
    attackInterval: number,
    profile: { readonly meleeWeight: number; readonly rangedWeight: number },
    telegraphLead = 0.55
  ): SandboxEnemy {
    return {
      key: `${archetypeId}-${this.enemySerial++}`,
      label,
      health,
      damage,
      attackTimer: attackInterval,
      attackInterval,
      telegraphLead,
      staggerTimer: 0,
      meleeWeight: profile.meleeWeight,
      rangedWeight: profile.rangedWeight
    };
  }

  private spawnWave(): void {
    this.enemies.splice(0, this.enemies.length);
    const waveTemplates = buildEncounterWave({
      biomeId: this.latestEncounter.biomeId,
      roomTags: this.latestEncounter.roomTags,
      sectorIndex: this.latestEncounter.sectorIndex
    });

    const difficulty = resolveDifficulty(this.difficultyId);
    const modeModifier = runModeModifier(this.expeditionPlan.runMode);
    const bonusWaves = Math.max(0, modeModifier.waveCountBonus);
    const waveIterations = 1 + bonusWaves;

    for (let waveIndex = 0; waveIndex < waveIterations; waveIndex += 1) {
      for (const template of waveTemplates) {
        const attackIntervalMultiplier = (this.bossPhaseRule?.attackIntervalMultiplier ?? 1)
          * difficulty.enemyAttackIntervalMultiplier
          * modeModifier.enemyAttackIntervalMultiplier;
        const telegraphLeadMultiplier = (this.bossPhaseRule?.telegraphLeadMultiplier ?? 1)
          * difficulty.enemyTelegraphMultiplier
          * modeModifier.enemyTelegraphMultiplier;
        this.enemies.push(
          this.createEnemy(
            template.archetypeId,
            template.label,
            Math.round(template.baseHealth * difficulty.enemyHealthMultiplier * modeModifier.enemyHealthMultiplier),
            Math.round(template.baseDamage * difficulty.enemyDamageMultiplier * modeModifier.enemyDamageMultiplier),
            template.attackInterval * attackIntervalMultiplier,
            {
              meleeWeight: template.meleeWeight,
              rangedWeight: template.rangedWeight
            },
            template.telegraphLead * telegraphLeadMultiplier
          )
        );
      }
    }
  }

  private updateBossReadout(roomTags: readonly string[]): void {
    if (!roomTags.includes('boss-approach')) {
      this.bossContract = null;
      this.bossPhaseRule = null;
      this.bossActor.stop();
      this.arenaMutation.stop();
      this.arenaAudio.stop();
      this.bossPhaseElapsed = 0;
      this.bossLabel = 'No Warden contact';
      this.bossHealthLabel = 'Boss HP: -';
      this.arenaMutationLabel = 'Arena stable';
      this.arenaEffectsLabel = 'Arena effects idle';
      this.arenaAudioLabel = 'Audio reactive bus idle';
      this.bossPhase = 0;
      this.hazardTickAccumulator = 0;
      return;
    }

    this.bossContract = this.resolveBossContract(this.latestEncounter.biomeId);
    this.bossPhaseElapsed = 0;
    this.bossPhaseRule = this.bossContract ? resolveBossPhase(this.bossContract, this.bossPhaseElapsed, this.overburn) : null;
    this.bossPhase = this.bossPhaseRule?.index ?? 1;
    if (!this.bossContract || !this.bossPhaseRule) {
      this.bossActor.stop();
      this.arenaMutation.stop();
      this.arenaAudio.stop();
      this.bossLabel = 'Unknown Warden signature';
      this.bossHealthLabel = 'Boss HP: unknown';
      this.arenaMutationLabel = 'Arena mutation unknown';
      this.arenaEffectsLabel = 'Arena effects uncertain';
      this.arenaAudioLabel = 'Audio reactive bus uncertain';
      this.objective = 'Warden trace detected. Continue pressure to extract phase data.';
      return;
    }
    this.bossActor.begin(this.bossContract, this.bossPhaseRule);
    this.arenaMutation.enterContract(this.bossContract, this.bossPhaseRule);
    this.arenaAudio.enterContract(this.bossContract, this.bossPhaseRule, this.overburn);
    const bossSnapshot = this.bossActor.snapshot();
    this.bossLabel = `${this.bossContract.bossName} / ${this.bossContract.contractLabel} / Phase ${this.bossPhase}/${this.bossContract.phases.length} (${this.bossPhaseRule.title})`;
    this.bossHealthLabel = `Boss HP: ${bossSnapshot.maxHealth > 0 ? ((bossSnapshot.currentHealth / bossSnapshot.maxHealth) * 100).toFixed(0) : '0'}%`;
    const arenaSnapshot = this.arenaMutation.snapshot();
    const effectSnapshot = this.arenaMutation.effectSnapshot();
    this.arenaMutationLabel = `${arenaSnapshot.mutationSummary} / ${arenaSnapshot.deviceLabel}`;
    this.arenaEffectsLabel = effectSnapshot.summary;
    this.arenaAudioLabel = this.arenaAudio.snapshot().mixLabel;
    this.objective = `${this.bossContract.bossName} 接触。${this.bossPhaseRule.mechanicSummary}`;
  }

  private updateBossState(deltaSeconds: number): void {
    if (!this.bossContract) {
      return;
    }

    this.bossPhaseElapsed += deltaSeconds;
    const resolvedPhase = resolveBossPhase(this.bossContract, this.bossPhaseElapsed, this.overburn);
    const phaseChanged = this.bossPhaseRule?.index !== resolvedPhase.index;
    this.bossPhaseRule = resolvedPhase;
    this.bossActor.setPhaseRule(resolvedPhase);
    this.arenaMutation.applyPhaseRule(resolvedPhase);
    this.arenaAudio.applyPhaseRule(resolvedPhase, this.overburn);
    this.bossPhase = resolvedPhase.index;
    this.bossLabel = `${this.bossContract.bossName} / ${this.bossContract.contractLabel} / Phase ${resolvedPhase.index}/${this.bossContract.phases.length} (${resolvedPhase.title})`;
    const arenaSnapshot = this.arenaMutation.snapshot();
    const effectSnapshot = this.arenaMutation.effectSnapshot();
    this.arenaMutationLabel = `${arenaSnapshot.mutationSummary} / ${arenaSnapshot.deviceLabel} / ${this.arenaAudio.snapshot().pulseCallout}`;
    this.arenaEffectsLabel = effectSnapshot.summary;
    this.arenaAudioLabel = this.arenaAudio.snapshot().mixLabel;
    if (phaseChanged) {
      this.objective = `${this.bossContract.bossName} phase shift: ${resolvedPhase.mechanicSummary}`;
      this.hazardTickAccumulator = 0;
      this.spawnWave();
    }

    const bossAttack = this.bossActor.update(deltaSeconds, this.previousActions.guard);
    if (bossAttack.dealtHealthDamage > 0) {
      this.health = Math.max(0, this.health - bossAttack.dealtHealthDamage);
      this.roomDamageTaken += bossAttack.dealtHealthDamage;
    }
    if (bossAttack.dealtGuardDamage > 0) {
      this.guard = Math.max(0, this.guard - bossAttack.dealtGuardDamage);
    }
    if (bossAttack.objectiveCallout) {
      this.objective = `${resolvedPhase.title}: ${bossAttack.objectiveCallout} を処理。`;
    }

    const bossSnapshot = this.bossActor.snapshot();
    if (bossSnapshot.active) {
      const hpPercent = bossSnapshot.maxHealth > 0 ? (bossSnapshot.currentHealth / bossSnapshot.maxHealth) * 100 : 0;
      this.bossHealthLabel = `Boss HP: ${hpPercent.toFixed(0)}%`;
    }

    if (this.health <= 0) {
      this.resetAfterDown();
    }
  }

  private updateArenaMutationPulse(deltaSeconds: number): void {
    const pulseCallout = this.arenaMutation.tick(deltaSeconds);
    if (!pulseCallout || !this.bossPhaseRule) {
      return;
    }

    const arenaSnapshot = this.arenaMutation.snapshot();
    const audioCallout = this.arenaAudio.onArenaPulse(arenaSnapshot);
    this.objective = `${this.bossPhaseRule.title}: ${pulseCallout}. ${audioCallout}. ${this.bossPhaseRule.mechanicSummary}`;
    this.arenaAudioLabel = this.arenaAudio.snapshot().mixLabel;
  }

  private applyArenaMutationHazards(deltaSeconds: number): void {
    if (!this.bossPhaseRule) {
      return;
    }

    const modeModifier = runModeModifier(this.expeditionPlan.runMode);
    const phaseHazardDamagePerSecond = this.bossPhaseRule.ambientHazardDamagePerSecond * modeModifier.hazardDamageMultiplier;
    const phaseFocusDrainPerSecond = this.bossPhaseRule.focusDrainPerSecond * modeModifier.focusDrainMultiplier;
    const effectSnapshot = this.arenaMutation.effectSnapshot();
    let hazardDamagePerSecond = phaseHazardDamagePerSecond;
    let focusDrainPerSecond = phaseFocusDrainPerSecond;
    let guardTaxPerSecond = 0;
    let overburnPerSecond = 0;
    for (const effect of effectSnapshot.effects) {
      if (effect.effectType === 'hazard-damage') {
        hazardDamagePerSecond += effect.scaledRate * 0.25;
      } else if (effect.effectType === 'focus-drain') {
        focusDrainPerSecond += effect.scaledRate * 0.2;
      } else if (effect.effectType === 'guard-tax') {
        guardTaxPerSecond += effect.scaledRate * 0.18;
      } else if (effect.effectType === 'overburn-pressure') {
        overburnPerSecond += effect.scaledRate * 0.2;
      }
    }
    if (hazardDamagePerSecond > 0) {
      const hazardDamage = hazardDamagePerSecond * deltaSeconds;
      this.health = Math.max(0, this.health - hazardDamage);
      this.roomDamageTaken += hazardDamage;
    }
    if (focusDrainPerSecond > 0) {
      this.focus = Math.max(0, this.focus - focusDrainPerSecond * deltaSeconds);
    }
    if (guardTaxPerSecond > 0) {
      this.guard = Math.max(0, this.guard - guardTaxPerSecond * deltaSeconds);
    }
    if (overburnPerSecond > 0) {
      this.overburn = Math.min(MAX_OVERBURN, this.overburn + overburnPerSecond * deltaSeconds);
    }

    if (hazardDamagePerSecond === 0 && focusDrainPerSecond === 0 && guardTaxPerSecond === 0 && overburnPerSecond === 0) {
      return;
    }

    this.hazardTickAccumulator += deltaSeconds;
    if (this.hazardTickAccumulator < 1) {
      return;
    }
    this.hazardTickAccumulator = 0;

    const pressureSummary = [
      hazardDamagePerSecond > 0 ? `hazard -${hazardDamagePerSecond.toFixed(1)} HP/s` : null,
      focusDrainPerSecond > 0 ? `focus -${focusDrainPerSecond.toFixed(1)}/s` : null,
      guardTaxPerSecond > 0 ? `guard -${guardTaxPerSecond.toFixed(1)}/s` : null,
      overburnPerSecond > 0 ? `overburn +${overburnPerSecond.toFixed(1)}/s` : null
    ]
      .filter((value): value is string => value !== null)
      .join(', ');
    const audioHazardCallout = this.arenaAudio.onHazardTick(this.bossPhaseRule);
    this.objective = `${this.bossPhaseRule.title}: ${pressureSummary}. ${audioHazardCallout}. ${this.bossPhaseRule.mechanicSummary}`;
    this.arenaAudioLabel = this.arenaAudio.snapshot().mixLabel;
  }

  private resolveBossContract(biomeId: string): BossContract | null {
    return getBossContractForBiome(biomeId);
  }

  private tryParry(): void {
    const telegraphedEnemy = this.enemies.find((enemy) => enemy.attackTimer > 0 && enemy.attackTimer <= enemy.telegraphLead);
    if (!telegraphedEnemy) {
      this.guard = Math.max(0, this.guard - 10);
      this.objective = 'Parry failed: no active telegraph. Guard destabilized.';
      return;
    }

    telegraphedEnemy.attackTimer = telegraphedEnemy.attackInterval + 0.8;
    telegraphedEnemy.staggerTimer = 1.4;
    const relicModifiers = buildRelicStatModifiers(this.rewards.getEquippedRelics());
    this.focus = Math.min(MAX_FOCUS, this.focus + 14 + relicModifiers.parryFocusBonus);
    this.overburn = Math.min(MAX_OVERBURN, this.overburn + 16);
    if (this.rewards.getEquippedRelics().includes('parry-ember-ring')) {
      this.parryDamageBoostTimer = 3;
    }
    this.objective = `Perfect parry on ${telegraphedEnemy.label}. Enemy staggered and exposed.`;
  }

  private getTelegraphLabel(): string {
    const bossSnapshot = this.bossActor.snapshot();
    if (bossSnapshot.active && bossSnapshot.telegraphLabel !== 'No immediate telegraph') {
      return this.ashSightRevealTimer > 0
        ? `Ash Sight: Boss weakpoint window -> ${bossSnapshot.telegraphLabel}`
        : `Boss: ${bossSnapshot.telegraphLabel}`;
    }

    const telegraphedEnemy = this.enemies.find((enemy) => enemy.attackTimer > 0 && enemy.attackTimer <= enemy.telegraphLead);
    if (!telegraphedEnemy) {
      return this.ashSightRevealTimer > 0
        ? 'Ash Sight active: no strike telegraph, scan hidden route markers.'
        : 'No immediate telegraph';
    }

    return this.ashSightRevealTimer > 0
      ? `${telegraphedEnemy.label} attack incoming (Ash Sight timing assist)`
      : `${telegraphedEnemy.label} attack incoming`;
  }


  getPersistenceSnapshot(): CombatPersistenceSnapshot {
    const relicIds = this.rewards.getEquippedRelics();
    const relicModifiers = relicIds.length > 0 ? buildRelicStatModifiers(relicIds) : DEFAULT_RELIC_MODIFIERS;

    return {
      runSeed: this.latestEncounter.runSeed,
      biomeId: this.latestEncounter.biomeId,
      missionId: MISSION_TYPE_DEFS[this.missionIndex].id,
      sectorIndex: this.latestEncounter.sectorIndex,
      sectorsTotal: this.latestEncounter.sectorsTotal,
      roomId: this.latestEncounter.roomId,
      roomLabel: this.latestEncounter.progressLabel,
      routeStyle: this.latestEncounter.routeStyle,
      missionName: MISSION_TYPE_DEFS[this.missionIndex].displayName,
      health: this.health,
      guard: this.guard,
      focus: this.focus,
      overburn: this.overburn,
      relicIds,
      relicModifiers
    };
  }

  private getContractLabel(): string {
    const mission = MISSION_TYPE_DEFS[this.missionIndex];
    const difficulty = resolveDifficulty(this.difficultyId).label;
    const modeModifier = runModeModifier(this.expeditionPlan.runMode);
    return `${mission.displayName} (${mission.routeBias.join(' > ')}) / Difficulty: ${difficulty} / ${modeModifier.contractLabel}`;
  }


  private getDashFocusCost(): number {
    const modifiers = buildRelicStatModifiers(this.rewards.getEquippedRelics());
    return Math.max(6, Math.round(15 * modifiers.dashFocusCostMultiplier));
  }

  private activateAshSight(): void {
    if (this.ashSightCooldown > 0) {
      this.objective = `Ash Sight cooling down (${this.ashSightCooldown.toFixed(1)}s).`;
      return;
    }

    if (this.focus < ASH_SIGHT_FOCUS_COST) {
      this.objective = 'Insufficient Focus for Ash Sight reveal.';
      return;
    }

    this.focus = Math.max(0, this.focus - ASH_SIGHT_FOCUS_COST);
    this.statsTracker.recordAshSight();
    this.ashSightCooldown = ASH_SIGHT_COOLDOWN_SECONDS;
    this.ashSightRevealTimer = ASH_SIGHT_REVEAL_SECONDS;
    this.objective = 'Ash Sight engaged: weakpoints, breakables, and hidden routing echoes revealed.';
  }

  private getAshSightLabel(): string {
    if (this.ashSightRevealTimer > 0) {
      return `Ash Sight ACTIVE ${this.ashSightRevealTimer.toFixed(1)}s | CD ${this.ashSightCooldown.toFixed(1)}s`;
    }
    return `Ash Sight READY (Cost ${ASH_SIGHT_FOCUS_COST} Focus, CD ${ASH_SIGHT_COOLDOWN_SECONDS}s)`;
  }

  private isRisingEdge(current: boolean, previous: boolean): boolean {
    return current && !previous;
  }

  private resolveMissionIndex(savedMissionId: string, savedMissionName: string): number {
    const byId = MISSION_TYPE_DEFS.findIndex((mission) => mission.id === savedMissionId);
    if (byId >= 0) {
      return byId;
    }

    const byName = MISSION_TYPE_DEFS.findIndex((mission) => mission.displayName === savedMissionName);
    if (byName >= 0) {
      return byName;
    }

    return 0;
  }

  private resolveAvailableIndices<T extends { readonly id: string }>(
    defs: readonly T[],
    unlockedIds: readonly string[],
    fallbackIndex: number
  ): number[] {
    const unlocked = defs
      .map((def, index) => ({ id: def.id, index }))
      .filter((entry) => unlockedIds.includes(entry.id))
      .map((entry) => entry.index);
    return unlocked.length > 0 ? unlocked : [fallbackIndex];
  }

  private coerceIndex(currentIndex: number, allowedIndices: readonly number[]): number {
    return allowedIndices.includes(currentIndex) ? currentIndex : allowedIndices[0];
  }

  private rotateIndex(currentIndex: number, allowedIndices: readonly number[]): number {
    const currentPosition = allowedIndices.indexOf(currentIndex);
    if (currentPosition < 0) {
      return allowedIndices[0];
    }
    return allowedIndices[(currentPosition + 1) % allowedIndices.length];
  }

  private resolveSelectedIndex<T extends { readonly id: string }>(
    defs: readonly T[],
    allowedIndices: readonly number[],
    selectedId: string
  ): number {
    const selectedIndex = defs.findIndex((def) => def.id === selectedId);
    if (selectedIndex >= 0 && allowedIndices.includes(selectedIndex)) {
      return selectedIndex;
    }
    return allowedIndices[0];
  }

  private refreshLoadoutPoolLabel(): void {
    this.loadoutPoolLabel = `Loadout Pool W ${this.availableWeaponIndices.length}/${WEAPON_DEFS.length} | O ${this.availableOffhandIndices.length}/${OFFHAND_DEFS.length} | S ${this.availableSigilIndices.length}/${SIGIL_DEFS.length}`;
  }

  private resolveRouteStyle(routeStyle: string): RouteStyle {
    if (routeStyle === 'risk' || routeStyle === 'recovery' || routeStyle === 'secret') {
      return routeStyle;
    }
    return 'standard';
  }
}
