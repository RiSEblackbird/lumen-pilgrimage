import type { GameState } from '../state/GameState';
import type { RelicStatModifiers } from '../items/RelicEffects';
import { WEAPON_DEFS } from '../items/WeaponDefs';
import { OFFHAND_DEFS } from '../items/OffhandDefs';
import { SIGIL_DEFS } from '../items/SigilDefs';
import { MISSION_TYPE_DEFS } from '../encounters/MissionTypes';
import { campaignBiomeLabel } from '../state/CampaignBiomes';
import { RUN_MODE_DEFS, type RunMode } from '../state/RunMode';

export interface ContinueSnapshot {
  readonly biomeId: string;
  readonly missionId: string;
  readonly sectorIndex: number;
  readonly sectorsTotal: number;
  readonly roomId: string;
  readonly roomLabel: string;
  readonly routeStyle: string;
  readonly missionName: string;
  readonly health: number;
  readonly guard: number;
  readonly focus: number;
  readonly overburn: number;
  readonly relicIds: readonly string[];
  readonly relicModifiers: RelicStatModifiers;
  readonly capturedAtIso: string;
}

export interface HubViewModel {
  readonly unlockedBiomes: readonly string[];
  readonly lumenAsh: number;
  readonly choirThread: number;
  readonly saintGlass: number;
  readonly echoScript: number;
  readonly unlockedWeapons: readonly string[];
  readonly unlockedOffhands: readonly string[];
  readonly unlockedSigils: readonly string[];
}

export interface ExpeditionPrepViewModel {
  readonly selectedBiomeId: string;
  readonly selectedMissionId: string;
  readonly selectedWeaponId: string;
  readonly selectedOffhandId: string;
  readonly selectedSigilId: string;
  readonly unlockedBiomes: readonly string[];
  readonly unlockedWeapons: readonly string[];
  readonly unlockedOffhands: readonly string[];
  readonly unlockedSigils: readonly string[];
}

export interface SettingsViewModel {
  readonly snapTurn: boolean;
  readonly seatedMode: boolean;
  readonly uiScale: number;
  readonly reduceFlashing: boolean;
  readonly masterVolume: number;
}

export interface SaveSlotSummary {
  readonly slotId: number;
  readonly hasSave: boolean;
  readonly stateLabel: string;
  readonly updatedAtLabel: string;
}

export type MenuCommand =
  | 'select-save-slot-0'
  | 'select-save-slot-1'
  | 'select-save-slot-2'
  | 'continue'
  | 'new-game'
  | 'open-mode-select'
  | 'select-mode-campaign'
  | 'select-mode-contracts'
  | 'select-mode-boss-rush'
  | 'select-mode-endless-collapse'
  | 'enter-hub'
  | 'open-expedition-prep'
  | 'launch-expedition'
  | 'open-meta-upgrade'
  | 'unlock-astral-pike'
  | 'craft-beacon-crucible'
  | 'open-settings'
  | 'open-credits'
  | 'toggle-snap-turn'
  | 'toggle-seated-mode'
  | 'toggle-reduce-flashing'
  | 'ui-scale-down'
  | 'ui-scale-up'
  | 'master-volume-down'
  | 'master-volume-up'
  | 'prep-cycle-biome'
  | 'prep-cycle-mission'
  | 'prep-cycle-weapon'
  | 'prep-cycle-offhand'
  | 'prep-cycle-sigil'
  | 'back-main-menu'
  | 'back-hub';

export class MenuManager {
  private readonly root: HTMLDivElement;
  private readonly commandQueue: MenuCommand[] = [];
  private state: GameState = 'Boot';
  private continueSnapshot: ContinueSnapshot | null = null;
  private settings: SettingsViewModel | null = null;
  private hub: HubViewModel | null = null;
  private prep: ExpeditionPrepViewModel | null = null;
  private selectedRunMode: RunMode = 'campaign';
  private uiScale = 1;
  private saveSlots: readonly SaveSlotSummary[] = [];
  private activeSaveSlotId = 0;

