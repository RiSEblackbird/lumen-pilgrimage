# Task Plan: reforge-phase5-deterministic-seed-replay

## 0. Metadata
- Task ID: reforge-phase5-deterministic-seed-replay
- Branch: current
- Owner: Codex
- Last Updated: 2026-04-25

## 1. Objective
- Expedition の room 遷移選択を再現可能にするため、run seed を保存・復元し、EncounterDirector の遷移選択を deterministic な PRNG 駆動へ置き換える。

## 2. Non-Goals
- procedural room 生成アルゴリズムの刷新。
- seed を UI で手入力する機能追加。
- 既存 mission/reward/boss tuning の調整。

## 3. Scope
- In scope:
  - deterministic PRNG utility の追加
  - EncounterDirector の pickIndex を seed 駆動へ変更
  - continue/save snapshot に runSeed を追加
  - run 開始時 seed 生成と continue 復元の接続
- Out of scope:
  - 既存 save データの強制 migration
  - 外部 seed sharing 機能

## 4. Milestones
| Milestone | Description | Status (Done / Blocked / Cancelled) | Notes |
| --- | --- | --- | --- |
| M1 | 計画作成と影響範囲確認 | Done | 本ファイル作成 |
| M2 | seed 駆動の実装（Encounter + snapshot） | Done | PRNG + Save 反映 |
| M3 | 検証とドキュメント更新 | Done | npm run check 実行 |

## 5. Acceptance Criteria
- [x] Encounter の room 分岐選択が同一 runSeed で再現される。
- [x] continue/save に runSeed が保存され、復帰時に引き継がれる。
- [x] 型チェック・build・content/release validation が通る。

## 6. Verification Commands
- [x] `npm run typecheck`
- [x] `npm run build`
- [x] `npm run validate:content`
- [x] `npm run validate:release`
- [x] `npm run check`

## 7. Known Blockers
- None.

## 8. Feature Flag / Rollback Plan (if needed)
- Feature flag: なし（既存 run 互換として runSeed 未保存時は自動 seed 生成）。
- Rollback steps:
  1. EncounterDirector の PRNG 変更を revert。
  2. Save/Continue の runSeed フィールド追加を revert。

## 9. Status Updates
- 2026-04-25: 計画作成。seed 駆動遷移と save 反映を実装。
- 2026-04-25: `npm run check` 実行完了（typecheck/build/content/release validation pass）。

## 10. Stop State Checklist
- [x] 各マイルストーン状態を更新した
- [x] Blocked 項目の停止理由と再開条件を記載した
- [x] 次に実行すべき最短アクションを記載した
- [x] 実行済み検証と未実行理由を整理した
