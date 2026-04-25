# Task Plan: reforge-phase5-ash-sight

## 0. Metadata
- Task ID: `reforge-phase5-ash-sight`
- Branch: current working branch
- Owner: Codex
- Last Updated: 2026-04-25

## 1. Objective
- 旧 spirit vision の刷新方針に合わせ、`Ash Sight` を run 中に使える tactical reveal として導入し、Focus 消費 + cooldown 管理、HUD 可視化、入力導線を実装する。

## 2. Non-Goals
- XR 専用の hand gesture 追加。
- 3D world 側の専用ポストエフェクト/VFX 実装。
- secret room 自動検出の本番ルーティングアルゴリズム。

## 3. Scope
- In scope:
  - ActionMap に `ashSight` 入力を追加。
  - flat-screen キーバインド（`R`）を追加。
  - CombatSandboxDirector に Ash Sight の Focus コスト、cooldown、有効時間、objective/HUD 表示を追加。
  - README の操作説明更新。
- Out of scope:
  - VR controller の Ash Sight 専用ジェスチャ。
  - 実ジオメトリへの weakpoint highlight 描画。

## 4. Milestones
| Milestone | Description | Status (Done / Blocked / Cancelled) | Notes |
| --- | --- | --- | --- |
| M1 | 入力抽象に Ash Sight action を追加 | Done | `ActionMap` / `DesktopActionAdapter` 更新 |
| M2 | Combat sandbox に Ash Sight ループを実装 | Done | Focus 消費 + cooldown + objective/telegraph 反映 |
| M3 | HUD/README と検証コマンドを更新 | Done | HUD ラベル追加、typecheck/build 実行 |

## 5. Acceptance Criteria
- [x] `R` 入力で Ash Sight を発動できる（Focus 足りない/CT中は失敗メッセージを返す）。
- [x] Ash Sight の残り時間と cooldown 状態が HUD に表示される。
- [x] Ash Sight 中に telegraph/readability 用の補助ラベルが出る。
- [x] `npm run typecheck` と `npm run build` が成功する。

## 6. Verification Commands
- [x] `npm run typecheck`
- [x] `npm run build`

## 7. Known Blockers
- なし（今回は sandbox ロジック + HUD 表示までを対象）。

## 8. Feature Flag / Rollback Plan (if needed)
- Feature flag: なし（既存入力に追加 action を導入）。
- Rollback steps: `ashSight` action と sandbox の関連分岐を削除し、既存 combat loop に戻す。

## 9. Status Updates
- 2026-04-25: Ash Sight の入力/リソース管理/HUD 可視化を追加し、typecheck/build 成功を確認。

## 10. Stop State Checklist
- [x] 各マイルストーン状態を更新した
- [x] Blocked 項目の停止理由と再開条件を記載した（該当なし）
- [x] 次に実行すべき最短アクションを記載した
- [x] 実行済み検証と未実行理由を整理した
