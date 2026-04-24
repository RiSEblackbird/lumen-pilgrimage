# Task: reforge-phase2-combat-sandbox-slice2

## 目的
Phase 2 の第2スライスとして、combat sandbox に guard/parry の分離と telegraph 読み合いを導入し、回避・防御・反撃の循環を明確化する。

## 非目標
- 本番敵 AI ツリーの実装
- biome 遭遇ディレクタとの統合
- 本番チュートリアル演出の最終版

## 対象範囲
- `ActionMap` へ `guard` / `parry` を追加
- Desktop 入力マップの更新（RMB guard, F parry, Q offhand）
- `CombatSandboxDirector` へ telegraph 判定 / parry 成功・失敗 / stagger 状態を追加
- HUD へ telegraph と stagger 情報を表示
- README / architecture 文書を slice2 内容へ追従

## マイルストーン
- [x] M1: 計画作成と入力仕様の確定
- [x] M2: guard/parry アクションを入力抽象へ追加
- [x] M3: sandbox に telegraph・parry・stagger ロジックを追加
- [x] M4: HUD 表示更新と操作手順の文書反映
- [x] M5: typecheck/build 検証

## 受け入れ条件
- [x] guard と offhand が独立動作する
- [x] telegraph 中のみ parry 成功し、成功時は stagger とリソース報酬が発生する
- [x] HUD で telegraph と stagger 状態を視認できる
- [x] `npm run typecheck` / `npm run build` が成功する

## 検証コマンド
- `npm run typecheck`
- `npm run build`

## 既知 blocker
- なし

## Feature Flag / Rollback
- `CombatSandboxDirector` の parry 分岐を外すことで、旧 sandbox ロジックへ段階的に戻せる

## 再開コマンド
- `cd /workspace/lumen-pilgrimage && git status -sb`
- `npm run dev`
