import { RELIC_DEFS, type RelicDef } from '../items/RelicDefs';

export interface RewardChoiceState {
  readonly options: readonly RelicDef[];
  readonly selectedIndex: number;
}

export class RewardDirector {
  private relicCursor = 0;
  private readonly unlockedRelics = new Set<string>();

  rollChoices(choiceCount: number): RewardChoiceState {
    const options: RelicDef[] = [];
    let attempts = 0;

    while (options.length < choiceCount && attempts < RELIC_DEFS.length * 2) {
      const relic = RELIC_DEFS[this.relicCursor % RELIC_DEFS.length];
      this.relicCursor += 1;
      attempts += 1;

      if (this.unlockedRelics.has(relic.id)) {
        continue;
      }

      options.push(relic);
    }

    if (options.length === 0) {
      options.push(RELIC_DEFS[this.relicCursor % RELIC_DEFS.length]);
      this.relicCursor += 1;
    }

    return {
      options,
      selectedIndex: 0
    };
  }

  claimChoice(state: RewardChoiceState): RelicDef {
    const selected = state.options[state.selectedIndex] ?? state.options[0];
    this.unlockedRelics.add(selected.id);
    return selected;
  }

  getEquippedRelics(): readonly string[] {
    return [...this.unlockedRelics];
  }
}
