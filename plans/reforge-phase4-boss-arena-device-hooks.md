# Reforge Phase 4: Boss Arena Device Hooks

## 0. Metadata
- Task ID: reforge-phase4-boss-arena-device-hooks
- Branch: work
- Owner: Codex
- Last Updated: 2026-04-25

## 1. Objective
- boss contract の `arenaMutationSummary` をテキスト表示に留めず、biome ごとの arena device 状態へ展開する `ArenaMutationDirector` を導入し、HUD/objective へ反映する。

## 2. Non-Goals
- 実ジオメトリを動かす 3D device 実装。
- 専用 VFX / サウンドアセットの追加。
- boss contract データフォーマットの破壊的変更。

## 3. Scope
- In scope:
  - `ArenaMutationDirector` 新規追加
  - `CombatSandboxDirector` への統合（phase change / pulse callout / HUD ラベル）
  - 進捗・README の更新
- Out of scope:
  - room graph や encounter 構造の変更
  - セーブデータ schema の拡張

## 4. Milestones
| Milestone | Description | Status (Done / Blocked / Cancelled) | Notes |
| --- | --- | --- | --- |
| M1 | ArenaMutationDirector を実装 | Done | biome device preset + phase scaling |
| M2 | CombatSandboxDirector 統合 | Done | boss phase 連動 + pulse objective |
| M3 | ドキュメント更新と検証 | Done | typecheck/build/check 実施 |

## 5. Acceptance Criteria
- [x] boss phase 進行に応じて arena device の状態が更新される
- [x] HUD の arena mutation 表示に summary だけでなく device 状態が含まれる
- [x] 定期 pulse callout が objective に反映される

## 6. Verification Commands
- [x] `npm run typecheck`
- [x] `npm run build`
- [x] `npm run check`

## 7. Known Blockers
- None

## 8. Feature Flag / Rollback Plan (if needed)
- Feature flag: なし（sandbox の内部拡張）。
- Rollback steps:
  1. `CombatSandboxDirector` から `ArenaMutationDirector` 呼び出しを除去する。
  2. `src/game/director/ArenaMutationDirector.ts` を削除する。

## 9. Status Updates
- 2026-04-25: 計画作成。phase4 の次アクション（arena device hooks）として着手。
- 2026-04-25: 実装・統合・検証完了。

## 10. Stop State Checklist
- [x] 各マイルストーン状態を更新した
- [x] Blocked 項目の停止理由と再開条件を記載した
- [x] 次に実行すべき最短アクションを記載した
- [x] 実行済み検証と未実行理由を整理した
