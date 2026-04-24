# Task: reforge-phase4-mainmenu-branching

## 目的
MainMenu で Continue / New Game の明示分岐を実装し、run 開始条件をユーザー操作に統一する。

## 非目標
- 本格的な mode select / settings / credits シーン演出
- Boss AI の本戦実装
- Hub の craft / codex 機能

## 対象範囲
- `MenuManager` に MainMenu コマンド UI（Continue / New Game / Settings / Credits）を追加
- `Game` でメニューコマンドを処理し、明示選択まで run を開始しない
- `SaveManager` に New Game 用 slot reset API を追加
- `CombatSandboxDirector` に continue/new game 共通の run リセット API を追加
- README / architecture / progress を更新

## マイルストーン
- [x] M1: 計画作成と既存 MainMenu/continue 仕様の棚卸し
- [x] M2: Menu command queue と MainMenu UI 実装
- [x] M3: Game 側で continue/new game 分岐を接続
- [x] M4: Save reset / sandbox reset 実装
- [x] M5: docs と progress 更新
- [x] M6: typecheck/build 検証

## 受け入れ条件
- [x] MainMenu で Continue / New Game の明示操作が可能
- [x] 起動直後に自動で expedition を開始しない
- [x] New Game で slot0 expedition がクリアされる
- [x] Continue で保存済み snapshot から sandbox が再初期化される
- [x] `npm run typecheck` が成功
- [x] `npm run build` が成功

## 検証コマンド
- [x] `npm run typecheck`
- [x] `npm run build`

## 既知 blocker
- なし

## Feature Flag / Rollback
- 変更は `MenuManager` command queue と `Game` の run start 条件に局所化。
- ロールバックは `Game` の `runActive` gating と `MenuManager` MainMenu UI を戻すことで可能。

## 再開コマンド
- `cd /workspace/lumen-pilgrimage && git status -sb`
- `npm run dev`

## ステータス更新
- 2026-04-24: MainMenu に command queue を追加し、Continue / New Game の明示分岐を `Game` に接続。`SaveManager.resetSlot` と `CombatSandboxDirector.resetForRun` を実装し、起動直後の自動 run 開始を停止。README/docs/progress を更新し、`npm run typecheck` と `npm run build` の成功を確認。
