import { PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { DEFAULT_GAME_CONFIG } from './GameConfig';
import { GameLoop } from './GameLoop';
import { DesktopActionAdapter } from '../engine/input/DesktopActionAdapter';
import { XRActionAdapter } from '../engine/input/XRActionAdapter';
import { SettingsStore } from '../engine/save/SettingsStore';
import { DEFAULT_META_PROGRESS, SaveManager, type MetaProgress } from '../engine/save/SaveManager';
import { PerfHud } from '../engine/debug/PerfHud';
import { GameStateMachine } from '../game/state/GameStateMachine';
import { HudManager } from '../game/ui/HudManager';
import { MenuManager, type ContinueSnapshot, type HubViewModel, type MenuCommand, type SettingsViewModel } from '../game/ui/MenuManager';
import { VrWristUi } from '../game/ui/VrWristUi';
import { CombatSandboxDirector } from '../game/sandbox/CombatSandboxDirector';
import { PilgrimsBelfryScene } from '../world/hub/PilgrimsBelfryScene';

export class Game {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
  private readonly loop = new GameLoop();
  private readonly states = new GameStateMachine();
  private readonly desktopInput: DesktopActionAdapter;
  private readonly xrInput: XRActionAdapter;
  private readonly settings = new SettingsStore();
  private readonly saves = new SaveManager();
  private readonly perfHud: PerfHud;
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
  private runActive = false;

  constructor(container: HTMLElement) {
    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.enabled = true;
    this.renderer.xr.setReferenceSpaceType('local-floor');

    this.camera.position.copy(new Vector3(0, 1.65, 3.5));

    this.desktopInput = new DesktopActionAdapter(window);
    this.xrInput = new XRActionAdapter(this.renderer);
    this.perfHud = new PerfHud(container);
    this.menu = new MenuManager(container);
    this.hud = new HudManager(container);
    this.hubScene = new PilgrimsBelfryScene(this.scene);

    this.settingsViewModel = this.settings.load();
    this.settings.save(this.settingsViewModel);
    const slot = this.saves.loadOrCreate(0, {
      state: 'Hub',
      unlockedBiomes: ['Ember Ossuary'],
      expedition: null,
      metaProgress: DEFAULT_META_PROGRESS
    });
    this.continueSnapshot = slot.expedition;
    this.hubViewModel = this.toHubViewModel(slot.unlockedBiomes, slot.metaProgress);

    this.combatSandbox = new CombatSandboxDirector(this.continueSnapshot);
    this.menu.setContinueSnapshot(this.continueSnapshot);
    this.menu.setSettings(this.settingsViewModel);
    this.menu.setHub(this.hubViewModel);

    container.appendChild(this.renderer.domElement);
    container.appendChild(VRButton.createButton(this.renderer));

    this.states.transition('MainMenu');
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
      this.renderer.render(this.scene, this.camera);
      this.updateDebug(delta);
      this.handleMenuCommands();

      if (!this.runActive) {
        this.hud.render({
          health: 100,
          guard: 100,
          focus: 100,
          overburn: 0,
          objective: 'Main Menu/HUB で導線を選択',
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
          bossLabel: 'No Warden contact'
        });
        this.menu.setState(this.states.current);
        return;
      }

      const actions = this.desktopInput.snapshot();
      const sandbox = this.combatSandbox.update(actions, delta);
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
        const updated = this.saves.updateExpedition(0, {
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
          this.hubViewModel = this.toHubViewModel(updated.unlockedBiomes, updated.metaProgress);
          this.menu.setContinueSnapshot(this.continueSnapshot);
          this.menu.setHub(this.hubViewModel);
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

    this.handleMetaMenu(command);
  }

  private handleMetaMenu(command: Exclude<MenuCommand, 'continue' | 'new-game' | 'launch-expedition'>): void {
    if (command === 'enter-hub' && this.states.canTransition('Hub')) {
      this.states.transition('Hub');
      return;
    }

    if (command === 'open-meta-upgrade' && this.states.current === 'Hub' && this.states.canTransition('MetaUpgrade')) {
      this.states.transition('MetaUpgrade');
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
      return;
    }

    if (command === 'open-credits' && this.states.canTransition('Credits')) {
      this.states.transition('Credits');
      return;
    }

    if (command === 'open-settings' && this.states.canTransition('Settings')) {
      this.states.transition('Settings');
      return;
    }

    if (command === 'toggle-snap-turn') {
      this.updateSettings({ snapTurn: !this.settingsViewModel.snapTurn });
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

    if (command === 'master-volume-down') {
      this.adjustMasterVolume(-0.05);
      return;
    }

    if (command === 'master-volume-up') {
      this.adjustMasterVolume(0.05);
      return;
    }

    if (command === 'back-main-menu' && this.states.canTransition('MainMenu')) {
      this.states.transition('MainMenu');
    }
  }

  private updateSettings(partial: Partial<SettingsViewModel>): void {
    this.settingsViewModel = {
      ...this.settingsViewModel,
      ...partial
    };
    this.settings.save(this.settingsViewModel);
    this.menu.setSettings(this.settingsViewModel);
  }

  private adjustMasterVolume(delta: number): void {
    const nextVolume = Math.max(0, Math.min(1, this.settingsViewModel.masterVolume + delta));
    this.updateSettings({ masterVolume: nextVolume });
  }

  private startExpeditionFromContinue(): void {
    if (!this.continueSnapshot) {
      return;
    }

    this.combatSandbox.resetForRun(this.continueSnapshot);
    this.enterRunStates();
  }

  private startExpeditionFromHub(): void {
    this.combatSandbox.resetForRun(this.continueSnapshot);
    this.runActive = true;
    if (this.states.current === 'Hub' && this.states.canTransition('ExpeditionPrep')) {
      this.states.transition('ExpeditionPrep');
    }
    if (this.states.current === 'ExpeditionPrep' && this.states.canTransition('InExpedition')) {
      this.states.transition('InExpedition');
    }
  }

  private startNewGame(): void {
    const slot = this.saves.resetSlot(0, {
      state: 'Hub',
      unlockedBiomes: ['Ember Ossuary'],
      expedition: null,
      metaProgress: DEFAULT_META_PROGRESS
    });
    this.continueSnapshot = slot.expedition;
    this.hubViewModel = this.toHubViewModel(slot.unlockedBiomes, slot.metaProgress);
    this.menu.setContinueSnapshot(this.continueSnapshot);
    this.menu.setHub(this.hubViewModel);
    this.combatSandbox.resetForRun(null);
    this.runActive = false;
    if (this.states.canTransition('Hub')) {
      this.states.transition('Hub');
    }
  }

  private tryUnlockAstralPike(): void {
    const updated = this.saves.updateMetaProgress(0, (meta) => {
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
    const updated = this.saves.updateMetaProgress(0, (meta) => {
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
    this.hubViewModel = this.toHubViewModel(slot.unlockedBiomes, slot.metaProgress);
    this.menu.setHub(this.hubViewModel);
  }

  private toHubViewModel(unlockedBiomes: readonly string[], meta: MetaProgress): HubViewModel {
    return {
      unlockedBiomes,
      lumenAsh: Math.max(0, Math.floor(meta.lumenAsh)),
      choirThread: Math.max(0, Math.floor(meta.choirThread)),
      saintGlass: Math.max(0, Math.floor(meta.saintGlass)),
      echoScript: Math.max(0, Math.floor(meta.echoScript)),
      unlockedWeapons: meta.unlockedWeapons,
      unlockedOffhands: meta.unlockedOffhands,
      unlockedSigils: meta.unlockedSigils
    };
  }

  private enterRunStates(): void {
    this.runActive = true;
    if (this.states.current === 'MainMenu') {
      this.states.transition('Hub');
    }
    if (this.states.current === 'Hub') {
      this.states.transition('ExpeditionPrep');
    }
    if (this.states.current === 'ExpeditionPrep') {
      this.states.transition('InExpedition');
    }
  }

  private updateDebug(deltaSeconds: number): void {
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
