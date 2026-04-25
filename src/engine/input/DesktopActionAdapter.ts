import { EMPTY_ACTION_STATE, type ActionState, type InputAction } from './ActionMap';

const KEY_BINDINGS: Readonly<Record<string, InputAction>> = {
  KeyW: 'moveForward',
  KeyS: 'moveBackward',
  KeyA: 'moveLeft',
  KeyD: 'moveRight',
  ShiftLeft: 'dash',
  KeyR: 'ashSight',
  Space: 'primaryAttack',
  Mouse0: 'primaryAttack',
  Mouse2: 'guard',
  KeyF: 'parry',
  KeyQ: 'offhand',
  KeyE: 'interact',
  Escape: 'openMenu'
};

export class DesktopActionAdapter {
  private state: ActionState = EMPTY_ACTION_STATE;

  constructor(private readonly target: Window) {
    this.target.addEventListener('keydown', (event) => this.setKey(event.code, true));
    this.target.addEventListener('keyup', (event) => this.setKey(event.code, false));
    this.target.addEventListener('mousedown', (event) => this.setMouse(event.button, true));
    this.target.addEventListener('mouseup', (event) => this.setMouse(event.button, false));
  }

  snapshot(): ActionState {
    return this.state;
  }

  private setMouse(button: number, pressed: boolean): void {
    const code = `Mouse${button}`;
    this.setKey(code, pressed);
  }

  private setKey(code: string, pressed: boolean): void {
    const action = KEY_BINDINGS[code];
    if (!action) {
      return;
    }
    this.state = { ...this.state, [action]: pressed };
  }
}
