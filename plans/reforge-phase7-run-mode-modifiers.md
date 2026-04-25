# Reforge Phase 7: Run Mode Modifiers Foundation

## 目的
- Campaign / Contracts / Boss Rush / Endless Collapse の差分をデータ駆動ルールとして明示し、戦闘サンドボックスでモードごとの手触り差を強化する。
- 既存の run mode 切替を UI 表示上だけでなく、敵圧・報酬・リソース管理に反映する。

## 非目標
- 新規 biome や新規ボスの追加。
- ネットワーク同期やマルチプレイ対応。
- 実音源アセットの差し替え。

## 対象範囲
- `src/game/encounters/` に run mode modifier 定義を追加。
- `CombatSandboxDirector` へ modifier 適用（敵生成、リソース、報酬、HUD ラベル）。
- README の実装範囲説明を更新（モード差分反映）。

## マイルストーン
1. run mode modifier 定義の追加（Done）
2. CombatSandboxDirector 統合（Done）
3. README 更新と検証（Done）

## 受け入れ条件
- 各 run mode の倍率/挙動差が単一データ定義で管理される。
- HUD の契約ラベルに mode modifier 概要が表示される。
- `npm run typecheck` / `npm run build` / `npm run validate:content` が成功する。

## 検証コマンド
- `npm run typecheck`
- `npm run build`
- `npm run validate:content`
- `npm run check`

## 既知の blocker
- なし。

## feature flag / rollback 方針
- modifier 参照を `campaign` デフォルトへフォールバック可能な実装にして、問題発生時は mode 依存値を 1.0 に戻すことで即時ロールバックする。
