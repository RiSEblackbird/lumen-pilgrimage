import { Game } from '../core/Game';

export class AppBootstrap {
  constructor(private readonly mount: HTMLElement) {}

  start(): Game {
    return new Game(this.mount);
  }
}
