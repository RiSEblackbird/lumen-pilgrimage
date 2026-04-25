# Reforge Phase 5: Hub Terminal Context Widgets

## 0. Metadata
- Task ID: reforge-phase5-hub-terminal-context-widgets
- Branch: work
- Owner: Codex
- Last Updated: 2026-04-25

## 1. Objective
- Hub 端末の pointer beacon だけでは不足している文脈提示を補うため、各 terminal に world-space widget（状態ラベル + 充填メーター）を持たせ、Hub の進行/解放状況と接続する。

## 2. Non-Goals
- 3D テキストや高級 VFX の追加。
- Hub terminal action の追加や遷移ルール変更。
- save schema の変更。

## 3. Scope
- In scope:
  - `HubTerminalDirector` に terminal metadata と widget 参照 API を追加。
  - `PilgrimsBelfryScene` に terminal ごとの widget Mesh を追加し、context 更新 API を実装。
  - `Game` から hub/meta/prep 状態を scene widget に反映。
  - 進捗ファイル更新。
- Out of scope:
  - UI アセット導入。
  - メニュー文言の全面改修。

## 4. Milestones
| Milestone | Description | Status (Done / Blocked / Cancelled) | Notes |
| --- | --- | --- | --- |
| M1 | terminal widget のデータモデル/API拡張 | Done | terminal ごとの status label / intensity を定義 |
| M2 | Hub scene の world widget 実装 | Done | pedestal 上に status bar を追加し選択連動 |
| M3 | Game 統合 + 検証 | Done | hub/meta/prep 遷移時に widget 同期 |

## 5. Acceptance Criteria
- [x] 3つの hub terminal それぞれが world-space widget を持つ。
- [x] widget は hub の文脈（expedition readiness / meta unlock progress / main menu return affordance）を反映する。
- [x] terminal selection の切替で選択端末 widget が視覚強調される。

## 6. Verification Commands
- [x] `npm run typecheck`
- [x] `npm run build`
- [x] `npm run validate:content`

## 7. Known Blockers
- None

## 8. Feature Flag / Rollback Plan (if needed)
- Feature flag: なし。
- Rollback steps:
  1. `PilgrimsBelfryScene` の widget 生成・更新処理を除去。
  2. `Game.syncHubWorldWidgets` 呼び出しを削除。

## 9. Status Updates
- 2026-04-25: 計画作成・実装・検証完了。

## 10. Stop State Checklist
- [x] 各マイルストーン状態を更新した
- [x] Blocked 項目の停止理由と再開条件を記載した
- [x] 次に実行すべき最短アクションを記載した
- [x] 実行済み検証と未実行理由を整理した