  constructor(container: HTMLElement) {
    this.root = document.createElement('div');
    this.root.style.position = 'fixed';
    this.root.style.top = '16px';
    this.root.style.left = '16px';
    this.root.style.padding = '10px 12px';
    this.root.style.border = '1px solid rgba(255,255,255,0.16)';
    this.root.style.background = 'rgba(5, 7, 14, 0.68)';
    this.root.style.color = '#f0f6ff';
    this.root.style.fontFamily = 'system-ui, sans-serif';
    this.root.style.fontSize = '13px';
    container.appendChild(this.root);
  }

  setState(state: GameState): void {
    this.state = state;
    this.render();
  }

  setContinueSnapshot(snapshot: ContinueSnapshot | null): void {
    this.continueSnapshot = snapshot;
    this.render();
  }

  setSettings(settings: SettingsViewModel): void {
    this.settings = settings;
    this.render();
  }

  setHub(hub: HubViewModel): void {
    this.hub = hub;
    this.render();
  }

  setExpeditionPrep(prep: ExpeditionPrepViewModel): void {
    this.prep = prep;
    this.render();
  }

  setSelectedRunMode(mode: RunMode): void {
    this.selectedRunMode = mode;
    this.render();
  }

  setSaveSlots(slots: readonly SaveSlotSummary[], activeSlotId: number): void {
    this.saveSlots = slots;
    this.activeSaveSlotId = activeSlotId;
    this.render();
  }

  setUiScale(scale: number): void {
    this.uiScale = scale;
    this.root.style.transformOrigin = 'top left';
    this.root.style.transform = `scale(${this.uiScale.toFixed(2)})`;
  }

  consumeCommand(): MenuCommand | null {
    return this.commandQueue.shift() ?? null;
  }

  private render(): void {
    const snapshot = this.continueSnapshot;
    if (this.state === 'MainMenu') {
      this.root.innerHTML = '';
      this.root.append(this.createMainMenu(snapshot));
      return;
    }

    if (this.state === 'Hub') {
      this.root.innerHTML = '';
      this.root.append(this.createHubPanel(snapshot));
      return;
    }

    if (this.state === 'MetaUpgrade') {
      this.root.innerHTML = '';
      this.root.append(this.createMetaUpgradePanel());
      return;
    }
    if (this.state === 'ExpeditionPrep') {
      this.root.innerHTML = '';
      this.root.append(this.createExpeditionPrepPanel());
      return;
    }

    if (this.state === 'Settings') {
      this.root.innerHTML = '';
      this.root.append(this.createSettingsPanel());
      return;
    }

    if (this.state === 'Credits') {
      this.root.innerHTML = '';
      this.root.append(this.createCreditsPanel());
      return;
    }

    if (this.state === 'BossRush' || this.state === 'EndlessCollapse') {
      this.root.innerHTML = '';
      this.root.append(this.createModeSelectPanel());
      return;
    }

    if (!snapshot) {
      this.root.innerHTML = [`State: ${this.state}`, 'Continue: no expedition snapshot'].join('<br/>');
      return;
    }

    const capturedAt = new Date(snapshot.capturedAtIso);
    const capturedLabel = Number.isNaN(capturedAt.getTime()) ? snapshot.capturedAtIso : capturedAt.toLocaleString();
    const relicSummary = snapshot.relicIds.length === 0 ? 'none' : snapshot.relicIds.join(', ');

    this.root.innerHTML = [
      `State: ${this.state}`,
      `Continue: ${campaignBiomeLabel(snapshot.biomeId)} / Sector ${snapshot.sectorIndex}/${snapshot.sectorsTotal}`,
      `Room: ${snapshot.roomLabel} / Route ${snapshot.routeStyle}`,
      `RoomID: ${snapshot.roomId || 'legacy-save'}`,
      `Mission: ${snapshot.missionName} (${snapshot.missionId || 'legacy-save'})`,
      `Vitals: HP ${snapshot.health.toFixed(0)} | Guard ${snapshot.guard.toFixed(0)} | Focus ${snapshot.focus.toFixed(0)} | Overburn ${snapshot.overburn.toFixed(0)}`,
      `Relics: ${relicSummary}`,
      `RelicMods: DMG x${snapshot.relicModifiers.primaryDamageMultiplier.toFixed(2)} | GuardTaken x${snapshot.relicModifiers.guardDamageTakenMultiplier.toFixed(2)} | DashCost x${snapshot.relicModifiers.dashFocusCostMultiplier.toFixed(2)}`,
      `Saved: ${capturedLabel}`
    ].join('<br/>');
  }

