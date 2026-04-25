# Task Plan: reforge-phase5-biome-id-normalization

## 0. Metadata
- Task ID: reforge-phase5-biome-id-normalization
- Branch: current
- Owner: codex agent
- Last Updated: 2026-04-25

## 1. Objective
- campaign/hub/save で混在している biome 表示名と biome ID を統一し、Expedition Prep の選択整合と continue 表示を安定化する。

## 2. Non-Goals
- biome の新規追加や encounter graph 拡張。
- boss AI や戦闘挙動の変更。

## 3. Scope
- In scope:
  - biome ID/表示名マッピングの共通定義を追加
  - `CampaignState` を biome ID ベースに移行
  - `SaveManager` 読み込み時に legacy 表示名を正規化
  - `MenuManager` 表示を人間可読ラベルへ変換
  - `Game` の新規 save 初期 biome を ID へ統一
- Out of scope:
  - save schema のバージョニング導入
  - 既存 localStorage データの一括 migration スクリプト

## 4. Milestones
| Milestone | Description | Status (Done / Blocked / Cancelled) | Notes |
| --- | --- | --- | --- |
| M1 | biome 定義と正規化 helper 追加 | Done | `CampaignBiomes.ts` を新設 |
| M2 | Campaign/Save/Game/Menu の統合作業 | Done | ID 基準で保持し表示時のみ label 化 |
| M3 | typecheck/build 検証 | Done | 実行ログを最終報告に記載 |

## 5. Acceptance Criteria
- [x] 新規 save は biome ID で保持される
- [x] legacy 表示名 save を読み込んでも壊れない
- [x] Hub/MainMenu/Prep の biome 表示が人間可読名のまま維持される

## 6. Verification Commands
- [x] `npm run typecheck`
- [x] `npm run build`
- [ ] `npm run lint`
- [ ] `npm run test`

## 7. Known Blockers
- lint/test は本タスク範囲外のため未実行。

## 8. Feature Flag / Rollback Plan (if needed)
- Feature flag: なし。
- Rollback steps:
  1. `CampaignBiomes.ts` 追加を取り消す
  2. `CampaignState` を旧 label ベースへ戻す
  3. `SaveManager` 正規化呼び出しを削除

## 9. Status Updates
- 2026-04-25: biome ID 正規化方針を定義し、state/save/ui へ反映。

## 10. Stop State Checklist
- [x] 各マイルストーン状態を更新した
- [x] Blocked 項目の停止理由と再開条件を記載した
- [x] 次に実行すべき最短アクションを記載した
- [x] 実行済み検証と未実行理由を整理した

次の最短アクション: run 完了時に `CampaignState` の次 biome unlock を適用し、Hub へ extraction 帰還導線を接続する。
