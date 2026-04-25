# Task Plan: reforge-phase4-expedition-prep-loadout

## 0. Metadata
- Task ID: reforge-phase4-expedition-prep-loadout
- Branch: current
- Owner: codex agent
- Last Updated: 2026-04-25

## 1. Objective
- Hub と InExpedition の間に専用の Expedition Prep 画面を導入し、ロードアウトと mission/biome を明示的に選んでから出撃できるようにする。

## 2. Non-Goals
- 専用 3D room の新規アセット制作。
- 戦闘システムそのもの（ダメージ式・敵 AI）の大規模改変。

## 3. Scope
- In scope:
  - `MenuManager` に Expedition Prep UI と command を追加。
  - `Game` で prep 選択状態の保持と launch 導線を接続。
  - `CombatSandboxDirector` へ expedition plan 注入 API を追加。
- Out of scope:
  - ボス専用 actor 実装。
  - biome 固有 setpiece 実装。

## 4. Milestones
| Milestone | Description | Status (Done / Blocked / Cancelled) | Notes |
| --- | --- | --- | --- |
| M1 | Prep UI/command の追加 | Done | Hub から prep を経由する導線へ変更 |
| M2 | Game で prep state 管理・反映 | Done | 選択値を sandbox plan へ反映して launch |
| M3 | 型検証・build 検証 | Done | `npm run typecheck` / `npm run build` |

## 5. Acceptance Criteria
- [x] Hub から直接 launch ではなく Expedition Prep を開ける。
- [x] Prep で biome/mission/weapon/offhand/sigil を循環選択できる。
- [x] launch 時に選択した plan が sandbox run に反映される。

## 6. Verification Commands
- [ ] `npm run format`
- [ ] `npm run lint`
- [x] `npm run typecheck`
- [ ] `npm run test`
- [x] `npm run build`
- [ ] `npm run dev`

## 7. Known Blockers
- boss actor の専用実装は未着手で、現状は contract/wave 駆動。

## 8. Feature Flag / Rollback Plan (if needed)
- Feature flag: なし（state machine の既存 `ExpeditionPrep` 状態を利用）。
- Rollback steps: Hub ボタンを `launch-expedition` へ戻し、`configureExpeditionPlan` 呼び出しを削除。

## 9. Status Updates
- 2026-04-25: Prep 専用メニュー、選択 command、sandbox plan 注入を実装。次は boss arena mutation hook を追加する。

## 10. Stop State Checklist
- [x] 各マイルストーン状態を更新した
- [x] Blocked 項目の停止理由と再開条件を記載した
- [x] 次に実行すべき最短アクションを記載した
- [x] 実行済み検証と未実行理由を整理した
