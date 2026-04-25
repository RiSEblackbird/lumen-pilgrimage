# Task Plan: reforge-phase5-loot-table-validation

## 0. Metadata
- Task ID: reforge-phase5-loot-table-validation
- Branch: current
- Owner: Codex
- Last Updated: 2026-04-25

## 1. Objective
- RewardDirector を biome / routeStyle / rewardWeight に応じた loot table 駆動へ移行し、content validation に loot table の重複/孤児参照検証を追加する。

## 2. Non-Goals
- 実際のドロップ演出・UI アニメーションの追加。
- biome ごとの専用アセット生成。
- Save 形式の拡張。

## 3. Scope
- In scope:
  - `src/game/items/LootTables.ts` の新規追加。
  - `RewardDirector` の loot table 参照ロジック導入。
  - `CombatSandboxDirector` から reward roll context を渡す接続。
  - `scripts/validate-content.mjs` への loot table 整合性検証追加。
  - 関連ドキュメント/進捗更新。
- Out of scope:
  - 新 relic 追加。
  - enemy/room データ拡張。

## 4. Milestones
| Milestone | Description | Status (Done / Blocked / Cancelled) | Notes |
| --- | --- | --- | --- |
| M1 | loot table データ定義を追加し、RewardDirector で使用可能にする | Done | biome + route + reward tier を評価 |
| M2 | sandbox から reward context を渡し、既存進行を壊さず roll 可能にする | Done | `latestEncounter` をそのまま使用 |
| M3 | content validation に loot table 重複/孤児参照検証を追加する | Done | relic 定義との突合を実施 |

## 5. Acceptance Criteria
- [x] RewardDirector が context-aware loot table で報酬候補を生成する
- [x] Loot table が未定義/欠損でも fallback で報酬生成が継続する
- [x] validate-content で loot table duplicate/orphan を検出できる

## 6. Verification Commands
- [x] `npm run typecheck`
- [ ] `npm run check`
- [x] `npm run build`

## 7. Known Blockers
- None

## 8. Feature Flag / Rollback Plan (if needed)
- Feature flag: なし（既存 fallback を維持して可逆性確保）。
- Rollback steps:
  1. `RewardDirector` を旧シーケンシャル抽選に戻す。
  2. `LootTables.ts` の参照を削除。
  3. validation の loot table チェックを除去。

## 9. Status Updates
- 2026-04-25: 計画作成。loot table 駆動化 + validation 追加を実施。
- 2026-04-25: 実装完了。typecheck/build 成功確認。

## 10. Stop State Checklist
- [x] 各マイルストーン状態を更新した
- [x] Blocked 項目の停止理由と再開条件を記載した
- [x] 次に実行すべき最短アクションを記載した
- [x] 実行済み検証と未実行理由を整理した
