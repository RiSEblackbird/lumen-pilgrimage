import { PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { DEFAULT_GAME_CONFIG } from './GameConfig';
import { GameLoop } from './GameLoop';
import { DesktopActionAdapter } from '../engine/input/DesktopActionAdapter';
import { XRActionAdapter } from '../engine/input/XRActionAdapter';
import { SettingsStore } from '../engine/save/SettingsStore';
import { SaveManager } from '../engine/save/SaveManager';
import { PerfHud } from '../engine/debug/PerfHud';
import { GameStateMachine } from '../game/state/GameStateMachine';
import { HudManager } from '../game/ui/HudManager';
import { MenuManager, type ContinueSnapshot, type MenuCommand } from '../game/ui/MenuManager';
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

  private fpsAccumulator = 0;
  private fpsFrameCount = 0;
  private saveAccumulator = 0;
  private continueSnapshot: ContinueSnapshot | null = null;
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

    this.settings.save(this.settings.load());
    const slot = this.saves.loadOrCreate(0, {
      state: 'Hub',
      unlockedBiomes: ['Ember Ossuary'],
      expedition: null
    });
    this.continueSnapshot = slot.expedition;
    this.combatSandbox = new CombatSandboxDirector(this.continueSnapshot);
    this.menu.setContinueSnapshot(this.continueSnapshot);

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
          objective: 'Main Menu: Continue または New Game を選択',
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
          this.menu.setContinueSnapshot(this.continueSnapshot);
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

    this.handleMetaMenu(command);
  }

  private handleMetaMenu(command: Exclude<MenuCommand, 'continue' | 'new-game'>): void {
    if (command === 'open-credits' && this.states.canTransition('Credits')) {
      this.states.transition('Credits');
      return;
    }

    if (command === 'open-settings') {
      const current = this.settings.load();
      this.settings.save(current);
    }
  }

  private startExpeditionFromContinue(): void {
    if (!this.continueSnapshot) {
      return;
    }

    this.combatSandbox.resetForRun(this.continueSnapshot);
    this.enterRunStates();
  }

  private startNewGame(): void {
    const slot = this.saves.resetSlot(0, {
      state: 'Hub',
      unlockedBiomes: ['Ember Ossuary'],
      expedition: null
    });
    this.continueSnapshot = slot.expedition;
    this.menu.setContinueSnapshot(this.continueSnapshot);
    this.combatSandbox.resetForRun(null);
    this.enterRunStates();
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
