import { LOOT_TABLES, type LootEntry, type RewardTier } from '../items/LootTables';
import { RELIC_DEFS, type RelicDef } from '../items/RelicDefs';
import type { RouteStyle, RoomTag } from '../encounters/EncounterRuleSet';

export interface RewardRollContext {
  readonly biomeId: string;
  readonly routeStyle: RouteStyle;
  readonly rewardWeight: number;
  readonly roomTags: readonly RoomTag[];
}

export interface RewardChoiceState {
  readonly options: readonly RelicDef[];
  readonly selectedIndex: number;
}

const RELIC_BY_ID = new Map(RELIC_DEFS.map((relic) => [relic.id, relic]));

export class RewardDirector {
  private relicCursor = 0;
  private readonly unlockedRelics = new Set<string>();

  setEquippedRelics(relicIds: readonly string[]): void {
    this.unlockedRelics.clear();
    for (const relicId of relicIds) {
      this.unlockedRelics.add(relicId);
    }
  }

  rollChoices(choiceCount: number, context?: RewardRollContext): RewardChoiceState {
    const options: RelicDef[] = [];
    const maxAttempts = Math.max(RELIC_DEFS.length * 2, choiceCount * 4);
    let attempts = 0;

    while (options.length < choiceCount && attempts < maxAttempts) {
      attempts += 1;
      const relic = this.pickRelic(context);

      if (!relic) {
        break;
      }

      if (this.unlockedRelics.has(relic.id) || options.some((option) => option.id === relic.id)) {
        continue;
      }

      options.push(relic);
    }

    if (options.length === 0) {
      const fallback = RELIC_DEFS[this.relicCursor % RELIC_DEFS.length];
      options.push(fallback);
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

  private pickRelic(context?: RewardRollContext): RelicDef | null {
    const tableEntries = this.resolveTableEntries(context);
    const weighted = this.pickWeightedEntry(tableEntries);
    if (weighted) {
      return RELIC_BY_ID.get(weighted.relicId) ?? null;
    }

    return RELIC_DEFS[this.relicCursor % RELIC_DEFS.length] ?? null;
  }

  private resolveTableEntries(context?: RewardRollContext): readonly LootEntry[] {
    if (!context) {
      return LOOT_TABLES[0]?.entries ?? [];
    }

    const tier = this.resolveTier(context);
    const table = LOOT_TABLES.find(
      (candidate) =>
        (candidate.biomeId === context.biomeId || candidate.biomeId === 'any')
        && candidate.routeStyles.includes(context.routeStyle)
        && candidate.rewardTier === tier
    );

    if (table?.entries.length) {
      return table.entries;
    }

    const fallback = LOOT_TABLES.find(
      (candidate) => candidate.biomeId === 'any' && candidate.rewardTier === tier
    );
    return fallback?.entries ?? [];
  }

  private resolveTier(context: RewardRollContext): RewardTier {
    if (context.roomTags.includes('boss-approach') || context.rewardWeight >= 1.55) {
      return 'mythic';
    }

    if (context.routeStyle === 'risk' || context.routeStyle === 'secret' || context.rewardWeight >= 1.25) {
      return 'elevated';
    }

    return 'standard';
  }

  private pickWeightedEntry(entries: readonly LootEntry[]): LootEntry | null {
    if (entries.length === 0) {
      return null;
    }

    const totalWeight = entries.reduce((sum, entry) => sum + Math.max(1, entry.weight), 0);
    let cursor = this.relicCursor % totalWeight;
    this.relicCursor += 1;

    for (const entry of entries) {
      cursor -= Math.max(1, entry.weight);
      if (cursor < 0) {
        return entry;
      }
    }

    return entries[entries.length - 1] ?? null;
  }
}
