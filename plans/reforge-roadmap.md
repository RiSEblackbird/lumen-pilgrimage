# Task: lumen-pilgrimage-reforge-roadmap

## 目的
Lumen Pilgrimage を ritual/glyph 中心デモから、XR/flat 正式対応のアクション探索ゲームへ段階移行する。

## 非目標
- 既存デモ表現の温存
- 進行報酬を JSON export や常設説明パネルへ依存させる設計

## 対象範囲
- Phase 1: 基盤再編（state/input/save/hub）
- Phase 2: プレイヤー操作と戦闘 sandbox
- Phase 3: encounter 量産へ向けた敵圧制御と mission データ化
- Phase 4 以降: biome/campaign/postgame/perf 仕上げ

## マイルストーン
- [x] Phase 1: 基盤再編
- [x] Phase 2: 戦闘 sandbox（guard/parry/telegraph 含む）
- [x] Phase 3: enemy coordinator + mission/reward/relic 基盤
- [ ] Phase 4: Hub 完成 + Ember Ossuary + Moon Reservoir（EncounterDirector 着手済み）
- [ ] Phase 5: 残り biome + campaign 完成
- [ ] Phase 6: 美術/照明/音響の総仕上げ
- [ ] Phase 7: postgame（contracts/boss rush/endless）
- [ ] Phase 8: 性能最適化 + QA + release

## 受け入れ条件
- [x] ritual/glyph/export 依存を主経路から分離
- [x] combat sandbox で攻防ループを確認可能
- [x] enemy pressure / mission variety / reward relic 基盤をデータ駆動で実装
- [ ] campaign クリア可能状態
- [ ] hub + 5 biomes + final zone + 反復モードを実装

## 検証コマンド
- `npm run typecheck`
- `npm run build`

## 既知 blocker
- room graph 本体、relic効果適用ロジック、Hub 恒久成長 UI が未着手（continue snapshot は表示済み）

## Feature Flag / Rollback
- sandbox は `Game` の `CombatSandboxDirector` 接続で制御可能
- mission/coordinator 連携は `CombatSandboxDirector` 内で局所的に無効化可能

## 再開コマンド
- `cd /workspace/lumen-pilgrimage && git status -sb`
- `npm run dev`
