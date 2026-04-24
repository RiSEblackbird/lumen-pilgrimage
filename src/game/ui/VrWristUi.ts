export class VrWristUi {
  private status = 'Idle';

  setStatus(status: string): void {
    this.status = status;
  }

  getStatus(): string {
    return this.status;
  }
}
