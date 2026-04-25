# Task Plan: Reforge Phase 5 Campaign Content Scaleout

## 0. Metadata
- Task ID: reforge-phase5-campaign-content-scaleout
- Branch: current working branch
- Owner: Codex
- Last Updated: 2026-04-25

## 1. Objective
- Phase 5 のコンテンツ拡張に向けて、敵コンテンツ量要件（regular / elite / mini-boss / boss）をデータ駆動で明示し、検証コマンドで自動チェックできる状態を整備する。

## 2. Non-Goals
- 本タスクでは敵 AI 実装、アニメーション、当たり判定、実際のボス戦演出は追加しない。
- 本タスクでは既存 combat sandbox の挙動変更は行わない。

## 3. Scope
- In scope:
  - `src/content/enemies/EnemyCatalog.ts` 新規作成
  - `scripts/validate-content.mjs` に敵コンテンツ量検証を追加
  - typecheck / build / content validate 実行
- Out of scope:
  - EncounterDirector への catalog 実適用
  - biome ごとの room 実体アセット制作

## 4. Milestones
| Milestone | Description | Status (Done / Blocked / Cancelled) | Notes |
| --- | --- | --- | --- |
| M1 | 敵カタログの最小データモデルを定義する | Done | role と biome 紐付けを含めて定義 |
| M2 | 受け入れ条件に対応する敵数クォータ検証を追加する | Done | validate-content に regular/elite/mini-boss/boss を追加 |
| M3 | 既存検証コマンドを実行して buildable state を確認する | Done | typecheck/build/validate:content を実行 |

## 5. Acceptance Criteria
- [x] 敵カテゴリごとの定義が TypeScript の定数として存在する
- [x] content validation が敵カテゴリ数の下限を検証できる
- [x] 主要検証コマンドの実行結果を記録できる

## 6. Verification Commands
- [x] `npm run typecheck`
- [x] `npm run build`
- [x] `npm run validate:content`

## 7. Known Blockers
- None

## 8. Feature Flag / Rollback Plan (if needed)
- Feature flag: 不要（データ定義と検証追加のみ）
- Rollback steps:
  1. `src/content/enemies/EnemyCatalog.ts` を削除
  2. `scripts/validate-content.mjs` の敵クォータ検証ブロックを削除

## 9. Status Updates
- 2026-04-25: 敵カタログを追加し、コンテンツ検証スクリプトを拡張。typecheck/build/validate を実行して buildable state を確認。

## 10. Next Action
- EnemyCatalog を EncounterSpawnTables / BossContracts へ接続し、出現定義の重複を解消する。

## 11. Stop State Checklist
- [x] 各マイルストーン状態を更新した
- [x] Blocked 項目の停止理由と再開条件を記載した
- [x] 次に実行すべき最短アクションを記載した
- [x] 実行済み検証と未実行理由を整理した
