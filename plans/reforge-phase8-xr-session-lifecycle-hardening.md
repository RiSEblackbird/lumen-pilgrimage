# Task Plan: reforge-phase8-xr-session-lifecycle-hardening

## 0. Metadata
- Task ID: reforge-phase8-xr-session-lifecycle-hardening
- Branch: work
- Owner: Codex
- Last Updated: 2026-04-25

## 1. Objective
- XR session start/end/resume と reference space 再取得のハンドリングを明示化し、controller 再接続時も UI 側が安全に追従する基盤を追加する。

## 2. Non-Goals
- 新規 gameplay mechanic の追加。
- WebXR 入力マッピング仕様の全面変更。
- 実機専用 QA の自動化。

## 3. Scope
- In scope:
  - `SessionBootstrap` の追加（XR セッション lifecycle 管理）
  - `Game` からの lifecycle 初期化と tick 更新
  - `XRActionAdapter` の lifecycle 反映 API（session/reference space 状態）
  - README の lifecycle 仕様追記
- Out of scope:
  - XR 専用 UI デザイン刷新
  - renderer pipeline の最適化

## 4. Milestones
| Milestone | Description | Status (Done / Blocked / Cancelled) | Notes |
| --- | --- | --- | --- |
| M1 | Session lifecycle 管理クラス追加と renderer 連携 | Done | `SessionBootstrap` を追加 |
| M2 | XR input adapter へ lifecycle 状態反映 | Done | status 文言と fallback を改善 |
| M3 | ドキュメント更新と検証コマンド実行 | Done | README 追記 + check 実行 |

## 5. Acceptance Criteria
- [x] XR session start/end/visibilitychange を監視し、状態を一元化できる。
- [x] reference space 再取得失敗時に flat fallback 表示で継続可能。
- [x] 主要検証コマンド（typecheck/build/content/release）が成功する。

## 6. Verification Commands
- [x] `npm run typecheck`
- [x] `npm run build`
- [x] `npm run validate:content`
- [x] `npm run validate:release`
- [x] `npm run check`

## 7. Known Blockers
- 実機 XR HMD 上での session visibility sequence はこの環境では確認不可（ブラウザ起動不可）。

## 8. Feature Flag / Rollback Plan (if needed)
- Feature flag: なし（既存 runtime に安全な追加のみ）。
- Rollback steps:
  1. `Game` から `SessionBootstrap` の依存を削除。
  2. `XRActionAdapter` の新規 lifecycle API 呼び出しを除去。
  3. `SessionBootstrap.ts` を削除。

## 9. Status Updates
- 2026-04-25: 計画作成。XR session lifecycle の明示的管理を本タスクの達成目標に設定。
- 2026-04-25: SessionBootstrap / XRActionAdapter / Game / README を更新し、検証コマンドを実行して全通過。

## 10. Stop State Checklist
停止時には全項目を `Done / Blocked / Cancelled` に更新し、`pending` と `in_progress` を残さない。

- [x] 各マイルストーン状態を更新した
- [x] Blocked 項目の停止理由と再開条件を記載した
- [x] 次に実行すべき最短アクションを記載した
- [x] 実行済み検証と未実行理由を整理した
