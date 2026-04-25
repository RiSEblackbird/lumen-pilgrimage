# Reforge Phase 5 Plan: Hub Biome Boss Foundation

## 0. Metadata
- Task ID: reforge-phase5-hub-biome-boss-foundation
- Branch: current working branch
- Owner: Codex
- Last Updated: 2026-04-25

## 1. Objective
- ボス遭遇の arena mutation 情報を biome 固有の音響リアクティブ制御へ接続し、戦闘中の情報密度と演出の一貫性を上げる。

## 2. Non-Goals
- 実音源アセットの追加やミキシングエンジン実装。
- 新規 boss attack パターン追加。
- HUD の大規模デザイン変更。

## 3. Scope
- In scope:
  - biome ごとの reactive motif 定義を追加する。
  - boss phase / mutation pulse / overburn を使った audio cue 生成を追加する。
  - CombatSandboxDirector へ統合し、objective と HUD 表示に反映する。
  - README のアーキテクチャ説明を最小更新する。
- Out of scope:
  - three.js の PositionalAudio 具体実装。
  - BGM stem の実再生制御。

## 4. Milestones
| Milestone | Description | Status (Done / Blocked / Cancelled) | Notes |
| --- | --- | --- | --- |
| M1 | Boss arena audio reactive director 実装 | Done | biome motif と phase 依存 cue を実装 |
| M2 | CombatSandboxDirector へ統合 | Done | phase shift / pulse / hazard 更新に連動 |
| M3 | 検証とドキュメント反映 | Done | typecheck/build と README 追記 |

## 5. Acceptance Criteria
- [x] biome 固有の audio reactive cue が boss arena 状態から生成される。
- [x] boss phase 進行時に cue が更新され、HUD で確認できる。
- [x] mutation pulse と hazard pressure が objective callout に反映される。

## 6. Verification Commands
- [x] `npm run typecheck`
- [x] `npm run build`

## 7. Known Blockers
- 音源アセットと実再生の統合は未着手（別タスク）。

## 8. Feature Flag / Rollback Plan (if needed)
- Feature flag: なし（ロジック追加のみ）。
- Rollback steps:
  1. `BossArenaAudioDirector` の呼び出しを `CombatSandboxDirector` から除去。
  2. 追加した HUD / objective 文言を従来値へ戻す。

## 9. Status Updates
- 2026-04-25: 計画作成。実装着手。
- 2026-04-25: 実装と検証完了。README に連携情報を追記。

## 10. Stop State Checklist
停止時には全項目を `Done / Blocked / Cancelled` に更新し、`pending` と `in_progress` を残さない。

- [x] 各マイルストーン状態を更新した
- [x] Blocked 項目の停止理由と再開条件を記載した
- [x] 次に実行すべき最短アクションを記載した
- [x] 実行済み検証と未実行理由を整理した
