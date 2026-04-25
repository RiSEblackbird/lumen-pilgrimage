# Task Plan: reforge-phase4-hub-terminal-wrist-parity

## 0. Metadata
- Task ID: reforge-phase4-hub-terminal-wrist-parity
- Branch: current
- Owner: codex agent
- Last Updated: 2026-04-25

## 1. Objective
- Hub で world-space terminal を使った導線を追加し、VR wrist UI と Expedition Prep の情報表示を同等に揃える。

## 2. Non-Goals
- 新規 biome 追加や戦闘システム改修。
- 実アセット制作（最終 art pass）。

## 3. Scope
- In scope:
  - Hub terminal の選択・起動ロジックを実装。
  - Hub scene に terminal pedestal の視覚要素を追加。
  - VR wrist UI に terminal/loadout/status を統合表示。
  - Hub メニューに terminal 操作ヒントを追加。
- Out of scope:
  - VR コントローラ raycast による実操作。
  - 専用 3D terminal UI パネルの新規制作。

## 4. Milestones
| Milestone | Description | Status (Done / Blocked / Cancelled) | Notes |
| --- | --- | --- | --- |
| M1 | Hub terminal director と scene 表示を追加 | Done | terminal pedestal + selection ring を追加 |
| M2 | Game で terminal input と menu state 遷移を接続 | Done | Hub 中 Q/E で cycle/interact を処理 |
| M3 | Wrist UI と prep parity、型/ビルド検証 | Done | wrist status に terminal + prep summary を統合 |

## 5. Acceptance Criteria
- [x] Hub で terminal 選択を切り替え、選択中 terminal の action を起動できる。
- [x] VR wrist status が terminal 選択と prep 情報を表示する。
- [x] typecheck / build が成功する。

## 6. Verification Commands
- [ ] `npm run format`
- [ ] `npm run lint`
- [x] `npm run typecheck`
- [ ] `npm run test`
- [x] `npm run build`
- [ ] `npm run dev`

## 7. Known Blockers
- VR コントローラの direct world terminal interaction は未実装（現時点では desktop input parity ベース）。

## 8. Feature Flag / Rollback Plan (if needed)
- Feature flag: なし。
- Rollback steps: `HubTerminalDirector` を削除し、Hub scene の terminal mesh と input 分岐を戻す。

## 9. Status Updates
- 2026-04-25: Hub terminal director / scene visual / wrist parity / input 接続を実装し、typecheck と build を完了。

## 10. Stop State Checklist
- [x] 各マイルストーン状態を更新した
- [x] Blocked 項目の停止理由と再開条件を記載した
- [x] 次に実行すべき最短アクションを記載した
- [x] 実行済み検証と未実行理由を整理した
