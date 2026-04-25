# Task Plan: Reforge Phase 5 Room Graph Quota & Validation

## 0. Metadata
- Task ID: reforge-phase5-room-graph-quota-validation
- Branch: current working branch
- Owner: Codex
- Last Updated: 2026-04-25

## 1. Objective
- encounter room 構成を biome ごとに 10 room へ拡張し、room graph の dead end / soft-lock を content validation で自動検証できる状態を作る。

## 2. Non-Goals
- 本タスクでは room の 3D アセット配置・VFX 実装・ナビメッシュ生成は行わない。
- 本タスクでは敵 AI ロジックや mission 解決条件そのものは変更しない。

## 3. Scope
- In scope:
  - `src/game/encounters/EncounterRuleSet.ts` の biome room 定義を 10 room 構成へ拡張
  - `scripts/validate-content.mjs` の AST ベース検証化と room graph 検証追加
  - `src/content/enemies/EnemyCatalog.ts` に spawn archetype 参照整合のための不足 ID 追加
  - README の実装範囲更新
- Out of scope:
  - room visual pass
  - traversal setpiece のランタイム演出

## 4. Milestones
| Milestone | Description | Status (Done / Blocked / Cancelled) | Notes |
| --- | --- | --- | --- |
| M1 | encounter room seed を biome ごとに 10 room 定義へ整理する | Done | graph は deterministic 生成へ移行 |
| M2 | validation を AST ベースへ更新し、room graph / archetype 参照検証を追加 | Done | dead end・soft-lock・重複ID・未知 archetype を検査 |
| M3 | typecheck/build/content validate を通して buildable state を確認 | Done | 2026-04-25 実行 |

## 5. Acceptance Criteria
- [x] すべての biome が 10〜14 room の範囲を満たす
- [x] room graph dead end / soft-lock が validation で検出可能
- [x] EncounterSpawnTables archetypeId が EnemyCatalog と整合する
- [x] typecheck/build/validate が成功する

## 6. Verification Commands
- [x] `npm run typecheck`
- [x] `npm run build`
- [x] `npm run validate:content`
- [x] `npm run check`

## 7. Known Blockers
- None

## 8. Feature Flag / Rollback Plan (if needed)
- Feature flag: 不要（データ定義と検証拡張のみ）
- Rollback:
  1. `EncounterRuleSet` を旧 room 定義へ戻す
  2. `validate-content` を旧 regex 実装へ戻す
  3. EnemyCatalog に追加した spawn archetype ID を巻き戻す

## 9. Status Updates
- 2026-04-25: biome room seed を 10 room 構成へ拡張し、graph を生成関数へ統一。
- 2026-04-25: validate-content を TypeScript AST 解析ベースへ移行し、重複 ID・room graph・spawn archetype 参照整合の自動チェックを追加。
- 2026-04-25: typecheck/build/validate/check を実行して buildable state を確認。

## 10. Next Action
- EncounterRuleSet の room tag を traversal setpiece / lore chain / secret altar の実体イベントへ接続し、各 biome の room rule variation を mission type と連動させる。

## 11. Stop State Checklist
- [x] 各マイルストーン状態を更新した
- [x] Blocked 項目の停止理由と再開条件を記載した
- [x] 次に実行すべき最短アクションを記載した
- [x] 実行済み検証と未実行理由を整理した
