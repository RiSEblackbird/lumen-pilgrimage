# Task: reforge-phase4-hub-meta-progression

## 目的
Phase 4 継続として、Hub 側で恒久成長（通貨表示・unlock/craft プレースホルダ）を操作できる UI を実装し、save slot の永続データへ接続する。

## 非目標
- 実際の weapon/offhand 戦闘挙動差分の実装
- biome boss AI 本実装
- 3 つ目以降 biome の追加

## 対象範囲
- `SaveManager` に `metaProgress`（Lumen Ash / Choir Thread / Saint Glass / Echo Script + unlock 状態）を追加
- 旧 save 互換（metaProgress 未保存時は default 値で補完）
- `MenuManager` に Hub / MetaUpgrade パネルとコマンドを追加
- `Game` で Hub 導線と meta progression コマンド処理（unlock/craft 消費）を追加
- README / docs / progress 更新

## マイルストーン
- [x] M1: save schema 拡張と後方互換
- [x] M2: Hub/MetaUpgrade UI と command queue 拡張
- [x] M3: Game 側の hub 遷移・meta 更新処理を実装
- [x] M4: README/docs/progress 更新
- [x] M5: typecheck/build

## 受け入れ条件
- [x] MainMenu から Hub へ遷移できる
- [x] Hub で保存済み通貨・unlock 状態を確認できる
- [x] MetaUpgrade で unlock/craft 操作が保存データに反映される
- [x] 旧 save を読み込んでも `metaProgress` 欠落でクラッシュしない
- [x] `npm run typecheck` と `npm run build` が成功する

## 検証コマンド
- `npm run typecheck`
- `npm run build`

## 既知 blocker
- unlock/craft は保存値更新のみで、実戦ロードアウト解放ロジックとは未接続

## 再開コマンド
- `cd /workspace/lumen-pilgrimage && git status -sb`
- `npm run typecheck`
- `npm run build`
