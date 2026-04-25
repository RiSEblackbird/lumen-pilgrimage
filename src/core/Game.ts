import { AudioListener, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { DEFAULT_GAME_CONFIG } from './GameConfig';
import { GameLoop } from './GameLoop';
import { DesktopActionAdapter } from '../engine/input/DesktopActionAdapter';
import { XRActionAdapter } from '../engine/input/XRActionAdapter';
import { SettingsStore } from '../engine/save/SettingsStore';
import { AudioDirector } from '../engine/audio/AudioDirector';
import { DEFAULT_META_PROGRESS, SaveManager, type MetaProgress } from '../engine/save/SaveManager';
import { PerfHud } from '../engine/debug/PerfHud';
import { GameStateMachine } from '../game/state/GameStateMachine';
import { CampaignState } from '../game/state/CampaignState';
import { ExpeditionState } from '../game/state/ExpeditionState';
import { MetaProgressionState } from '../game/state/MetaProgressionState';
import { FIRST_BIOME_ID, campaignBiomeLabel, normalizeUnlockedBiomes } from '../game/state/CampaignBiomes';
import { HudManager } from '../game/ui/HudManager';
import { MenuManager, type ContinueSnapshot, type HubViewModel, type MenuCommand, type SaveSlotSummary, type SettingsViewModel } from '../game/ui/MenuManager';
import type { ExpeditionPrepViewModel } from '../game/ui/MenuManager';
import { VrWristUi } from '../game/ui/VrWristUi';
import { CombatSandboxDirector } from '../game/sandbox/CombatSandboxDirector';
import type { ExpeditionPlan } from '../game/sandbox/CombatSandboxDirector';
import { PilgrimsBelfryScene } from '../world/hub/PilgrimsBelfryScene';
import { MISSION_TYPE_DEFS } from '../game/encounters/MissionTypes';
import { SessionBootstrap } from '../bootstrap/SessionBootstrap';
import { DEFAULT_RUN_MODE, type RunMode } from '../game/state/RunMode';
import { nextDifficultyId } from '../game/state/DifficultyState';
import type { ArenaDeviceVisualHooks } from '../game/director/ArenaMutationDirector';

const IDLE_ARENA_VISUAL_HOOKS: ArenaDeviceVisualHooks = {
  biomeId: 'default',
  phaseTitle: 'No phase',
  channels: { hazard: 0, focus: 0, guard: 0, overburn: 0 },
  dominantDeviceLabel: 'No arena devices active',
  visualSummary: 'Arena Visuals H0 F0 G0 O0 · No arena devices active'
};

export class Game {
  private static readonly SAVE_SLOT_IDS = [0, 1, 2] as const;
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
  private readonly audioListener = new AudioListener();
  private readonly loop = new GameLoop();
  private readonly states = new GameStateMachine();
  private readonly desktopInput: DesktopActionAdapter;
  private readonly xrInput: XRActionAdapter;
  private readonly sessionBootstrap: SessionBootstrap;
  private readonly settings = new SettingsStore();
  private readonly audioDirector: AudioDirector;
  private readonly saves = new SaveManager();
  private readonly perfHud: PerfHud | null;
  private readonly menu: MenuManager;
  private readonly hud: HudManager;
  private readonly vrUi = new VrWristUi();
  private readonly hubScene: PilgrimsBelfryScene;
  private readonly combatSandbox: CombatSandboxDirector;
  private settingsViewModel: SettingsViewModel;

  private fpsAccumulator = 0;
  private fpsFrameCount = 0;
  private saveAccumulator = 0;
  private continueSnapshot: ContinueSnapshot | null = null;
  private hubViewModel: HubViewModel;
  private expeditionPrep: ExpeditionPrepViewModel;
  private runActive = false;
  private prevInteractPressed = false;
  private prevOffhandPressed = false;
  private readonly campaignState: CampaignState;
  private readonly expeditionState = new ExpeditionState();
  private readonly metaState: MetaProgressionState;
  private selectedRunMode: RunMode = DEFAULT_RUN_MODE;
  private activeSlotId = 0;

  constructor(container: HTMLElement) {
    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.enabled = true;
    this.renderer.xr.setReferenceSpaceType('local-floor');

    this.camera.position.copy(new Vector3(0, 1.65, 3.5));
    this.camera.add(this.audioListener);

    this.desktopInput = new DesktopActionAdapter(window);
    this.audioDirector = new AudioDirector(this.audioListener);
    this.xrInput = new XRActionAdapter(this.renderer);
    this.sessionBootstrap = new SessionBootstrap(this.renderer);
    this.perfHud = DEFAULT_GAME_CONFIG.enableDebugHud ? new PerfHud(container) : null;
    this.menu = new MenuManager(container);
    this.hud = new HudManager(container);
    this.hubScene = new PilgrimsBelfryScene(this.scene);

    this.settingsViewModel = this.settings.load();
    this.settings.save(this.settingsViewModel);
    const slot = this.saves.loadOrCreate(this.activeSlotId, {
      state: 'Hub',
      unlockedBiomes: [FIRST_BIOME_ID],
      expedition: null,
      metaProgress: DEFAULT_META_PROGRESS
    });
    this.continueSnapshot = slot.expedition;
    this.hubViewModel = this.toHubViewModel(slot.unlockedBiomes, slot.metaProgress);
    this.campaignState = new CampaignState(slot.unlockedBiomes);
    this.metaState = new MetaProgressionState(slot.metaProgress);
    this.expeditionState.restoreFromContinue(slot.expedition);

    this.combatSandbox = new CombatSandboxDirector(this.continueSnapshot);
    this.combatSandbox.configureLoadoutAvailability(slot.metaProgress);
    this.combatSandbox.setDifficulty(this.settingsViewModel.difficultyId);
    this.expeditionPrep = this.toExpeditionPrepViewModel(this.combatSandbox.getExpeditionPlan(), this.hubViewModel);
    this.menu.setContinueSnapshot(this.continueSnapshot);
    this.menu.setSettings(this.settingsViewModel);
    this.menu.setHub(this.hubViewModel);
    this.menu.setExpeditionPrep(this.expeditionPrep);
    this.menu.setSelectedRunMode(this.selectedRunMode);
    this.syncSaveSlotMenu();
    this.applyRuntimeSettings();
    this.syncHubWorldWidgets();
    this.syncHubWristUi();

    container.appendChild(this.renderer.domElement);
    container.appendChild(VRButton.createButton(this.renderer));

    this.states.transition('MainMenu');
    this.persistCurrentState();
    this.menu.setState(this.states.current);

    window.addEventListener('resize', () => this.onResize());
    this.renderer.setAnimationLoop(() => this.tick());
  }

  private onResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private tick(): void {
    this.loop.tick((delta, elapsed) => {
      this.hubScene.tick(elapsed);
      this.audioDirector.tick(delta);
      const sessionLifecycle = this.sessionBootstrap.tick();
      this.xrInput.applySessionStatus({
        active: sessionLifecycle.state !== 'idle',
        referenceSpaceReady: sessionLifecycle.referenceSpaceReady,
        lifecycleLabel: sessionLifecycle.statusLabel
      });
      this.renderer.render(this.scene, this.camera);
      this.updateDebug(delta);
      const desktopActions = this.desktopInput.snapshot();
      this.updateVrHubPointer();
      this.handleHubTerminalInput(desktopActions);
      this.handleMenuCommands();

      if (!this.runActive) {
        this.hubScene.setArenaVisualHooks(IDLE_ARENA_VISUAL_HOOKS);
        this.syncHubWorldWidgets();
        this.syncHubWristUi();
        this.vrUi.setStatus(this.xrInput.getSessionStatusLabel());
        this.audioDirector.setHubAmbientMix();
        this.hud.render({
          health: 100,
          guard: 100,
          focus: 100,
          overburn: 0,
          objective: this.campaignState.getSnapshot().currentObjective,
          weaponName: '-',
          offhandName: '-',
          sigilName: '-',
          enemiesRemaining: 0,
          telegraphLabel: 'No active expedition',
          staggeredEnemies: 0,
          missionName: 'No mission selected',
          pressureLabel: 'No pressure budget',
          rewardLabel: 'No reward pending',
          equippedRelics: [],
          encounterLabel: 'Awaiting expedition launch',
          contractLabel: 'No contract',
          bossLabel: 'No Warden contact',
          bossHealthLabel: 'Boss HP: -',
          arenaMutationLabel: 'Arena stable',
          arenaEffectsLabel: 'Arena effects idle',
          arenaVisualLabel: IDLE_ARENA_VISUAL_HOOKS.visualSummary,
          loadoutPoolLabel: this.metaState.toLoadoutPoolLabel(),
          ashSightLabel: 'Ash Sight READY (Cost 20 Focus, CD 12s)',
          musicLabel: 'Music Mix E100 T0 C0 K0 B0 · hub sanctuary ambience',
          runSummaryLabel: 'Run 0:00 · K 0 · DMG 0/0 · Parry 0 · Dash 0 · AshSight 0 · Relic 0 · Intensity LOW'
        });
        this.menu.setState(this.states.current);
        return;
      }

      const sandbox = this.combatSandbox.update(desktopActions, delta);
      this.hubScene.setArenaVisualHooks(sandbox.arenaVisualHooks);
      this.audioDirector.applyMusicMix(sandbox.musicMix);
      this.vrUi.setStatus(`In Expedition · ${this.xrInput.getSessionStatusLabel()}`);
      const objective = this.xrInput.isPresenting()
        ? `${sandbox.objective} / VR Wrist: ${this.vrUi.getStatus()}`
        : sandbox.objective;

      this.hud.render({
        ...sandbox,
        objective
      });
      this.menu.setState(this.states.current);

      this.saveAccumulator += delta;
      if (this.saveAccumulator >= 1) {
        this.saveAccumulator = 0;
        const snapshot = this.combatSandbox.getPersistenceSnapshot();
        this.expeditionState.syncFromPersistence(snapshot);
        const updated = this.saves.updateExpedition(this.activeSlotId, {
          runSeed: snapshot.runSeed,
          biomeId: snapshot.biomeId,
          missionId: snapshot.missionId,
          sectorIndex: snapshot.sectorIndex,
          sectorsTotal: snapshot.sectorsTotal,
          roomId: snapshot.roomId,
          roomLabel: snapshot.roomLabel,
          routeStyle: snapshot.routeStyle,
          missionName: snapshot.missionName,
          health: snapshot.health,
          guard: snapshot.guard,
          focus: snapshot.focus,
          overburn: snapshot.overburn,
          relicIds: snapshot.relicIds,
          relicModifiers: snapshot.relicModifiers,
          capturedAtIso: new Date().toISOString()
        });
        if (updated) {
          this.continueSnapshot = updated.expedition;
          this.campaignState.replaceUnlockedBiomes(updated.unlockedBiomes);
          this.metaState.replace(updated.metaProgress);
          this.hubViewModel = this.toHubViewModel(updated.unlockedBiomes, updated.metaProgress);
          this.menu.setContinueSnapshot(this.continueSnapshot);
          this.menu.setHub(this.hubViewModel);
          this.syncSaveSlotMenu();
          this.syncHubWorldWidgets();
        }
      }
    });
  }

  private handleMenuCommands(): void {
    const command = this.menu.consumeCommand();
    if (!command) {
      return;
    }

    if (command === 'continue') {
      this.startExpeditionFromContinue();
      return;
    }

    if (command === 'new-game') {
      this.startNewGame();
      return;
    }

    if (command === 'launch-expedition') {
      this.startExpeditionFromHub();
      return;
    }

    if (command === 'select-save-slot-0') {
      this.switchSaveSlot(0);
      return;
    }

    if (command === 'select-save-slot-1') {
      this.switchSaveSlot(1);
      return;
    }

    if (command === 'select-save-slot-2') {
      this.switchSaveSlot(2);
      return;
    }

    this.handleMetaMenu(command);
  }

  private handleMetaMenu(command: Exclude<MenuCommand, 'continue' | 'new-game' | 'launch-expedition'>): void {
    if (command === 'enter-hub' && this.states.canTransition('Hub')) {
      this.states.transition('Hub');
      this.persistCurrentState();
      return;
    }

    if (command === 'open-mode-select' && this.states.current === 'MainMenu' && this.states.canTransition('BossRush')) {
      this.states.transition('BossRush');
      this.persistCurrentState();
      return;
    }

    if (command === 'select-mode-campaign') {
      this.applyRunModeSelection('campaign');
      return;
    }

    if (command === 'select-mode-contracts') {
      this.applyRunModeSelection('contracts');
      return;
    }

    if (command === 'select-mode-boss-rush') {
      this.applyRunModeSelection('boss-rush');
      return;
    }

    if (command === 'select-mode-endless-collapse') {
      this.applyRunModeSelection('endless-collapse');
      return;
    }

    if (command === 'open-meta-upgrade' && this.states.current === 'Hub' && this.states.canTransition('MetaUpgrade')) {
      this.states.transition('MetaUpgrade');
      this.persistCurrentState();
      return;
    }

    if (command === 'open-expedition-prep' && this.states.current === 'Hub' && this.states.canTransition('ExpeditionPrep')) {
      this.states.transition('ExpeditionPrep');
      this.persistCurrentState();
      return;
    }

    if (command === 'unlock-astral-pike') {
      this.tryUnlockAstralPike();
      return;
    }

    if (command === 'craft-beacon-crucible') {
      this.tryCraftBeaconCrucible();
      return;
    }

    if (command === 'back-hub' && this.states.canTransition('Hub')) {
      this.states.transition('Hub');
      this.persistCurrentState();
      return;
    }

    if (command === 'prep-cycle-biome') {
      this.updateExpeditionPrepSelection('biome');
      return;
    }

    if (command === 'prep-cycle-mission') {
      this.updateExpeditionPrepSelection('mission');
      return;
    }

    if (command === 'prep-cycle-weapon') {
      this.updateExpeditionPrepSelection('weapon');
      return;
    }

    if (command === 'prep-cycle-offhand') {
      this.updateExpeditionPrepSelection('offhand');
      return;
    }

    if (command === 'prep-cycle-sigil') {
      this.updateExpeditionPrepSelection('sigil');
      return;
    }

    if (command === 'open-credits' && this.states.canTransition('Credits')) {
      this.states.transition('Credits');
      this.persistCurrentState();
      return;
    }

    if (command === 'open-settings' && this.states.canTransition('Settings')) {
      this.states.transition('Settings');
      this.persistCurrentState();
      return;
    }

    if (command === 'open-accessibility' && this.states.canTransition('Accessibility')) {
      this.states.transition('Accessibility');
      this.persistCurrentState();
      return;
    }

    if (command === 'open-controls' && this.states.canTransition('Controls')) {
      this.states.transition('Controls');
      this.persistCurrentState();
      return;
    }

    if (command === 'toggle-snap-turn') {
      this.updateSettings({ snapTurn: !this.settingsViewModel.snapTurn });
      return;
    }

    if (command === 'cycle-turn-style') {
      this.updateSettings({ turnStyle: this.settingsViewModel.turnStyle === 'snap' ? 'smooth' : 'snap' });
      return;
    }

    if (command === 'toggle-seated-mode') {
      this.updateSettings({ seatedMode: !this.settingsViewModel.seatedMode });
      return;
    }

    if (command === 'toggle-reduce-flashing') {
      this.updateSettings({ reduceFlashing: !this.settingsViewModel.reduceFlashing });
      return;
    }

    if (command === 'toggle-subtitles') {
      this.updateSettings({ subtitleEnabled: !this.settingsViewModel.subtitleEnabled });
      return;
    }

    if (command === 'toggle-colorblind-cues') {
      this.updateSettings({ colorblindSafeCues: !this.settingsViewModel.colorblindSafeCues });
      return;
    }

    if (command === 'toggle-reduce-screen-shake') {
      this.updateSettings({ reduceScreenShake: !this.settingsViewModel.reduceScreenShake });
      return;
    }

    if (command === 'toggle-tinnitus-safe-mode') {
      this.updateSettings({ tinnitusSafeMode: !this.settingsViewModel.tinnitusSafeMode });
      return;
    }

    if (command === 'toggle-reduce-sudden-peaks') {
      this.updateSettings({ reduceSuddenPeaks: !this.settingsViewModel.reduceSuddenPeaks });
      return;
    }

    if (command === 'ui-scale-down') {
      this.adjustUiScale(-0.1);
      return;
    }

    if (command === 'ui-scale-up') {
      this.adjustUiScale(0.1);
      return;
    }

    if (command === 'master-volume-down') {
      this.adjustMasterVolume(-0.05);
      return;
    }

    if (command === 'master-volume-up') {
      this.adjustMasterVolume(0.05);
      return;
    }

    if (command === 'cycle-difficulty') {
      this.updateSettings({ difficultyId: nextDifficultyId(this.settingsViewModel.difficultyId) });
      return;
    }

    if (command === 'toggle-hold-to-guard') {
      this.updateSettings({ holdToGuard: !this.settingsViewModel.holdToGuard });
      return;
    }

    if (command === 'toggle-aim-assist-flat') {
      this.updateSettings({ aimAssistFlat: !this.settingsViewModel.aimAssistFlat });
      return;
    }

    if (command === 'cycle-dominant-hand') {
      this.updateSettings({ dominantHand: this.settingsViewModel.dominantHand === 'right' ? 'left' : 'right' });
      return;
    }

    if (command === 'back-main-menu' && this.states.canTransition('MainMenu')) {
      this.states.transition('MainMenu');
      this.persistCurrentState();
    }
  }

  private updateSettings(partial: Partial<SettingsViewModel>): void {
    this.settingsViewModel = {
      ...this.settingsViewModel,
      ...partial
    };
    this.settings.save(this.settingsViewModel);
    this.menu.setSettings(this.settingsViewModel);
    this.applyRuntimeSettings();
    this.syncHubWorldWidgets();
    this.syncHubWristUi();
  }

  private applyRuntimeSettings(): void {
    this.menu.setUiScale(this.settingsViewModel.uiScale);
    this.hud.setUiScale(this.settingsViewModel.uiScale);
    this.perfHud?.setUiScale(this.settingsViewModel.uiScale);
    this.audioListener.setMasterVolume(this.settingsViewModel.masterVolume);
    this.xrInput.setComfort({
      snapTurn: this.settingsViewModel.snapTurn,
      seatedMode: this.settingsViewModel.seatedMode
    });
    this.hubScene.setReduceFlashing(this.settingsViewModel.reduceFlashing);
    this.combatSandbox.setDifficulty(this.settingsViewModel.difficultyId);
    this.vrUi.applySettings(this.xrInput.getComfortStatus(), this.settingsViewModel.masterVolume);
    this.syncHubWristUi();
  }

  private adjustUiScale(delta: number): void {
    const nextScale = Math.max(0.8, Math.min(1.4, this.settingsViewModel.uiScale + delta));
    this.updateSettings({ uiScale: Number(nextScale.toFixed(2)) });
  }

  private adjustMasterVolume(delta: number): void {
    const nextVolume = Math.max(0, Math.min(1, this.settingsViewModel.masterVolume + delta));
    this.updateSettings({ masterVolume: nextVolume });
  }

  private startExpeditionFromContinue(): void {
    if (!this.continueSnapshot) {
      return;
    }

    this.selectedRunMode = DEFAULT_RUN_MODE;
    this.menu.setSelectedRunMode(this.selectedRunMode);
    this.combatSandbox.resetForRun(this.continueSnapshot);
    this.expeditionState.restoreFromContinue(this.continueSnapshot);
    this.enterRunStates();
  }

  private startExpeditionFromHub(): void {
    this.combatSandbox.configureExpeditionPlan({
      runMode: this.selectedRunMode,
      biomeId: this.expeditionPrep.selectedBiomeId,
      missionId: this.expeditionPrep.selectedMissionId,
      weaponId: this.expeditionPrep.selectedWeaponId,
      offhandId: this.expeditionPrep.selectedOffhandId,
      sigilId: this.expeditionPrep.selectedSigilId
    });
    this.combatSandbox.resetForRun(null);
    this.expeditionState.beginFreshRun(this.expeditionPrep.selectedBiomeId);
    this.runActive = true;
    if (this.states.current === 'Hub' && this.states.canTransition('ExpeditionPrep')) {
      this.states.transition('ExpeditionPrep');
      this.persistCurrentState();
    }
    if (this.states.current === 'ExpeditionPrep') {
      this.transitionToRunState();
    }
  }

  private startNewGame(): void {
    const slot = this.saves.resetSlot(this.activeSlotId, {
      state: 'Hub',
      unlockedBiomes: [FIRST_BIOME_ID],
      expedition: null,
      metaProgress: DEFAULT_META_PROGRESS
    });
    this.continueSnapshot = slot.expedition;
    this.campaignState.replaceUnlockedBiomes(slot.unlockedBiomes);
    this.metaState.replace(slot.metaProgress);
    this.expeditionState.reset();
    this.hubViewModel = this.toHubViewModel(slot.unlockedBiomes, slot.metaProgress);
    this.menu.setContinueSnapshot(this.continueSnapshot);
    this.menu.setHub(this.hubViewModel);
    this.combatSandbox.resetForRun(null);
    this.combatSandbox.configureLoadoutAvailability(slot.metaProgress);
    this.expeditionPrep = this.toExpeditionPrepViewModel(this.combatSandbox.getExpeditionPlan(), this.hubViewModel);
    this.menu.setExpeditionPrep(this.expeditionPrep);
    this.runActive = false;
    this.selectedRunMode = DEFAULT_RUN_MODE;
    this.menu.setSelectedRunMode(this.selectedRunMode);
    this.syncSaveSlotMenu();
    this.syncHubWorldWidgets();
    if (this.states.canTransition('Hub')) {
      this.states.transition('Hub');
      this.persistCurrentState();
    }
  }

  private tryUnlockAstralPike(): void {
    const updated = this.saves.updateMetaProgress(this.activeSlotId, (meta) => {
      if (meta.unlockedWeapons.includes('astral-pike') || meta.lumenAsh < 80) {
        return meta;
      }
      return {
        ...meta,
        lumenAsh: meta.lumenAsh - 80,
        unlockedWeapons: [...meta.unlockedWeapons, 'astral-pike']
      };
    });
    this.applyUpdatedSlot(updated);
  }

  private tryCraftBeaconCrucible(): void {
    const updated = this.saves.updateMetaProgress(this.activeSlotId, (meta) => {
      if (meta.unlockedOffhands.includes('beacon-crucible') || meta.choirThread < 20) {
        return meta;
      }
      return {
        ...meta,
        choirThread: meta.choirThread - 20,
        unlockedOffhands: [...meta.unlockedOffhands, 'beacon-crucible']
      };
    });
    this.applyUpdatedSlot(updated);
  }

  private applyUpdatedSlot(slot: { unlockedBiomes: readonly string[]; metaProgress: MetaProgress } | null): void {
    if (!slot) {
      return;
    }
    this.combatSandbox.configureLoadoutAvailability(slot.metaProgress);
    this.campaignState.replaceUnlockedBiomes(slot.unlockedBiomes);
    this.metaState.replace(slot.metaProgress);
    this.hubViewModel = this.toHubViewModel(slot.unlockedBiomes, slot.metaProgress);
    this.menu.setHub(this.hubViewModel);
    this.expeditionPrep = this.toExpeditionPrepViewModel(this.combatSandbox.getExpeditionPlan(), this.hubViewModel);
    this.menu.setExpeditionPrep(this.expeditionPrep);
    this.syncHubWorldWidgets();
    this.syncSaveSlotMenu();
  }

  private toHubViewModel(unlockedBiomes: readonly string[], meta: MetaProgress): HubViewModel {
    const normalizedBiomes = normalizeUnlockedBiomes(unlockedBiomes);
    return {
      unlockedBiomes: normalizedBiomes,
      lumenAsh: Math.max(0, Math.floor(meta.lumenAsh)),
      choirThread: Math.max(0, Math.floor(meta.choirThread)),
      saintGlass: Math.max(0, Math.floor(meta.saintGlass)),
      echoScript: Math.max(0, Math.floor(meta.echoScript)),
      unlockedWeapons: meta.unlockedWeapons,
      unlockedOffhands: meta.unlockedOffhands,
      unlockedSigils: meta.unlockedSigils
    };
  }

  private toExpeditionPrepViewModel(plan: ExpeditionPlan, hub: HubViewModel): ExpeditionPrepViewModel {
    const safeBiome = hub.unlockedBiomes.includes(plan.biomeId) ? plan.biomeId : hub.unlockedBiomes[0] ?? 'ember-ossuary';
    return {
      selectedBiomeId: safeBiome,
      selectedMissionId: MISSION_TYPE_DEFS.some((mission) => mission.id === plan.missionId) ? plan.missionId : MISSION_TYPE_DEFS[0].id,
      selectedWeaponId: hub.unlockedWeapons.includes(plan.weaponId) ? plan.weaponId : (hub.unlockedWeapons[0] ?? 'prism-blade'),
      selectedOffhandId: hub.unlockedOffhands.includes(plan.offhandId) ? plan.offhandId : (hub.unlockedOffhands[0] ?? 'ward-aegis'),
      selectedSigilId: hub.unlockedSigils.includes(plan.sigilId) ? plan.sigilId : (hub.unlockedSigils[0] ?? 'blink-dash'),
      unlockedBiomes: hub.unlockedBiomes,
      unlockedWeapons: hub.unlockedWeapons,
      unlockedOffhands: hub.unlockedOffhands,
      unlockedSigils: hub.unlockedSigils
    };
  }

  private updateExpeditionPrepSelection(kind: 'biome' | 'mission' | 'weapon' | 'offhand' | 'sigil'): void {
    const current = this.expeditionPrep;
    const next = { ...current };

    if (kind === 'biome') {
      next.selectedBiomeId = this.rotateString(next.unlockedBiomes, next.selectedBiomeId);
    } else if (kind === 'mission') {
      next.selectedMissionId = this.rotateString(
        MISSION_TYPE_DEFS.map((mission) => mission.id),
        next.selectedMissionId
      );
    } else if (kind === 'weapon') {
      next.selectedWeaponId = this.rotateString(next.unlockedWeapons, next.selectedWeaponId);
    } else if (kind === 'offhand') {
      next.selectedOffhandId = this.rotateString(next.unlockedOffhands, next.selectedOffhandId);
    } else {
      next.selectedSigilId = this.rotateString(next.unlockedSigils, next.selectedSigilId);
    }

    this.expeditionPrep = next;
    this.menu.setExpeditionPrep(this.expeditionPrep);
    this.combatSandbox.configureExpeditionPlan({
      runMode: this.selectedRunMode,
      biomeId: next.selectedBiomeId,
      missionId: next.selectedMissionId,
      weaponId: next.selectedWeaponId,
      offhandId: next.selectedOffhandId,
      sigilId: next.selectedSigilId
    });
    this.syncHubWorldWidgets();
    this.syncHubWristUi();
  }

  private rotateString(options: readonly string[], current: string): string {
    if (options.length === 0) {
      return current;
    }
    const index = options.indexOf(current);
    if (index < 0) {
      return options[0];
    }
    return options[(index + 1) % options.length];
  }

  private enterRunStates(): void {
    this.runActive = true;
    if (this.states.current === 'MainMenu') {
      this.states.transition('Hub');
      this.persistCurrentState();
    }
    if (this.states.current === 'Hub') {
      this.states.transition('ExpeditionPrep');
      this.persistCurrentState();
    }
    if (this.states.current === 'ExpeditionPrep') {
      this.transitionToRunState();
    }
  }

  private applyRunModeSelection(mode: RunMode): void {
    this.selectedRunMode = mode;
    this.menu.setSelectedRunMode(mode);
    if (this.states.current !== 'BossRush' && this.states.current !== 'EndlessCollapse') {
      return;
    }

    if (this.states.canTransition('MainMenu')) {
      this.states.transition('MainMenu');
      this.persistCurrentState();
    }
  }

  private transitionToRunState(): void {
    const targetState = this.selectedRunMode === 'boss-rush'
      ? 'BossRush'
      : this.selectedRunMode === 'endless-collapse'
        ? 'EndlessCollapse'
        : 'InExpedition';
    if (this.states.canTransition(targetState)) {
      this.states.transition(targetState);
      this.persistCurrentState();
    }
  }


  private handleHubTerminalInput(actions: { readonly interact: boolean; readonly offhand: boolean }): void {
    const canUseHubTerminal = !this.runActive && this.states.current === 'Hub';
    if (!canUseHubTerminal) {
      this.prevInteractPressed = actions.interact;
      this.prevOffhandPressed = actions.offhand;
      return;
    }

    const allowDesktopCycle = !this.xrInput.isPresenting();
    const cyclePressed = allowDesktopCycle && actions.offhand && !this.prevOffhandPressed;
    if (cyclePressed) {
      const selectedLabel = this.hubScene.cycleHubTerminal();
      this.vrUi.setHubTerminalLabel(selectedLabel);
    }

    const interactPressed = actions.interact && !this.prevInteractPressed;
    if (interactPressed) {
      const terminalAction = this.hubScene.activateHubTerminal();
      this.handleMetaMenu(terminalAction);
    }

    this.prevInteractPressed = actions.interact;
    this.prevOffhandPressed = actions.offhand;
  }

  private updateVrHubPointer(): void {
    const canUseHubPointer = this.xrInput.isPresenting() && !this.runActive && this.states.current === 'Hub';
    if (!canUseHubPointer) {
      this.hubScene.clearPointerAffordance();
      if (this.xrInput.isPresenting()) {
        this.vrUi.setPrompt('Hub terminal not available');
      } else {
        this.vrUi.setPrompt('Aim terminal then press Interact');
      }
      return;
    }

    const pointerRays = this.xrInput.getControllerPointerRays();
    const selection = this.hubScene.selectHubTerminalFromPointerRays(pointerRays);
    if (!selection) {
      this.hubScene.clearPointerAffordance();
      this.vrUi.setPrompt(pointerRays.length === 0 ? 'Controller aim required for terminal select' : 'Aim terminal then press Interact');
      return;
    }

    const pointerLabel = selection.handedness === 'left' || selection.handedness === 'right'
      ? `${selection.handedness === 'left' ? 'Left' : 'Right'} hand lock active: press Interact`
      : 'Controller lock active: press Interact';
    this.vrUi.setPrompt(pointerLabel);
    this.vrUi.setHubTerminalLabel(selection.label);
  }

  private syncHubWristUi(): void {
    const selectedMission = MISSION_TYPE_DEFS.find((mission) => mission.id === this.expeditionPrep.selectedMissionId);
    const missionLabel = selectedMission?.displayName ?? this.expeditionPrep.selectedMissionId;
    this.vrUi.setHubTerminalLabel(this.hubScene.getSelectedHubTerminalLabel());
    this.vrUi.setPrepSummary(`${this.expeditionPrep.selectedWeaponId} / ${this.expeditionPrep.selectedOffhandId} / ${missionLabel}`);

    if (this.states.current === 'Hub') {
      this.vrUi.setStatus('Hub - Terminal Ready');
      return;
    }

    if (this.states.current === 'ExpeditionPrep') {
      this.vrUi.setStatus('Expedition Prep');
      return;
    }

    if (!this.runActive) {
      this.vrUi.setStatus(this.states.current);
    }
  }

  private syncHubWorldWidgets(): void {
    const unlockedBiomeCount = this.hubViewModel.unlockedBiomes.length;
    const maxBiomeGoal = 6;
    const expeditionIntensity = Math.min(1, unlockedBiomeCount / maxBiomeGoal);
    const prepReadiness = this.expeditionPrep.selectedBiomeId && this.expeditionPrep.selectedMissionId ? 1 : 0.4;
    this.hubScene.setTerminalWidgetState('expedition-prep-terminal', {
      label: `Expedition Ready · ${campaignBiomeLabel(this.expeditionPrep.selectedBiomeId)}`,
      intensity: Math.max(expeditionIntensity, prepReadiness)
    });

    const unlockCount =
      this.hubViewModel.unlockedWeapons.length +
      this.hubViewModel.unlockedOffhands.length +
      this.hubViewModel.unlockedSigils.length;
    const unlockGoal = 20;
    this.hubScene.setTerminalWidgetState('meta-upgrade-terminal', {
      label: `Meta Unlocks ${unlockCount}/${unlockGoal}`,
      intensity: Math.min(1, unlockCount / unlockGoal)
    });

    const returnIntensity = this.continueSnapshot ? 0.78 : 0.45;
    this.hubScene.setTerminalWidgetState('main-menu-terminal', {
      label: this.continueSnapshot ? 'Return + Continue Available' : 'Return to Main Menu',
      intensity: returnIntensity
    });
  }

  private persistCurrentState(): void {
    this.saves.updateState(this.activeSlotId, this.states.current);
    this.syncSaveSlotMenu();
  }

  private switchSaveSlot(slotId: number): void {
    if (this.activeSlotId === slotId) {
      return;
    }

    this.activeSlotId = slotId;
    const slot = this.saves.loadOrCreate(this.activeSlotId, {
      state: 'Hub',
      unlockedBiomes: [FIRST_BIOME_ID],
      expedition: null,
      metaProgress: DEFAULT_META_PROGRESS
    });

    this.runActive = false;
    this.selectedRunMode = DEFAULT_RUN_MODE;
    this.menu.setSelectedRunMode(this.selectedRunMode);
    this.continueSnapshot = slot.expedition;
    this.campaignState.replaceUnlockedBiomes(slot.unlockedBiomes);
    this.metaState.replace(slot.metaProgress);
    this.expeditionState.restoreFromContinue(slot.expedition);
    this.combatSandbox.configureLoadoutAvailability(slot.metaProgress);
    this.combatSandbox.resetForRun(slot.expedition);
    this.hubViewModel = this.toHubViewModel(slot.unlockedBiomes, slot.metaProgress);
    this.expeditionPrep = this.toExpeditionPrepViewModel(this.combatSandbox.getExpeditionPlan(), this.hubViewModel);
    this.menu.setContinueSnapshot(this.continueSnapshot);
    this.menu.setHub(this.hubViewModel);
    this.menu.setExpeditionPrep(this.expeditionPrep);
    this.states.transition('MainMenu');
    this.persistCurrentState();
    this.syncHubWorldWidgets();
    this.syncHubWristUi();
    this.syncSaveSlotMenu();
  }

  private syncSaveSlotMenu(): void {
    const summaries: SaveSlotSummary[] = Game.SAVE_SLOT_IDS.map((slotId) => {
      const slot = this.saves.load(slotId);
      if (!slot) {
        return {
          slotId,
          hasSave: false,
          stateLabel: 'No data',
          updatedAtLabel: 'Never'
        };
      }

      const updatedAt = new Date(slot.updatedAtIso);
      const updatedAtLabel = Number.isNaN(updatedAt.getTime()) ? slot.updatedAtIso : updatedAt.toLocaleString();
      const stateLabel = slot.expedition
        ? `${slot.state} / ${campaignBiomeLabel(slot.expedition.biomeId)}`
        : slot.state;

      return {
        slotId,
        hasSave: true,
        stateLabel,
        updatedAtLabel
      };
    });

    this.menu.setSaveSlots(summaries, this.activeSlotId);
  }

  private updateDebug(deltaSeconds: number): void {
    if (!this.perfHud) {
      return;
    }

    this.fpsAccumulator += deltaSeconds;
    this.fpsFrameCount += 1;

    if (this.fpsAccumulator >= 0.25) {
      const fps = this.fpsFrameCount / this.fpsAccumulator;
      const target = this.xrInput.isPresenting()
        ? DEFAULT_GAME_CONFIG.targets.standaloneXrFps
        : DEFAULT_GAME_CONFIG.targets.desktopFps;
      this.perfHud.render(fps, `${this.states.current} / target ${target}fps`);
      this.fpsAccumulator = 0;
      this.fpsFrameCount = 0;
    }
  }
}
