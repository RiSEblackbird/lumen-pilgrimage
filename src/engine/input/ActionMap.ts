export type InputAction =
  | 'moveForward'
  | 'moveBackward'
  | 'moveLeft'
  | 'moveRight'
  | 'dash'
  | 'ashSight'
  | 'primaryAttack'
  | 'guard'
  | 'parry'
  | 'offhand'
  | 'interact'
  | 'openMenu';

export type ActionState = Readonly<Record<InputAction, boolean>>;

export const EMPTY_ACTION_STATE: ActionState = {
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
