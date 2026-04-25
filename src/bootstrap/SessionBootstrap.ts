import type { WebGLRenderer } from 'three';

export type SessionLifecycleState = 'idle' | 'active' | 'visible' | 'hidden';

export interface SessionLifecycleSnapshot {
  readonly state: SessionLifecycleState;
  readonly referenceSpaceReady: boolean;
  readonly statusLabel: string;
}

/**
 * WebXR session lifecycle をゲーム本体から分離し、
 * start/end/resume・visibility 変化・reference space 再取得を一元管理する。
 */
export class SessionBootstrap {
  private session: XRSession | null = null;
  private state: SessionLifecycleState = 'idle';
  private referenceSpaceReady = false;

  constructor(private readonly renderer: WebGLRenderer) {
    this.renderer.xr.addEventListener('sessionstart', this.handleSessionStart);
    this.renderer.xr.addEventListener('sessionend', this.handleSessionEnd);
  }

  dispose(): void {
    this.detachSessionListener();
    this.renderer.xr.removeEventListener('sessionstart', this.handleSessionStart);
    this.renderer.xr.removeEventListener('sessionend', this.handleSessionEnd);
    this.session = null;
    this.state = 'idle';
    this.referenceSpaceReady = false;
  }

  tick(): SessionLifecycleSnapshot {
    if (!this.session) {
      return this.snapshot('XR fallback active (flat-screen)');
    }

    if (!this.referenceSpaceReady) {
      this.ensureReferenceSpace();
    }

    const label = this.referenceSpaceReady
      ? this.state === 'hidden'
        ? 'XR session paused (hidden)'
        : 'XR session active'
      : 'XR reference space recovery in progress';

    return this.snapshot(label);
  }

  private readonly handleSessionStart = (): void => {
    this.session = this.renderer.xr.getSession();
    this.state = 'active';
    this.referenceSpaceReady = false;

    if (this.session) {
      this.session.addEventListener('visibilitychange', this.handleVisibilityChange);
      this.handleVisibilityChange();
    }
  };

  private readonly handleSessionEnd = (): void => {
    this.detachSessionListener();
    this.session = null;
    this.state = 'idle';
    this.referenceSpaceReady = false;
  };

  private readonly handleVisibilityChange = (): void => {
    const visibility = this.session?.visibilityState ?? 'visible';
    if (visibility === 'hidden') {
      this.state = 'hidden';
      return;
    }

    this.state = 'visible';
  };

  private detachSessionListener(): void {
    if (!this.session) {
      return;
    }

    this.session.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }

  private ensureReferenceSpace(): void {
    try {
      this.renderer.xr.setReferenceSpaceType('local-floor');
      this.referenceSpaceReady = true;
    } catch {
      this.referenceSpaceReady = false;
    }
  }

  private snapshot(label: string): SessionLifecycleSnapshot {
    return {
      state: this.state,
      referenceSpaceReady: this.referenceSpaceReady,
      statusLabel: label
    };
  }
}
