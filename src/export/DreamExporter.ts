import { RitualDomain } from '../app/RitualState';

export interface ExportState {
  readonly domain: RitualDomain;
  readonly kelvin: number;
  readonly spiritVision: boolean;
  readonly inputMode: 'vr' | 'fps';
  readonly timestamp: string;
}

export class DreamExporter {
  export(state: ExportState): string {
    return JSON.stringify(state, null, 2);
  }
}
