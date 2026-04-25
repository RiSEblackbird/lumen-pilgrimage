# Task Plan: Reforge Phase 5 Enemy Catalog / Contract Wiring

## 0. Metadata
- Task ID: reforge-phase5-enemy-catalog-contract-wiring
- Branch: current working branch
- Owner: Codex
- Last Updated: 2026-04-25

## 1. Objective
- EnemyCatalog を EncounterSpawnTables / BossContracts へ接続し、敵名・ボス参照の重複定義を削減する。
- content validation で BossContracts と EnemyCatalog の整合（ID と biome 割り当て）を機械検証できるようにする。

## 2. Non-Goals
- 敵 AI、アニメーション、当たり判定、実ボス挙動の追加。
- encounter 進行ロジックや難易度式の再調整。

## 3. Scope
- In scope:
  - `src/content/enemies/EnemyCatalog.ts` に lookup helper を追加
  - `src/game/encounters/EncounterSpawnTables.ts` の敵ラベルを EnemyCatalog 由来に変更
  - `src/game/encounters/BossContracts.ts` に `bossEnemyId` を導入し `bossName` を EnemyCatalog 参照へ変更
  - `scripts/validate-content.mjs` に BossContracts × EnemyCatalog の整合検証を追加
- Out of scope:
  - EncounterDirector への敵カテゴリ別スポーンルール拡張
  - BossActor の挙動調整

## 4. Milestones
| Milestone | Description | Status (Done / Blocked / Cancelled) | Notes |
| --- | --- | --- | --- |
| M1 | EnemyCatalog に参照 helper を追加する | Done | `getEnemyCatalogEntry`, `getEnemyDisplayName` を追加 |
| M2 | Encounter/Boss 定義を EnemyCatalog 参照に統一する | Done | `EncounterSpawnTables` と `BossContracts` を更新 |
| M3 | content validation へ BossContracts 整合チェックを追加する | Done | `bossEnemyId` と biome 対応を検証 |
| M4 | typecheck/build/content validation を実行し buildable state を確認する | Done | 2026-04-25 実行 |

## 5. Acceptance Criteria
- [x] Encounter の敵ラベル文字列が EnemyCatalog と重複管理されない。
- [x] BossContracts が `bossEnemyId` で boss catalog に紐づく。
- [x] validate-content が BossContracts の未知 ID / biome 不整合を検出する。
- [x] typecheck/build/content validation が成功する。

## 6. Verification Commands
- [x] `npm run typecheck`
- [x] `npm run build`
- [x] `npm run validate:content`

## 7. Known Blockers
- None

## 8. Feature Flag / Rollback Plan (if needed)
- Feature flag: 不要（データ参照統合のみ）
- Rollback:
  1. BossContracts の `bossEnemyId` 追加を戻す
  2. EncounterSpawnTables の label を固定文字列へ戻す
  3. validate-content の BossContracts 整合ブロックを削除

## 9. Status Updates
- 2026-04-25: EnemyCatalog lookup helper を追加し、Encounter/Boss 定義を参照統一。validate-content に boss contract 整合チェックを実装し、主要検証コマンドを実行。

## 10. Next Action
- EnemyCatalog と EncounterSpawnTables をさらに接続し、biome ごとの spawn pool 構築を catalog 側定義から生成できるようにする。

## 11. Stop State Checklist
- [x] 各マイルストーン状態を更新した
- [x] Blocked 項目の停止理由と再開条件を記載した
- [x] 次に実行すべき最短アクションを記載した
- [x] 実行済み検証と未実行理由を整理した
