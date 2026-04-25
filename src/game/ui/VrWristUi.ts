export class VrWristUi {
  private status = 'Idle';
  private comfortLabel = 'SnapTurn / Standing';
  private volumePercent = 80;
  private hubTerminalLabel = 'Expedition Terminal';
  private prepSummary = 'No loadout selected';

  setStatus(status: string): void {
    this.status = status;
  }

  setHubTerminalLabel(label: string): void {
    this.hubTerminalLabel = label;
  }

  setPrepSummary(summary: string): void {
    this.prepSummary = summary;
  }

  applySettings(comfortLabel: string, masterVolume: number): void {
    this.comfortLabel = comfortLabel;
    this.volumePercent = Math.round(masterVolume * 100);
  }

  getStatus(): string {
    return `${this.status} | ${this.hubTerminalLabel} | ${this.prepSummary} | ${this.comfortLabel} | Mix ${this.volumePercent}%`;
  }
}