  private createMainMenu(snapshot: ContinueSnapshot | null): HTMLElement {
    const panel = document.createElement('div');
    panel.style.display = 'grid';
    panel.style.gap = '8px';
    panel.style.minWidth = '250px';

    const title = document.createElement('div');
    title.textContent = 'Lumen Pilgrimage: Reforge';
    title.style.fontSize = '16px';
    title.style.fontWeight = '700';
    panel.append(title);

    const subtitle = document.createElement('div');
    subtitle.textContent = 'Main Menu';
    subtitle.style.opacity = '0.8';
    panel.append(subtitle);

    if (this.saveSlots.length > 0) {
      panel.append(this.createInfoLabel(`Active Save Slot: ${this.activeSaveSlotId + 1}`));
      const slotButtons = document.createElement('div');
      slotButtons.style.display = 'flex';
      slotButtons.style.gap = '6px';
      slotButtons.style.flexWrap = 'wrap';
      for (const slot of this.saveSlots) {
        const label = `Slot ${slot.slotId + 1}${slot.hasSave ? '' : ' (Empty)'}`;
        const command = slot.slotId === 0
          ? 'select-save-slot-0'
          : slot.slotId === 1
            ? 'select-save-slot-1'
            : 'select-save-slot-2';
        const button = this.createCommandButton(label, command);
        if (slot.slotId === this.activeSaveSlotId) {
          button.style.borderColor = '#9ad0ff';
          button.style.boxShadow = '0 0 0 1px rgba(154, 208, 255, 0.35) inset';
        }
        slotButtons.append(button);
      }
      panel.append(slotButtons);
      const activeSlot = this.saveSlots.find((slot) => slot.slotId === this.activeSaveSlotId);
      if (activeSlot) {
        panel.append(this.createInfoLabel(`Slot State: ${activeSlot.stateLabel}`));
        panel.append(this.createInfoLabel(`Last Update: ${activeSlot.updatedAtLabel}`));
      }
    }

    if (snapshot) {
      const continueMeta = document.createElement('div');
      continueMeta.textContent = `Continue: ${campaignBiomeLabel(snapshot.biomeId)} / ${snapshot.roomLabel}`;
      continueMeta.style.fontSize = '12px';
      continueMeta.style.opacity = '0.88';
      panel.append(continueMeta);
      panel.append(this.createCommandButton('Continue Expedition', 'continue'));
    } else {
      const noContinue = document.createElement('div');
      noContinue.textContent = 'Continue unavailable (no saved expedition)';
      noContinue.style.fontSize = '12px';
      noContinue.style.opacity = '0.75';
      panel.append(noContinue);
    }

    panel.append(this.createCommandButton('New Game', 'new-game'));
    panel.append(this.createCommandButton('Mode Select', 'open-mode-select'));
    panel.append(this.createCommandButton('Enter Hub', 'enter-hub'));
    panel.append(this.createCommandButton('Settings', 'open-settings'));
    panel.append(this.createCommandButton('Credits', 'open-credits'));
    return panel;
  }

