# Reforge Phase 4: Dedicated Boss Actor Foundation

## 0. Metadata
- Task ID: reforge-phase4-dedicated-boss-actor-foundation
- Branch: work
- Owner: Codex
- Last Updated: 2026-04-25

## 1. Objective
- wave-contract 依存のボス挙動から一歩進め、biome ごとに専用プロファイルを持つ `BossActorDirector` を導入して、HP・攻撃ローテーション・phase 連動ステートを分離する。

## 2. Non-Goals
- 3D ボスモデル / アニメーション / 専用 VFX の追加。
- 完全な boss AI / navigation 実装。
- セーブスキーマの変更。

## 3. Scope
- In scope:
  - `BossActorDirector` と boss profile data の追加
  - `CombatSandboxDirector` の boss 処理を director 経由へ移管
  - boss 戦中の HUD readout（HP / attack telegraph）改善
  - 進捗計画・README の更新
- Out of scope:
  - `EncounterSpawnTables` の全面置換
  - biome 実ジオメトリへの arena mutation 適用

## 4. Milestones
| Milestone | Description | Status (Done / Blocked / Cancelled) | Notes |
| --- | --- | --- | --- |
| M1 | BossActorDirector のデータ/ロジック実装 | Done | biome profile + phase-scaled attack loop |
| M2 | CombatSandboxDirector へ統合 | Done | boss HP・攻撃解決・撃破処理を導入 |
| M3 | README/進捗更新 + 検証 | Done | typecheck/build/check 実行 |

## 5. Acceptance Criteria
- [x] boss room で専用 boss actor の HP と攻撃状態を管理できる
- [x] boss phase rule が boss actor の攻撃間隔/被ダメ計算に反映される
- [x] HUD 上で boss HP と専用 telegraph 情報が確認できる

## 6. Verification Commands
- [x] `npm run typecheck`
- [x] `npm run build`
- [x] `npm run check`

## 7. Known Blockers
- None

## 8. Feature Flag / Rollback Plan (if needed)
- Feature flag: なし（sandbox 内部実装の段階的置換）。
- Rollback steps:
  1. `CombatSandboxDirector` の boss actor 呼び出しを削除して既存 wave 依存へ戻す。
  2. `src/game/director/BossActorDirector.ts` を削除する。

## 9. Status Updates
- 2026-04-25: 計画作成。専用 boss actor 基盤を追加し、sandbox に統合。
- 2026-04-25: typecheck/build/check を実行し、README と progress を更新。

## 10. Stop State Checklist
- [x] 各マイルストーン状態を更新した
- [x] Blocked 項目の停止理由と再開条件を記載した
- [x] 次に実行すべき最短アクションを記載した
- [x] 実行済み検証と未実行理由を整理した
