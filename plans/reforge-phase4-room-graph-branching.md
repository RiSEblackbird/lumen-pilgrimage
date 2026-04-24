# Task: reforge-phase4-room-graph-branching

## 目的
EncounterDirector の linear room 進行を廃止し、room graph による分岐導線（risk / recovery / secret）を導入する。

## 非目標
- biome 固有敵ファミリーの増量
- contract ごとの分岐重み調整
- room graph の自動生成

## 対象範囲
- EncounterRuleSet を room graph データ構造へ拡張
- EncounterDirector に分岐選択ロジックを追加
- progress 表示へ route style を反映
- README / docs / progress 更新

## マイルストーン
- [x] M1: room graph データ構造を追加
- [x] M2: clear 結果に応じた route 選択を実装
- [x] M3: sector 進行を roomsPerSector ベースへ更新
- [x] M4: ドキュメント更新
- [x] M5: typecheck/build

## 受け入れ条件
- [x] linear 固定ではなく room graph から次 room が選ばれる
- [x] clear pace / 被ダメ結果で risk/recovery 優先度が変わる
- [x] encounter ラベルに route style が表示される
- [x] `npm run typecheck` と `npm run build` が成功

## 検証コマンド
- `npm run typecheck`
- `npm run build`

## 既知 blocker
- room graph は現在 Ember/Moon の 2 biome のみ
- route 選択は deterministic だが mission type 連動は未実装

## Feature Flag / Rollback
- `EncounterDirector.moveToNextRoom` の分岐選択を固定 edge 選択へ戻せば linear 互換へ戻せる

## 再開コマンド
- `cd /workspace/lumen-pilgrimage && git status -sb`
- `npm run dev`
