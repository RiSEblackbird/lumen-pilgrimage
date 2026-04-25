# Task Plan: reforge-phase5-mode-select

## 0. Metadata
- Task ID: `reforge-phase5-mode-select`
- Branch: current working branch
- Owner: Codex
- Last Updated: 2026-04-25

## 1. Objective
- MainMenu から Campaign / Contracts / Boss Rush / Endless Collapse を選択できる mode select 導線を追加し、選択モードに応じて run state と expedition plan が切り替わる基盤を導入する。

## 2. Non-Goals
- 専用 room geometry、専用 enemy/boss 実装、報酬経済の最終チューニング。
- 各モードの本番難易度バランス確定。

## 3. Scope
- In scope:
  - Run mode 定義の追加
  - MainMenu UI の mode select パネル追加
  - Game 側の mode 遷移・run 起動分岐追加
  - CombatSandboxDirector への mode hint 連携
  - README の操作説明更新
- Out of scope:
  - 新規アセット制作
  - phase6/7 の最終演出仕上げ

## 4. Milestones
| Milestone | Description | Status (Done / Blocked / Cancelled) | Notes |
| --- | --- | --- | --- |
| M1 | Run mode 型/定義と menu command を追加 | Done | `RunMode` と mode select command を定義 |
| M2 | MainMenu から mode 選択→起動の遷移実装 | Done | Campaign/Contracts/BossRush/Endless の分岐を追加 |
| M3 | typecheck/build と README 更新 | Done | コマンド実行とドキュメント反映 |

## 5. Acceptance Criteria
- [x] MainMenu で mode select パネルを開き、4 モードを選択できる。
- [x] BossRush / EndlessCollapse 選択時に対応 state へ遷移して run 開始する。
- [x] Contracts 選択時に mission rotation が contract 向けオフセットで開始する。
- [x] `npm run typecheck` と `npm run build` が成功する。

## 6. Verification Commands
- [x] `npm run typecheck`
- [x] `npm run build`

## 7. Known Blockers
- なし（実装はデータ/遷移基盤まで。専用 encounter コンテンツは後続フェーズ）。

## 8. Feature Flag / Rollback Plan (if needed)
- Feature flag: なし（既存 menu 導線に後方互換な追加）。
- Rollback steps: mode select command と `RunMode` 参照を削除し、従来の Campaign 起動導線へ戻す。

## 9. Status Updates
- 2026-04-25: mode select 基盤を実装し、MainMenu から各 run mode 起動が可能な状態まで到達。

## 10. Stop State Checklist
- [x] 各マイルストーン状態を更新した
- [x] Blocked 項目の停止理由と再開条件を記載した（該当なし）
- [x] 次に実行すべき最短アクションを記載した
- [x] 実行済み検証と未実行理由を整理した
