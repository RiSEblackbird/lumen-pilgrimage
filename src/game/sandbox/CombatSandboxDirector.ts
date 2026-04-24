import type { ActionState } from '../../engine/input/ActionMap';
import { EnemyCoordinator } from '../director/EnemyCoordinator';
import { MISSION_TYPE_DEFS } from '../encounters/MissionTypes';
import { OFFHAND_DEFS } from '../items/OffhandDefs';
import { WEAPON_DEFS } from '../items/WeaponDefs';

interface SandboxEnemy {
  readonly id: string;
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
  readonly enemiesRemaining: number;
  readonly telegraphLabel: string;
  readonly staggeredEnemies: number;
  readonly missionName: string;
  readonly pressureLabel: string;
}

const MAX_HEALTH = 100;
const MAX_GUARD = 100;
const MAX_FOCUS = 100;
const MAX_OVERBURN = 100;

export class CombatSandboxDirector {
  private readonly enemies: SandboxEnemy[] = [
    this.createEnemy('ash-mote', 'Ash Mote', 30, 8, 2.4, { meleeWeight: 0.8, rangedWeight: 0 }),
    this.createEnemy('candle-penitent', 'Candle Penitent', 42, 10, 3.2, { meleeWeight: 0.9, rangedWeight: 0.2 }),
    this.createEnemy('furnace-thurifer', 'Furnace Thurifer', 60, 14, 4.6, { meleeWeight: 0.4, rangedWeight: 0.8 })
  ];

  private readonly coordinator = new EnemyCoordinator();
  private health = MAX_HEALTH;
  private guard = MAX_GUARD;
  private focus = MAX_FOCUS;
  private overburn = 0;
  private weaponIndex = 0;
  private offhandIndex = 0;
  private missionIndex = 0;
  private objective = MISSION_TYPE_DEFS[0].targetObjective;
  private pressureLabel = 'No active pressure budget';
  private previousActions: ActionState;

  constructor() {
    this.previousActions = {
      moveForward: false,
      moveBackward: false,
      moveLeft: false,
      moveRight: false,
      dash: false,
      primaryAttack: false,
      guard: false,
      parry: false,
      offhand: false,
      interact: false,
      openMenu: false
    };
  }

  update(actions: ActionState, deltaSeconds: number): CombatSandboxSnapshot {
    this.resolveResources(deltaSeconds);
    this.resolvePlayerActions(actions);
    this.resolveEnemyPressure(deltaSeconds, actions);
    this.previousActions = actions;

    return {
      health: this.health,
      guard: this.guard,
      focus: this.focus,
      overburn: this.overburn,
      objective: this.objective,
      weaponName: WEAPON_DEFS[this.weaponIndex].displayName,
      offhandName: OFFHAND_DEFS[this.offhandIndex].displayName,
      enemiesRemaining: this.enemies.length,
      telegraphLabel: this.getTelegraphLabel(),
      staggeredEnemies: this.enemies.filter((enemy) => enemy.staggerTimer > 0).length,
      missionName: MISSION_TYPE_DEFS[this.missionIndex].displayName,
      pressureLabel: this.pressureLabel
    };
  }

  private resolveResources(deltaSeconds: number): void {
    this.focus = Math.min(MAX_FOCUS, this.focus + deltaSeconds * 4);
    this.guard = Math.min(MAX_GUARD, this.guard + deltaSeconds * 3);
    this.overburn = Math.max(0, this.overburn - deltaSeconds * 6);
  }

  private resolvePlayerActions(actions: ActionState): void {
    if (this.isRisingEdge(actions.primaryAttack, this.previousActions.primaryAttack)) {
      this.primaryAttack();
    }

    if (this.isRisingEdge(actions.offhand, this.previousActions.offhand)) {
      this.activateOffhand();
    }

    if (this.isRisingEdge(actions.parry, this.previousActions.parry)) {
      this.tryParry();
    }

    if (this.isRisingEdge(actions.interact, this.previousActions.interact)) {
      this.rotateLoadoutAndMission();
    }

    if (this.isRisingEdge(actions.dash, this.previousActions.dash) && this.focus >= 15) {
      this.focus -= 15;
      this.overburn = Math.min(MAX_OVERBURN, this.overburn + 12);
      this.objective = 'Dash cancelled: reposition and break a weak target.';
    }
  }

