# Task: reforge-phase5-save-slots

## 目的
Main Menu から save slot を選択できるようにし、slot ごとに campaign/meta/continue 状態を独立して保持・復帰できる基盤を追加する。

## 非目標
- 複数スロット間のデータマージ
- クラウド同期
- スロット削除確認ダイアログ

## 対象範囲
- MenuManager の Main Menu UI に slot 選択導線を追加
- Game の save 操作を active slot 駆動へ切替
- slot 切替時の hub/progression/prep/continue 再同期

## マイルストーン
| ID | 内容 | 状態 | 備考 |
|---|---|---|---|
| M1 | Main Menu へ save slot 表示/選択導線追加 | Done | Slot1-3 と active 表示 |
| M2 | Game 側 save API 呼び出しを active slot 化 | Done | state/meta/expedition/new game 反映 |
| M3 | slot 切替時の view model 再同期 | Done | campaign/meta/prep/wrist UI を再計算 |

## 受け入れ条件
- [x] Main Menu で Slot1-3 を切替できる
- [x] active slot に応じて Continue/New Game/Meta 更新先が変わる
- [x] slot 切替時に hub/prep 表示と run 状態が安全にリセットされる

## 検証コマンド
- `npm run typecheck`
- `npm run build`

## 既知 blocker
- save slot 削除 UI は未実装（現状は New Game で上書き運用）

## Feature Flag / Rollback
- slot 切替導線を外す場合は `MenuManager` の slot command 発行を停止し、`Game.activeSlotId` を固定値 `0` に戻す
