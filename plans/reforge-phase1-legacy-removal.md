# Task: reforge-phase1-legacy-removal

## 0. Metadata
- Task ID: reforge-phase1-legacy-removal
- Branch: current working branch
- Owner: Codex
- Last Updated: 2026-04-24

## 1. Objective
- Phase 1 の受け入れ条件を強化するため、旧 ritual/glyph/export/codex 系コードを参照残置ではなく実体削除し、ランタイムと保守対象を新アーキテクチャへ一本化する。

## 2. Non-Goals
- Phase 2 以降の戦闘メカニクス追加
- 新 biome / enemy / boss の追加
- UI の全面改装

## 3. Scope
- In scope:
  - 旧 `src/app`, `src/world`, `src/ui`, `src/export` 配下の ritual 系ファイル削除
  - architecture / README のレガシー撤去状況更新
  - typecheck/build による回帰検証
- Out of scope:
  - 新システム追加
  - バランス調整

## 4. Milestones
| Milestone | Description | Status (Done / Blocked / Cancelled) | Notes |
| --- | --- | --- | --- |
| M1 | 依存参照棚卸し（削除対象が新経路から未参照であること確認） | Done | `rg` で参照箇所を確認 |
| M2 | 旧 ritual/glyph/export/codex 実装を削除 | Done | 12 ファイルを `git rm` |
| M3 | README/docs に撤去反映 | Done | architecture + README 更新 |
| M4 | typecheck/build 検証 | Done | 2026-04-24 実行 |

## 5. Acceptance Criteria
- [x] 旧 ritual/glyph/export/codex 系ファイルが `src/` から削除されている
- [x] ランタイム経路が `main.ts -> AppBootstrap -> Game` に限定される
- [x] `npm run typecheck` と `npm run build` が成功する
- [x] README / docs に現状が反映される

## 6. Verification Commands
- [x] `npm run typecheck`
- [x] `npm run build`

## 7. Known Blockers
- None

## 8. Feature Flag / Rollback Plan (if needed)
- Feature flag: なし（削除タスク）
- Rollback steps:
  1. 当該コミットを `git revert` で戻す。
  2. 再導入が必要なら必要最小限のみを新命名空間へ移植する。

## 9. Status Updates
- 2026-04-24: 旧参照を棚卸しし、新経路から未使用であることを確認。
- 2026-04-24: legacy 実装を削除し、README / docs を更新。
- 2026-04-24: typecheck/build の成功を確認。

## 10. Stop State Checklist
- [x] 各マイルストーン状態を更新した
- [x] Blocked 項目の停止理由と再開条件を記載した
- [x] 次に実行すべき最短アクションを記載した
- [x] 実行済み検証と未実行理由を整理した
