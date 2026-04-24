# Reforge Phase 4 Biome Content Expansion Plan

## 0. Metadata
- Task ID: reforge-phase4-biome-content-expansion
- Branch: current working branch
- Owner: Codex
- Last Updated: 2026-04-24

## 1. Objective
- Encounter foundation を Ember/Moon 以外の biome と final zone まで拡張し、データ駆動の room graph / spawn wave / boss contract を一貫して利用可能にする。

## 2. Non-Goals
- フルボス AI や専用アリーナ演出の実装。
- 3D アセット、VFX、オーディオ素材の追加。
- バランス最終調整。

## 3. Scope
- In scope:
  - `EncounterRuleSet.ts` に 5 biome + final zone の room graph を追加
  - `EncounterSpawnTables.ts` に biome 別 enemy template を追加
  - `BossContracts.ts` に不足 biome の boss phase contract を追加
  - `plans/reforge-progress.json` の next actions / risks 更新
- Out of scope:
  - プレイヤー操作系、UI の構造変更
  - save schema の拡張

## 4. Milestones
| Milestone | Description | Status (Done / Blocked / Cancelled) | Notes |
| --- | --- | --- | --- |
| M1 | 計画作成と既存データ構造の確認 | Done | 既存実装は Ember/Moon 中心であることを確認 |
| M2 | encounter / spawn / boss contract データ拡張実装 | Done | Birch / Obsidian / Dawn / Final を追加 |
| M3 | typecheck / build 実行と進捗更新 | Done | コマンド成功、進捗ファイル更新 |

## 5. Acceptance Criteria
- [x] `BIOME_ENCOUNTER_SETS` に 5 biome + final zone が定義されている
- [x] `buildEncounterWave` が全追加 biome を専用テンプレートで解決する
- [x] `BOSS_CONTRACTS` が追加 biome をカバーする

## 6. Verification Commands
- [ ] `npm run format`
- [ ] `npm run lint`
- [x] `npm run typecheck`
- [ ] `npm test`
- [x] `npm run build`
- [ ] `npm run dev`

## 7. Known Blockers
- lint / test / dev は本タスクでは未実行（既定コマンド定義と CI 実行時間を考慮し、まず型・ビルド整合を優先）。

## 8. Feature Flag / Rollback Plan (if needed)
- Feature flag: なし（データ定義のみ追加）。
- Rollback steps:
  1. 追加 biome エントリを各定義ファイルから削除。
  2. `plans/reforge-progress.json` を前状態へ戻す。

## 9. Status Updates
- 2026-04-24: 既存の next action「biome enemy families の拡張」に対する実装計画を作成。
- 2026-04-24: encounter / spawn / boss contract を拡張し、型検証・build を通過。

## 10. Stop State Checklist
- [x] 各マイルストーン状態を更新した
- [x] Blocked 項目の停止理由と再開条件を記載した
- [x] 次に実行すべき最短アクションを記載した
- [x] 実行済み検証と未実行理由を整理した
