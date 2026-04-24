import type { GameState } from './GameState';

const TRANSITIONS: Readonly<Record<GameState, readonly GameState[]>> = {
  Boot: ['MainMenu'],
  MainMenu: ['Hub', 'Credits', 'BossRush', 'EndlessCollapse'],
  Hub: ['ExpeditionPrep', 'MetaUpgrade', 'MainMenu'],
  ExpeditionPrep: ['InExpedition', 'Hub'],
  InExpedition: ['MiniBoss', 'Boss', 'Extraction', 'GameOver'],
  MiniBoss: ['InExpedition', 'Extraction', 'GameOver'],
  Boss: ['Extraction', 'GameOver'],
  Extraction: ['Hub', 'MetaUpgrade'],
  MetaUpgrade: ['Hub', 'MainMenu'],
  GameOver: ['Hub', 'MainMenu'],
  Credits: ['MainMenu'],
  BossRush: ['Hub', 'MainMenu', 'GameOver'],
  EndlessCollapse: ['Hub', 'MainMenu', 'GameOver']
};

export class GameStateMachine {
  private state: GameState = 'Boot';

  get current(): GameState {
    return this.state;
  }

  canTransition(next: GameState): boolean {
    return TRANSITIONS[this.state].includes(next);
  }

  transition(next: GameState): boolean {
    if (!this.canTransition(next)) {
      return false;
    }
    this.state = next;
    return true;
  }
}
