# Task: reforge-phase5-encounter-variety-expansion

## 目的
Phase 5 の encounter variety を拡張し、既存 8 系統に加えて推奨ミッション系統をデータ定義へ取り込み、run 中のミッション回転で戦術変化を増やす。

## 非目標
- 各追加ミッション専用の新規 UI フローや個別ゲームルール実装
- 新敵/新 biome 実装

## 対象範囲
- `src/game/encounters/MissionTypes.ts` の mission カタログ拡張
- README 上の mission 仕様説明更新

## マイルストーン
- [x] 追加対象ミッションの定義方針を決定（stealth-lite / puzzle-combat / boss remix / endless collapse）
- [x] mission データを追加し、既存型・ローテーション互換を維持
- [x] typecheck / build / content validation を実行
- [x] README の実装範囲説明を更新

## 受け入れ条件
- [x] `MISSION_TYPE_DEFS` に追加推奨 4 系統が実装されている
- [x] 既存 8 系統 ID に破壊的変更がない
- [x] 検証コマンドが成功し、buildable state を維持

## 検証コマンド
- `npm run typecheck`
- `npm run build`
- `npm run validate:content`

## 既知 blocker
- 追加ミッションの専用 encounter rule（例: 真の stealth 判定、個別勝利条件）は別タスクで実装が必要

## Feature Flag / Rollback
- 追加ミッションは定義配列から削除するだけでロールバック可能
- 既存ミッション ID を変更しないことで save/continue 互換性を維持
