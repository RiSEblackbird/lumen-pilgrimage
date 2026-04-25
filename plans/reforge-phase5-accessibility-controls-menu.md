# Reforge Phase 5: Accessibility / Controls Menu Foundation

## 目的
Main Menu に `Accessibility` と `Controls` 導線を追加し、VR/flat 共通で必要な操作・快適性設定を永続化可能にする。

## 非目標
- 入力デバイスごとの完全リバインド実装
- 実オーディオバスへの詳細なダイナミックレンジ処理実装
- チュートリアル導線の全面改修

## 対象範囲
- `GameState` / `GameStateMachine` に Accessibility・Controls を追加
- `MenuManager` に MainMenu 導線と各パネルを追加
- `SettingsStore` / `SettingsViewModel` の永続設定項目拡張
- `Game` のコマンド処理とランタイム反映の接続
- README のメニュー説明更新

## マイルストーン
1. state machine と menu command に Accessibility / Controls を追加
2. settings schema を拡張し、UI から toggle/cycle できるようにする
3. `npm run typecheck` / `npm run build` / `npm run validate:content` で検証し README を更新

## 受け入れ条件
- MainMenu から Accessibility / Controls へ遷移できる
- 追加した設定値が localStorage に保存され、再起動後も維持される
- `npm run check` が成功する

## 検証コマンド
- `npm run typecheck`
- `npm run build`
- `npm run validate:content`
- `npm run check`

## 既知の blocker
- なし

## feature flag / rollback
- 問題が出た場合は state 追加分と menu command を丸ごと revert すれば旧挙動へ戻せる。
