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
import { MenuManager } from '../game/ui/MenuManager';
import { VrWristUi } from '../game/ui/VrWristUi';
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

  private fpsAccumulator = 0;
  private fpsFrameCount = 0;

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
    this.saves.save({
      slotId: 0,
      state: 'Hub',
      unlockedBiomes: ['Ember Ossuary'],
      updatedAtIso: new Date().toISOString()
    });

    container.appendChild(this.renderer.domElement);
    container.appendChild(VRButton.createButton(this.renderer));

    this.states.transition('MainMenu');
    this.states.transition('Hub');
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
      const actions = this.desktopInput.snapshot();
      const objective = this.xrInput.isPresenting()
        ? `VR Wrist: ${this.vrUi.getStatus()}`
        : actions.interact
          ? 'Interact with Belfry console'
          : 'Choose contract from Pilgrim’s Belfry';

      this.hud.render({ health: 100, guard: 60, focus: 75, overburn: (elapsed * 10) % 100, objective });
      this.menu.setState(this.states.current);
    });
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
