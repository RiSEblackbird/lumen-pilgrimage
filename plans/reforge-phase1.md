# Task: reforge-phase1-foundation

## 目的
Lumen Pilgrimage を ritual/glyph 中心デモから、Reforge の基盤（state machine + menu/hub skeleton + input abstraction + save/settings + perf HUD）へ移行する。

## 非目標
- フルキャンペーン実装
- 全 biome / 全敵実装
- 仕上げ演出と最終アート

## 対象範囲
- エントリポイントを新アーキテクチャへ差し替え
- Game state machine の導入
- Desktop/XR 入力抽象の導入
- SaveManager / SettingsStore / PerfHud の導入
- Main menu/hub の骨組み UI とシーン
- README / docs 更新

## マイルストーン
- [x] M1: 計画更新と現状棚卸し
- [x] M2: 新規ディレクトリと基盤クラス追加
- [x] M3: main.ts を新 bootstrap 経由へ切替
- [x] M4: 保存設定/PerfHUD/Hub skeleton の接続
- [x] M5: ドキュメント更新
- [x] M6: typecheck/build 検証

## 受け入れ条件
- [x] Boot〜EndlessCollapse を含む state 定義が存在
- [x] ritual/glyph/export 依存をランタイムの主経路から切り離し
- [x] 入力抽象、保存、設定、PerfHUD が動作する最小実装がある
- [x] main menu / hub skeleton が起動できる
- [x] `npm run typecheck` と `npm run build` が成功

## 検証コマンド
- `npm run typecheck`
- `npm run build`

## 既知 blocker
- 現時点ではなし（Phase 2 以降で戦闘/遭遇コンテンツを実装予定）

## Feature Flag / Rollback
- 旧 app モジュールは残置し、必要時に参照可能
- 新アーキテクチャ導入は `src/main.ts` のエントリ差し替えでロールバック可能

## 再開コマンド
- `cd /workspace/lumen-pilgrimage && git status -sb`
- `npm run dev`
