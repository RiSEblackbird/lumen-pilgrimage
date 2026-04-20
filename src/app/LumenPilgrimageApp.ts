import { Clock, Color, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { FlatCodexPanel } from '../ui/FlatCodexPanel';
import { VrCodexPanel } from '../ui/VrCodexPanel';
import { RitualDomain, RitualState } from './RitualState';
import { Sanctuary } from '../world/Sanctuary';
import { GlyphSystem } from '../world/GlyphSystem';
import { ProbeVolumeManager } from '../world/ProbeVolumeManager';
import { XRInputRig, XRSelectEvent } from './XRInputRig';
import { DreamExporter } from '../export/DreamExporter';
import { FPSInputRig } from './FPSInputRig';

export class LumenPilgrimageApp {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 64);
  private readonly clock = new Clock();
  private readonly ritual = new RitualState();

  private readonly sanctuary: Sanctuary;
  private readonly glyphs = new GlyphSystem();
  private readonly probeVolumes: ProbeVolumeManager;
  private readonly inputRig: XRInputRig;
  private readonly fpsInput: FPSInputRig;
  private readonly flatCodex: FlatCodexPanel;
  private readonly vrCodex = new VrCodexPanel();
  private readonly exporter = new DreamExporter();

  private spiritVision = false;
  private activeMode: 'vr' | 'fps' = 'fps';
  private elapsedSeconds = 0;

  constructor(container: HTMLElement) {
    this.scene.background = new Color(0x05060d);
    this.camera.position.set(0, 1.65, 3.4);

    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.xr.enabled = true;
    this.renderer.xr.setReferenceSpaceType('local-floor');
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.setFoveation(1);

    container.appendChild(this.renderer.domElement);
    container.appendChild(VRButton.createButton(this.renderer));
    this.flatCodex = new FlatCodexPanel(container);

    this.sanctuary = new Sanctuary(this.scene);
    this.scene.add(this.glyphs.group, this.vrCodex.group);

    this.probeVolumes = new ProbeVolumeManager(this.renderer, this.scene);
    this.inputRig = new XRInputRig(
      this.renderer,
      this.glyphs,
      (event) => this.onSelectGlyph(event),
      (roll) => this.sanctuary.kelvinRig.adjustByRoll(roll)
    );
    this.scene.add(this.inputRig.group);
    this.fpsInput = new FPSInputRig(this.camera, this.renderer, this.glyphs, (event) => {
      this.onSelectGlyph({ domain: event.domain, intensified: event.intensified, source: 'right' });
    }, (roll) => this.sanctuary.kelvinRig.adjustByRoll(roll));

    this.applyDomain(this.ritual.currentDomain);
    this.syncMode();

    this.renderer.setAnimationLoop(() => this.update());
    window.addEventListener('resize', () => this.onResize());
    window.addEventListener('keydown', (event) => this.onKeyDown(event));
    this.renderer.xr.addEventListener('sessionstart', () => this.syncMode());
    this.renderer.xr.addEventListener('sessionend', () => this.syncMode());
  }

  private onSelectGlyph(event: XRSelectEvent): void {
    const domain = this.ritual.activate(event.domain);
    if (event.intensified && domain !== 'dawn-altar' && this.ritual.completedDomains >= 3) {
      this.ritual.activate('dawn-altar');
      this.applyDomain('dawn-altar');
      return;
    }

    this.applyDomain(domain);
  }

  private applyDomain(domain: RitualDomain): void {
    this.sanctuary.applyDomain(domain);
    this.probeVolumes.bakeForDomain(domain);
    this.glyphs.setActivated(domain);
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (event.key.toLowerCase() === 'v') {
      this.spiritVision = !this.spiritVision;
      this.probeVolumes.setSpiritVision(this.spiritVision);
      return;
    }

    if (event.key.toLowerCase() === 'e') {
      const data = this.exporter.export({
        domain: this.ritual.currentDomain,
        kelvin: this.sanctuary.kelvinRig.currentKelvin,
        spiritVision: this.spiritVision,
        inputMode: this.activeMode,
        timestamp: new Date().toISOString()
      });
      console.info('[DreamExporter]', data);
    }
  }

  private onResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private update(): void {
    const delta = this.clock.getDelta();
    this.elapsedSeconds += delta;
    this.inputRig.update();
    this.fpsInput.update(delta);
    this.sanctuary.tick(this.elapsedSeconds);
    this.renderer.render(this.scene, this.camera);
  }

  private syncMode(): void {
    const nextMode = this.renderer.xr.isPresenting ? 'vr' : 'fps';
    this.activeMode = nextMode;
    this.flatCodex.setMode(nextMode);
    this.fpsInput.setActive(nextMode === 'fps');
  }
}
