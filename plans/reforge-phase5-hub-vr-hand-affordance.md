# reforge-phase5-hub-vr-hand-affordance

## 目的
Hub の XR 端末操作で、どちらの手の pointer が terminal を lock しているかを world 側 affordance と wrist prompt の両方で即時判別できるようにし、誤操作時の認知負荷を下げる。

## 非目標
- Hub terminal の機能追加や新 terminal 追加
- 戦闘・expedition ロジックの改修
- XR 入力の根本的な raycast 方式変更

## 対象範囲
- `src/world/hub/PilgrimsBelfryScene.ts`
- `src/world/hub/HubTerminalDirector.ts`
- `src/core/Game.ts`
- `src/game/ui/VrWristUi.ts`
- `README.md`

## マイルストーン
1. Hub terminal 選択 index/anchor 解決を label 依存から index 依存へ整理する。
2. XR pointer hit 時に left/right hand 別の world-space beacon を selected terminal へ追従表示する。
3. pointer 未接続・未ヒット時に affordance を安全にクリアし、wrist prompt と同期する。
4. typecheck/build で回帰がないことを確認する。

## 受け入れ条件
- XR presenting + Hub 状態で pointer hit した場合、selected terminal に hand-specific beacon が表示される。
- pointer が外れた場合または Hub 以外では beacon が非表示化される。
- wrist prompt が hand lock 情報と矛盾しない。
- `npm run typecheck` と `npm run build` が通る。

## 検証コマンド
- `npm run typecheck`
- `npm run build`

## 既知の blocker
- なし。

## feature flag / rollback 方針
- 追加 affordance は Hub scene 内で閉じるため、問題時は beacon 生成と更新処理を revert して以前の pointer prompt のみに戻せる。