  private createHubPanel(snapshot: ContinueSnapshot | null): HTMLElement {
    const panel = document.createElement('div');
    panel.style.display = 'grid';
    panel.style.gap = '8px';
    panel.style.minWidth = '300px';

    const title = document.createElement('div');
    title.textContent = "Pilgrim's Belfry (Hub)";
    title.style.fontSize = '16px';
    title.style.fontWeight = '700';
    panel.append(title);

    const hub = this.hub;
    if (hub) {
      panel.append(this.createInfoLabel(`Biomes: ${hub.unlockedBiomes.map((biome) => campaignBiomeLabel(biome)).join(', ')}`));
      panel.append(this.createInfoLabel(`Lumen Ash ${hub.lumenAsh} | Choir Thread ${hub.choirThread}`));
      panel.append(this.createInfoLabel(`Saint Glass ${hub.saintGlass} | Echo Script ${hub.echoScript}`));
      panel.append(this.createInfoLabel(this.buildUnlockSummaryLabel('Weapons', hub.unlockedWeapons, WEAPON_DEFS)));
      panel.append(this.createInfoLabel(this.buildUnlockSummaryLabel('Offhands', hub.unlockedOffhands, OFFHAND_DEFS)));
      panel.append(this.createInfoLabel(this.buildUnlockSummaryLabel('Sigils', hub.unlockedSigils, SIGIL_DEFS)));
    } else {
      panel.append(this.createInfoLabel('Hub progression unavailable'));
    }

    if (snapshot) {
      panel.append(this.createInfoLabel(`Resume-ready: ${campaignBiomeLabel(snapshot.biomeId)} / ${snapshot.roomLabel}`));
    }

    panel.append(this.createInfoLabel('Hub terminal controls: Q cycle terminal / E interact'));
    panel.append(this.createCommandButton('Expedition Prep', 'open-expedition-prep'));
    panel.append(this.createCommandButton('Open Meta Upgrades', 'open-meta-upgrade'));
    panel.append(this.createCommandButton('Back to Main Menu', 'back-main-menu'));
    return panel;
  }

  private createExpeditionPrepPanel(): HTMLElement {
    const panel = document.createElement('div');
    panel.style.display = 'grid';
    panel.style.gap = '8px';
    panel.style.minWidth = '340px';

    const title = document.createElement('div');
    title.textContent = 'Expedition Prep';
    title.style.fontSize = '16px';
    title.style.fontWeight = '700';
    panel.append(title);

    const prep = this.prep;
    if (!prep) {
      panel.append(this.createInfoLabel('Prep data unavailable'));
      panel.append(this.createCommandButton('Back to Hub', 'back-hub'));
      return panel;
    }

    const selectedBiomeId = prep.unlockedBiomes.includes(prep.selectedBiomeId) ? prep.selectedBiomeId : prep.unlockedBiomes[0] ?? 'ember-ossuary';
    const selectedMission = MISSION_TYPE_DEFS.find((mission) => mission.id === prep.selectedMissionId) ?? MISSION_TYPE_DEFS[0];
    const selectedWeapon = WEAPON_DEFS.find((weapon) => weapon.id === prep.selectedWeaponId) ?? WEAPON_DEFS[0];
    const selectedOffhand = OFFHAND_DEFS.find((offhand) => offhand.id === prep.selectedOffhandId) ?? OFFHAND_DEFS[0];
    const selectedSigil = SIGIL_DEFS.find((sigil) => sigil.id === prep.selectedSigilId) ?? SIGIL_DEFS[0];

    panel.append(this.createInfoLabel(`Biome: ${campaignBiomeLabel(selectedBiomeId)}`));
    panel.append(this.createCommandButton('Cycle Biome', 'prep-cycle-biome'));
    panel.append(this.createInfoLabel(`Mission: ${selectedMission.displayName}`));
    panel.append(this.createCommandButton('Cycle Mission', 'prep-cycle-mission'));
    panel.append(this.createInfoLabel(`Weapon: ${selectedWeapon.displayName}`));
    panel.append(this.createCommandButton('Cycle Weapon', 'prep-cycle-weapon'));
    panel.append(this.createInfoLabel(`Offhand: ${selectedOffhand.displayName}`));
    panel.append(this.createCommandButton('Cycle Offhand', 'prep-cycle-offhand'));
    panel.append(this.createInfoLabel(`Sigil: ${selectedSigil.displayName}`));
    panel.append(this.createCommandButton('Cycle Sigil', 'prep-cycle-sigil'));
    panel.append(this.createInfoLabel(`Route Bias: ${selectedMission.routeBias.join(' → ')}`));
    panel.append(this.createInfoLabel(`Objective: ${selectedMission.summary}`));
    panel.append(this.createCommandButton('Launch Expedition', 'launch-expedition'));
    panel.append(this.createCommandButton('Back to Hub', 'back-hub'));
    return panel;
  }

