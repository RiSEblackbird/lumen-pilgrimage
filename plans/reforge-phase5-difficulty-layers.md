# Task: reforge-phase5-difficulty-layers

## 目的
Pilgrim / Trial / Martyr の 3 段階 difficulty layer を設定可能にし、run 内の敵耐久・被ダメージ・攻撃圧へ反映する。

## 非目標
- 難易度ごとの専用敵AI追加
- 完全なバランス最適化
- UI演出の大幅刷新

## 対象範囲
- Settings 永続化に difficulty 追加
- Settings UI から difficulty 切替
- CombatSandboxDirector の敵スケーリングへ difficulty 適用
- README / docs へ反映

## マイルストーン
1. Difficulty 定義 (`DifficultyState`) を追加し、設定値として永続化する。
2. Settings パネルへ difficulty cycle を追加し、Game 層から Sandbox へ設定反映する。
3. 敵の HP / ダメージ / 攻撃間隔 / telegraph を difficulty で補正し、HUD へ表示する。
4. typecheck/build/README/docs 更新を完了する。

## 受け入れ条件
- [x] Settings で Pilgrim / Trial / Martyr を循環選択できる
- [x] 設定はリロード後も保持される
- [x] 難易度に応じて combat sandbox の敵圧が変化する
- [x] typecheck / build が通る

## 検証コマンド
- `npm run typecheck`
- `npm run build`

## 既知の blocker
- なし

## feature flag / rollback
- `difficultyId` 読み込みが欠落/破損した場合は `pilgrim` へフォールバック。
