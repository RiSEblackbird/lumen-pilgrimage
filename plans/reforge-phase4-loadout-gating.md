# Task: reforge-phase4-loadout-gating

## 目的
Hub の恒久 unlock（weapon/offhand/sigil）を expedition 中ロードアウト循環へ反映し、未解放装備が戦闘サンドボックスで選択されないようにする。

## 非目標
- 新武器・新副手段の挙動追加
- biome/boss コンテンツ追加

## 対象範囲
- `CombatSandboxDirector` にロードアウト利用可能リスト（解放済み ID）を注入する API を追加
- ロードアウト回転ロジックを「全定義」ではなく「解放済み定義」の循環へ変更
- `Game` から save の `metaProgress` 更新タイミングでロードアウト制約を反映
- progress JSON を更新

## マイルストーン
- [x] M1: CombatSandboxDirector に loadout availability 設定 API を追加
- [x] M2: rotate 処理を解放済み装備のみに制限
- [x] M3: Game から metaProgress 更新時に反映
- [x] M4: Hub/HUD に解放済み・未解放ロードアウト情報を表示
- [x] M5: typecheck/build を通す

## 受け入れ条件
- [x] unlock 前は rotate 操作で未解放 weapon/offhand/sigil が選択されない
- [x] unlock/craft 後は同セッションで rotate 候補へ追加される
- [x] Hub 画面で解放済み/未解放候補が即時確認できる
- [x] HUD で現在の loadout pool（解放数/総数）が確認できる
- [x] `npm run typecheck` と `npm run build` が成功する

## 検証コマンド
- `npm run typecheck`
- `npm run build`

## 既知 blocker
- 現時点ではなし

## 再開コマンド
- `cd /workspace/lumen-pilgrimage && git status -sb`
- `npm run typecheck`
- `npm run build`
