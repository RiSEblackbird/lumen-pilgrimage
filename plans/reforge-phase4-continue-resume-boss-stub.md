# Task: reforge-phase4-continue-resume-boss-stub

## 目的
Phase 4 継続として、continue 復帰時に run 状態（mission/room/relic/vitals）を再適用し、Ember/Moon の boss encounter stub と HUD phase readout を追加する。

## 非目標
- biome boss の本戦 AI 実装
- Hub 恒久成長 UI の完成
- campaign routing の最終確定

## 対象範囲
- `SaveManager` の expedition snapshot に `roomId` を追加し、旧 save 互換を維持
- `EncounterDirector` に resume 用復帰 API を追加
- `RewardDirector` に relic 復帰 API を追加
- `CombatSandboxDirector` を continue snapshot 初期化対応に変更
- boss-approach room 到達時の boss stub phase 表示を HUD へ追加
- README / docs / progress の更新

## マイルストーン
- [x] M1: plan/progress 足場確認
- [x] M2: save + encounter resume API 実装
- [x] M3: sandbox continue 再開 + relic 再適用
- [x] M4: boss stub HUD readout 追加
- [x] M5: docs 更新
- [x] M6: typecheck/build

## 受け入れ条件
- [x] continue snapshot から biome/sector/room/relic/vitals が sandbox へ復帰する
- [x] 旧 save（roomId 未保存）を読み込んでもクラッシュしない
- [x] boss-approach room で boss stub phase が HUD に表示される
- [x] `npm run typecheck` と `npm run build` が成功する

## 検証コマンド
- `npm run typecheck`
- `npm run build`

## 既知 blocker
- boss は readout stub のみで、phase 毎のルール差分は未実装
- continue 復帰は menu の手動操作フロー（continue/new game 分岐）とは未接続

## Feature Flag / Rollback
- `Game` の `new CombatSandboxDirector(this.continueSnapshot)` を `null` に戻すと復帰無効化できる
- `CombatSandboxDirector.updateBossReadout` の呼び出しを外せば boss stub readout を無効化できる

## 再開コマンド
- `cd /workspace/lumen-pilgrimage && git status -sb`
- `npm run typecheck`
- `npm run build`
