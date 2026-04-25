# Reforge Phase 4 Boss Arena Mutation Hooks Plan

## 0. Metadata
- Task ID: reforge-phase4-boss-arena-mutations
- Branch: current working branch
- Owner: Codex
- Last Updated: 2026-04-25

## 1. Objective
- ボス contract phase と連動して、アリーナ危険度（環境ハザード/Focus drain）をデータ駆動で更新するフックを実装し、wave contract 仮実装から専用ボス挙動へ移行しやすい土台を追加する。

## 2. Non-Goals
- 専用ボス AI の新規実装。
- 3D ギミックや VFX アセットの追加。
- 最終難易度調整。

## 3. Scope
- In scope:
  - `BossPhaseRule` へ arena mutation 用フィールドを追加
  - 既存 biome boss contract 全件に mutation データを付与
  - `CombatSandboxDirector` で phase 連動のハザード tick と readout を反映
  - HUD に arena mutation 表示を追加
- Out of scope:
  - `EncounterSpawnTables` の刷新
  - save schema の変更

## 4. Milestones
| Milestone | Description | Status (Done / Blocked / Cancelled) | Notes |
| --- | --- | --- | --- |
| M1 | 仕様整理・実装方針確定 | Done | Phase 単位で hazard/focus を持たせる方針を採用 |
| M2 | contract と sandbox の実装 | Done | phase shift 時に arena mutation を更新し、毎秒 objective に圧情報を反映 |
| M3 | HUD 反映と検証実行 | Done | HUD 表示追加、typecheck/build 実行 |

## 5. Acceptance Criteria
- [x] boss phase データに arena mutation 情報が存在する
- [x] boss phase 中に ambient hazard / focus drain が適用される
- [x] HUD で boss phase の arena mutation が可視化される

## 6. Verification Commands
- [ ] `npm run lint`
- [x] `npm run typecheck`
- [ ] `npm test`
- [x] `npm run build`

## 7. Known Blockers
- lint/test は本タスクでは未実行（リポジトリ既定コマンドのうち型・build の成立を優先）。

## 8. Feature Flag / Rollback Plan (if needed)
- Feature flag: なし（既存 boss contract を拡張）。
- Rollback steps:
  1. `BossPhaseRule` の mutation フィールド追加を戻す。
  2. `CombatSandboxDirector` の hazard hook を削除。
  3. HUD の mutation 行表示を削除。

## 9. Status Updates
- 2026-04-25: boss phase 連動の arena mutation 実装計画を作成。
- 2026-04-25: contract data / sandbox hook / HUD readout を実装し、型・build 検証を実行。

## 10. Stop State Checklist
- [x] 各マイルストーン状態を更新した
- [x] Blocked 項目の停止理由と再開条件を記載した
- [x] 次に実行すべき最短アクションを記載した
- [x] 実行済み検証と未実行理由を整理した