  private primaryAttack(): void {
    if (this.enemies.length === 0) {
      this.spawnWave();
      return;
    }

    const weapon = WEAPON_DEFS[this.weaponIndex];
    const target = this.enemies[0];
    const overburnMultiplier = 1 + this.overburn / 150;
    target.health -= weapon.baseDamage * overburnMultiplier;
    this.overburn = Math.min(MAX_OVERBURN, this.overburn + 9);

    if (target.health <= 0) {
      this.enemies.shift();
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

    if (offhand.id === 'ward-aegis') {
      this.guard = Math.min(MAX_GUARD, this.guard + 24);
      this.objective = 'Ward Aegis raised: guard restored and projectiles reflected.';
      return;
    }

    this.overburn = Math.min(MAX_OVERBURN, this.overburn + 20);
    if (this.enemies.length > 0) {
      this.enemies[0].attackTimer = Math.max(0.5, this.enemies[0].attackTimer - 1);
    }
    this.objective = 'Grasp Tether triggered: front enemy pulled into execution range.';
  }

  private rotateLoadoutAndMission(): void {
    this.weaponIndex = (this.weaponIndex + 1) % WEAPON_DEFS.length;
    this.offhandIndex = (this.offhandIndex + 1) % OFFHAND_DEFS.length;
    this.missionIndex = (this.missionIndex + 1) % MISSION_TYPE_DEFS.length;
    this.objective = `${MISSION_TYPE_DEFS[this.missionIndex].targetObjective} / Loadout: ${WEAPON_DEFS[this.weaponIndex].displayName} + ${OFFHAND_DEFS[this.offhandIndex].displayName}.`;
  }

  private resolveEnemyPressure(deltaSeconds: number, actions: ActionState): void {
    const coordinatorResult = this.coordinator.evaluate(
      this.enemies.map((enemy) => ({
        id: enemy.id,
        label: enemy.label,
        meleeWeight: enemy.meleeWeight,
        rangedWeight: enemy.rangedWeight,
        isStaggered: enemy.staggerTimer > 0,
        isTelegraphActive: enemy.attackTimer > 0 && enemy.attackTimer <= enemy.telegraphLead,
        canAttackSoon: enemy.attackTimer <= enemy.telegraphLead
      }))
    );

    this.pressureLabel = `Melee ${coordinatorResult.meleeLoad.toFixed(1)}/${2.0} | Ranged ${coordinatorResult.rangedLoad.toFixed(1)}/${1.25}`;

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

      const canAttackNow = coordinatorResult.allowedEnemyIds.has(enemy.id);
      if (!canAttackNow) {
        enemy.attackTimer = Math.min(enemy.attackInterval * 0.4, enemy.telegraphLead);
        continue;
      }

      if (actions.guard) {
        this.guard = Math.max(0, this.guard - enemy.damage * 0.65);
        this.overburn = Math.min(MAX_OVERBURN, this.overburn + 5);
      } else {
        this.health = Math.max(0, this.health - enemy.damage);
      }
      enemy.attackTimer = enemy.attackInterval;
    }

    if (this.health <= 0) {
      this.health = MAX_HEALTH;
      this.guard = MAX_GUARD;
      this.focus = MAX_FOCUS;
      this.overburn = 0;
      this.spawnWave();
      this.objective = 'Pilgrim down. Simulation reset and wave restarted.';
      return;
    }

    if (this.enemies.length === 0) {
      this.spawnWave();
      this.objective = 'Wave cleared. New enemy cluster entering the arena.';
    }
  }

  private createEnemy(
    id: string,
    label: string,
    health: number,
    damage: number,
    attackInterval: number,
    profile: { readonly meleeWeight: number; readonly rangedWeight: number },
    telegraphLead = 0.55
  ): SandboxEnemy {
    return {
      id,
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
    this.enemies.push(
      this.createEnemy('ash-mote', 'Ash Mote', 30, 8, 2.2, { meleeWeight: 0.8, rangedWeight: 0 }, 0.45),
      this.createEnemy('candle-penitent', 'Candle Penitent', 42, 10, 3, { meleeWeight: 0.9, rangedWeight: 0.2 }, 0.55),
      this.createEnemy('furnace-thurifer', 'Furnace Thurifer', 60, 14, 4.4, { meleeWeight: 0.4, rangedWeight: 0.8 }, 0.75)
    );
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
    this.focus = Math.min(MAX_FOCUS, this.focus + 14);
    this.overburn = Math.min(MAX_OVERBURN, this.overburn + 16);
    this.objective = `Perfect parry on ${telegraphedEnemy.label}. Enemy staggered and exposed.`;
  }

  private getTelegraphLabel(): string {
    const telegraphedEnemy = this.enemies.find((enemy) => enemy.attackTimer > 0 && enemy.attackTimer <= enemy.telegraphLead);
    if (!telegraphedEnemy) {
      return 'No immediate telegraph';
    }

    return `${telegraphedEnemy.label} attack incoming`;
  }

  private isRisingEdge(current: boolean, previous: boolean): boolean {
    return current && !previous;
  }
}
