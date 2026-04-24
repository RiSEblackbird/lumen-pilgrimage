# Task: reforge-phase4-contract-route-save

## 目的
Phase 4 継続として、Encounter の分岐導線を mission/contract 意図と接続し、run 内 relic 効果を continue snapshot に永続化する。

## 非目標
- Hub 恒久成長 UI 完成
- biome 固有敵ファミリーの量産
- boss encounter の本実装

## 対象範囲
- MissionTypes に routeBias を追加
- EncounterDirector に mission route bias 注入 API を追加
- CombatSandboxDirector で contract 切替時に route bias を適用
- SaveManager / MenuManager / Game の expedition snapshot に relicModifiers と routeStyle を保存表示
- README / docs / progress 更新

## マイルストーン
- [x] M1: mission routeBias データ定義
- [x] M2: EncounterDirector route 優先度マージ
- [x] M3: sandbox contract 切替連動
- [x] M4: save/load snapshot 拡張
- [x] M5: docs 更新
- [x] M6: typecheck/build

## 受け入れ条件
- [x] contract 切替で route 優先順位が変化する
- [x] routeStyle が continue snapshot に保存される
- [x] relic stat modifiers が continue snapshot に保存される
- [x] `npm run typecheck` と `npm run build` が成功

## 検証コマンド
- `npm run typecheck`
- `npm run build`

## 既知 blocker
- route bias は mission 固定値で、contract modifier 難易度レイヤー未反映
- relic modifier は保存されるが、continue 復帰時の戦闘再適用は未実装

## Feature Flag / Rollback
- `CombatSandboxDirector.rotateLoadoutAndMission` の `encounter.setMissionRouteBias` 呼び出しを外すと旧 route 選択へ戻せる
- `SaveManager.parseRelicModifiers` が未指定値をデフォルト化するため旧セーブとの互換性は維持

## 再開コマンド
- `cd /workspace/lumen-pilgrimage && git status -sb`
- `npm run dev`
