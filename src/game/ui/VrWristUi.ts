export class VrWristUi {
  private status = 'Idle';
  private prompt = 'Aim terminal then press Interact';
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

  setPrompt(prompt: string): void {
    this.prompt = prompt;
  }

  applySettings(comfortLabel: string, masterVolume: number): void {
    this.comfortLabel = comfortLabel;
    this.volumePercent = Math.round(masterVolume * 100);
  }

  getStatus(): string {
    return `${this.status} | ${this.prompt} | ${this.hubTerminalLabel} | ${this.prepSummary} | ${this.comfortLabel} | Mix ${this.volumePercent}%`;
  }
}
