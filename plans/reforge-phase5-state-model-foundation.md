# Reforge Phase 5: State Model Foundation

## 0. Metadata
- Task ID: reforge-phase5-state-model-foundation
- Branch: work
- Owner: Codex
- Last Updated: 2026-04-24

## 1. Objective
- `GameStateMachine` とは別に、campaign / expedition / meta progression の責務を明示する軽量 state model を導入し、Hub・run 復帰・save 永続化で同じデータ定義を再利用できる基盤を追加する。

## 2. Non-Goals
- biome コンテンツ拡張、敵追加、ボス行動の刷新。
- save schema の破壊的変更。
- full campaign routing の完成。

## 3. Scope
- In scope:
  - `CampaignState` / `ExpeditionState` / `MetaProgressionState` の追加
  - `SaveManager` の `state` 検証漏れ修正（`Settings` を含む）と state 更新 API 追加
  - `Game` で新 state model を利用して Hub view / continue 保存 / run 進行の整合を強化
  - README の現況更新
- Out of scope:
  - 新規 UI 画面追加
  - XR 固有の演出変更

## 4. Milestones
| Milestone | Description | Status (Done / Blocked / Cancelled) | Notes |
| --- | --- | --- | --- |
| M1 | state model の型定義を追加 | Done | `src/game/state/*State.ts` |
| M2 | Game / SaveManager への統合 | Done | save の state 更新 + run snapshot 統合 |
| M3 | typecheck/build/check + README 更新 | Done | 検証コマンド実行済み |

## 5. Acceptance Criteria
- [x] campaign / expedition / meta progression の責務が `Game` から部分分離されている
- [x] save slot の `state` が遷移時に更新される
- [x] README に新基盤の説明が追加されている

## 6. Verification Commands
- [x] `npm run typecheck`
- [x] `npm run build`
- [x] `npm run check`

## 7. Known Blockers
- None

## 8. Feature Flag / Rollback Plan (if needed)
- Feature flag: なし（既存導線を維持した置換）
- Rollback steps:
  1. `Game` の state model 利用箇所を元の直接処理へ戻す
  2. `SaveManager.updateState` 呼び出しを撤去
  3. 追加した 3 state model ファイルを削除

## 9. Status Updates
- 2026-04-24: 計画作成、state model を追加して Game/SaveManager へ統合。
- 2026-04-24: typecheck/build/check が通過、README を更新。

## 10. Stop State Checklist
- [x] 各マイルストーン状態を更新した
- [x] Blocked 項目の停止理由と再開条件を記載した
- [x] 次に実行すべき最短アクションを記載した
- [x] 実行済み検証と未実行理由を整理した

次の最短アクション: Phase 5 の biome routing 拡張で `CampaignState.currentObjective` を実 encounter graph に接続する。
