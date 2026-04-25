# Task Plan: reforge-phase6-arena-visual-hooks

## 0. Metadata
- Task ID: reforge-phase6-arena-visual-hooks
- Branch: current working branch
- Owner: Codex
- Last Updated: 2026-04-25

## 1. Objective
- Arena device runtime (`ArenaMutationDirector`) の出力を、実際のシーン側ジオメトリ演出へ接続できる visual hook チャンネルとして公開し、flat/VR 共通で boss 戦圧を可視化する。

## 2. Non-Goals
- 新規 biome の部屋ジオメトリ追加。
- 本番向け高品質 VFX アセットの追加。
- UI 全面デザイン刷新。

## 3. Scope
- In scope:
  - `ArenaMutationDirector` に visual hook snapshot を追加
  - `CombatSandboxDirector` の snapshot に arena visual hook を追加
  - `PilgrimsBelfryScene` で hook を受け取り arena メッシュの色/発光を更新
  - `HudManager` / `Game` へ visual summary 表示を追加
  - README の実装範囲記載更新
- Out of scope:
  - authoring ツールチェーン追加
  - 新規 post-processing pipeline

## 4. Milestones
| Milestone | Description | Status (Done / Blocked / Cancelled) | Notes |
| --- | --- | --- | --- |
| M1 | ArenaMutationDirector で visual hook チャンネル定義と算出 | Done | effect snapshot から hazard/focus/guard/overburn を正規化算出 |
| M2 | CombatSandbox/Game/HUD へ visual hook を配線 | Done | run 中 hook を hub scene と HUD 両方へ反映 |
| M3 | Hub scene で arena visual pulse を実装 | Done | emissive pulse を reduce flashing 設定に連動 |

## 5. Acceptance Criteria
- [x] arena runtime から visual hook を取得できる
- [x] run 中に scene 側メッシュ演出が hook に応じて変化する
- [x] HUD に visual hook summary が表示される

## 6. Verification Commands
- [x] `npm run typecheck`
- [x] `npm run build`
- [x] `npm run validate:content`
- [x] `npm run validate:release`

## 7. Known Blockers
- なし

## 8. Feature Flag / Rollback Plan (if needed)
- Feature flag: なし（既存 sandbox/hub 経路のみ拡張）
- Rollback steps:
  1. `ArenaDeviceVisualHooks` を削除
  2. `CombatSandboxSnapshot` の追加項目を削除
  3. `PilgrimsBelfryScene#setArenaVisualHooks` と pulse ロジックを削除

## 9. Status Updates
- 2026-04-25: visual hook チャンネル設計と runtime 配線を実装。検証コマンドはこの後実行する。
- 2026-04-25: `npm run check` 実行で typecheck/build/content validation/release validation を通過。

## 10. Stop State Checklist
- [x] 各マイルストーン状態を更新した
- [x] Blocked 項目の停止理由と再開条件を記載した
- [x] 次に実行すべき最短アクションを記載した
- [x] 実行済み検証と未実行理由を整理した