  private createMetaUpgradePanel(): HTMLElement {
    const panel = document.createElement('div');
    panel.style.display = 'grid';
    panel.style.gap = '8px';
    panel.style.minWidth = '310px';

    const title = document.createElement('div');
    title.textContent = 'Meta Upgrade Terminal';
    title.style.fontSize = '16px';
    title.style.fontWeight = '700';
    panel.append(title);

    const hub = this.hub;
    if (!hub) {
      panel.append(this.createInfoLabel('Meta progression unavailable'));
      panel.append(this.createCommandButton('Back to Hub', 'back-hub'));
      return panel;
    }

    panel.append(this.createInfoLabel(`Lumen Ash: ${hub.lumenAsh} (Astral Pike unlock cost: 80)`));
    panel.append(this.createCommandButton('Unlock Astral Pike (80 Ash)', 'unlock-astral-pike'));
    panel.append(this.createInfoLabel(`Choir Thread: ${hub.choirThread} (Beacon Crucible craft cost: 20)`));
    panel.append(this.createCommandButton('Craft Beacon Crucible (20 Thread)', 'craft-beacon-crucible'));
    panel.append(this.createCommandButton('Back to Hub', 'back-hub'));
    return panel;
  }

  private createSettingsPanel(): HTMLElement {
    const panel = document.createElement('div');
    panel.style.display = 'grid';
    panel.style.gap = '8px';
    panel.style.minWidth = '280px';

    const title = document.createElement('div');
    title.textContent = 'Settings';
    title.style.fontSize = '16px';
    title.style.fontWeight = '700';
    panel.append(title);

    const settings = this.settings;
    if (!settings) {
      panel.append(this.createInfoLabel('Settings unavailable'));
      panel.append(this.createCommandButton('Back to Main Menu', 'back-main-menu'));
      return panel;
    }

    panel.append(this.createInfoLabel(`Snap Turn: ${settings.snapTurn ? 'ON' : 'OFF'}`));
    panel.append(this.createCommandButton('Toggle Snap Turn', 'toggle-snap-turn'));
    panel.append(this.createInfoLabel(`Seated Mode: ${settings.seatedMode ? 'ON' : 'OFF'}`));
    panel.append(this.createCommandButton('Toggle Seated Mode', 'toggle-seated-mode'));
    panel.append(this.createInfoLabel(`Reduce Flashing: ${settings.reduceFlashing ? 'ON' : 'OFF'}`));
    panel.append(this.createCommandButton('Toggle Reduce Flashing', 'toggle-reduce-flashing'));
    panel.append(this.createInfoLabel(`UI Scale: ${(settings.uiScale * 100).toFixed(0)}%`));
    const scaleRow = document.createElement('div');
    scaleRow.style.display = 'grid';
    scaleRow.style.gridTemplateColumns = '1fr 1fr';
    scaleRow.style.gap = '8px';
    scaleRow.append(this.createCommandButton('Scale -', 'ui-scale-down'));
    scaleRow.append(this.createCommandButton('Scale +', 'ui-scale-up'));
    panel.append(scaleRow);
    panel.append(this.createInfoLabel(`Master Volume: ${Math.round(settings.masterVolume * 100)}%`));

    const volumeRow = document.createElement('div');
    volumeRow.style.display = 'grid';
    volumeRow.style.gridTemplateColumns = '1fr 1fr';
    volumeRow.style.gap = '8px';
    volumeRow.append(this.createCommandButton('Volume -', 'master-volume-down'));
    volumeRow.append(this.createCommandButton('Volume +', 'master-volume-up'));
    panel.append(volumeRow);

    panel.append(this.createCommandButton('Back to Main Menu', 'back-main-menu'));
    return panel;
  }

