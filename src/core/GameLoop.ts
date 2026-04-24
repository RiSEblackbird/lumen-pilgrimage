import { Clock } from 'three';

export type UpdateFn = (deltaSeconds: number, elapsedSeconds: number) => void;

export class GameLoop {
  private readonly clock = new Clock();
  private elapsed = 0;

  tick(update: UpdateFn): void {
    const delta = this.clock.getDelta();
    this.elapsed += delta;
    update(delta, this.elapsed);
  }
}
