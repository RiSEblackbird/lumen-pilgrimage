export class VrWristUi {
  private status = 'Idle';
  private comfortLabel = 'SnapTurn / Standing';
  private volumePercent = 80;

  setStatus(status: string): void {
    this.status = status;
  }

  applySettings(comfortLabel: string, masterVolume: number): void {
    this.comfortLabel = comfortLabel;
    this.volumePercent = Math.round(masterVolume * 100);
  }

  getStatus(): string {
    return `${this.status} | ${this.comfortLabel} | Mix ${this.volumePercent}%`;
  }
}