  private createCreditsPanel(): HTMLElement {
    const panel = document.createElement('div');
    panel.style.display = 'grid';
    panel.style.gap = '8px';
    panel.style.minWidth = '280px';

    const title = document.createElement('div');
    title.textContent = 'Credits';
    title.style.fontSize = '16px';
    title.style.fontWeight = '700';
    panel.append(title);
    panel.append(this.createInfoLabel('Lumen Pilgrimage: Reforge'));
    panel.append(this.createInfoLabel('Core Prototype Team'));
    panel.append(this.createInfoLabel('Design / Engineering / Art / Audio'));
    panel.append(this.createCommandButton('Back to Main Menu', 'back-main-menu'));
    return panel;
  }

  private createModeSelectPanel(): HTMLElement {
    const panel = document.createElement('div');
    panel.style.display = 'grid';
    panel.style.gap = '8px';
    panel.style.minWidth = '320px';

    const title = document.createElement('div');
    title.textContent = 'Mode Select';
    title.style.fontSize = '16px';
    title.style.fontWeight = '700';
    panel.append(title);

    const selected = RUN_MODE_DEFS.find((entry) => entry.id === this.selectedRunMode) ?? RUN_MODE_DEFS[0];
    panel.append(this.createInfoLabel(`Selected: ${selected.label}`));
    panel.append(this.createInfoLabel(selected.summary));

    panel.append(this.createCommandButton('Campaign', 'select-mode-campaign'));
    panel.append(this.createCommandButton('Contracts', 'select-mode-contracts'));
    panel.append(this.createCommandButton('Boss Rush', 'select-mode-boss-rush'));
    panel.append(this.createCommandButton('Endless Collapse', 'select-mode-endless-collapse'));
    panel.append(this.createCommandButton('Back to Main Menu', 'back-main-menu'));
    return panel;
  }

  private createInfoLabel(text: string): HTMLDivElement {
    const label = document.createElement('div');
    label.textContent = text;
    label.style.fontSize = '12px';
    label.style.opacity = '0.85';
    return label;
  }

  private buildUnlockSummaryLabel<T extends { readonly id: string; readonly displayName: string }>(
    title: string,
    unlockedIds: readonly string[],
    defs: readonly T[]
  ): string {
    const unlockedNames = defs.filter((def) => unlockedIds.includes(def.id)).map((def) => def.displayName);
    const lockedNames = defs.filter((def) => !unlockedIds.includes(def.id)).map((def) => def.displayName);
    const unlockedLabel = unlockedNames.length > 0 ? unlockedNames.join(', ') : 'none';
    const lockedLabel = lockedNames.length > 0 ? lockedNames.join(', ') : 'none';
    return `${title} ${unlockedNames.length}/${defs.length} | Unlocked: ${unlockedLabel} | Locked: ${lockedLabel}`;
  }

  private createCommandButton(label: string, command: MenuCommand): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.style.padding = '7px 10px';
    button.style.background = 'rgba(255,255,255,0.08)';
    button.style.border = '1px solid rgba(255,255,255,0.26)';
    button.style.color = '#f0f6ff';
    button.style.textAlign = 'left';
    button.style.cursor = 'pointer';
    button.addEventListener('click', () => {
      this.commandQueue.push(command);
    });
    return button;
  }
}
