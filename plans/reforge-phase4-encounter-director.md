# Task: reforge-phase4-encounter-director

## 目的
Phase 4 の最初の到達点として、EncounterDirector を導入し、biome/sector/room 進行を戦闘サンドボックスに接続する。

## 非目標
- room graph の自動生成
- biome 固有敵ファミリーの本実装
- save/load への expedition 進行永続化

## 対象範囲
- EncounterRuleSet（Ember Ossuary / Moon Reservoir）追加
- EncounterDirector 追加
- CombatSandboxDirector と HUD への接続
- SaveManager へ保存した expedition snapshot を Hub continue UI へ接続
- README / docs / roadmap / progress 更新

## マイルストーン
- [x] M1: 計画更新
- [x] M2: EncounterRuleSet 追加
- [x] M3: EncounterDirector 実装
- [x] M4: CombatSandboxDirector 連携
- [x] M5: HUD / docs 更新
- [x] M6: typecheck/build
- [x] M7: Hub continue UI に保存済み expedition snapshot を表示

## 受け入れ条件
- [x] biome/sector/room の進行ラベルが更新される
- [x] wave clear 時に encounter 進行と reward 表示が同期する
- [x] 保存済み expedition snapshot が menu 上で確認できる
- [x] `npm run typecheck` と `npm run build` が成功

## 検証コマンド
- `npm run typecheck`
- `npm run build`

## 既知 blocker
- room graph の枝分かれ生成、タグ連動スポーン、relic 効果適用は未着手

## Feature Flag / Rollback
- `CombatSandboxDirector` の `EncounterDirector` 呼び出しを外せば旧挙動へ復帰可能

## 再開コマンド
- `cd /workspace/lumen-pilgrimage && git status -sb`
- `npm run dev`
