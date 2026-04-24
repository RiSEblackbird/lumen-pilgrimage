# Task: reforge-phase4-continue-hardening

## 目的
Phase 4 継続として、continue 復帰データの安定性を改善し、表示名依存の mission 復帰を廃止して ID ベースへ移行する。

## 非目標
- boss AI 本実装
- hub 恒久成長 UI 実装
- 新規 biome 追加

## 対象範囲
- snapshot に missionId を保存し、旧 save は missionName から互換復帰
- CombatSandboxDirector の復帰解決を missionId 優先へ変更
- Phase 表記から小数点分割を除去
- README / docs / progress 更新

## マイルストーン
- [x] M1: 現状確認（git/log/progress）
- [x] M2: missionId 永続化と互換パース
- [x] M3: sandbox 復帰の mission 解決を安定化
- [x] M4: ドキュメント更新（Phase 小数点表記の除去含む）
- [x] M5: typecheck/build

## 受け入れ条件
- [x] 新形式 save は missionId を保存する
- [x] 旧形式 save（missionId 未保存）でも復帰が成立する
- [x] 文書上の Phase 表記に小数点分割を使わない
- [x] `npm run typecheck` と `npm run build` が成功する

## 検証コマンド
- `npm run typecheck`
- `npm run build`

## 既知 blocker
- continue/new game の手動分岐 UI は未実装

## 再開コマンド
- `cd /workspace/lumen-pilgrimage && git status -sb`
- `npm run typecheck`
- `npm run build`
