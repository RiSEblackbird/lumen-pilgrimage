# Task Execution Process (Agent-Agnostic)

## Purpose
長大タスクで過剰に停止したり、受け入れ条件未達の細かい PR が乱立することを防ぐ。

## Standard Flow
1. `plans/<task-id>.md` を作成または更新する。
2. 受け入れ条件と検証コマンドを先に確定する。
3. マイルストーン単位で実装し、完了ごとに検証する。
4. blocker がなければ次のマイルストーンへ進む。
5. 受け入れ条件をすべて満たした後に通常 PR を作成する。

## Progress and Intermediate Output
- 中間共有は計画ファイルの更新、ステータス更新、ローカルコミットを基本とする。
- 早期共有が必要な場合のみ Draft PR を利用する。
- 通常 PR は完成条件達成後のみ作成する。

## Stop Conditions
停止可能なのは次の場合に限定する。
- 外部依存や権限不足で実質的に blocked
- 要件衝突により合理的仮定では進行不能
- 破壊的変更の是非を文書規約だけで決定不能

## Stop State Requirements
停止直前に、計画ファイルの状態を必ず整合させる。
- マイルストーンやチェック項目を `Done / Blocked / Cancelled` へ更新する
- `pending` や `in_progress` を放置しない
- `Blocked` には停止理由と再開条件を記載する
- 次に実行すべき最短アクションを残す

## Alignment Rule
- ルート `AGENTS.md` は全体の進行原則を定義する。
- サブディレクトリ `AGENTS.md` は実装規約・検証コマンドなど領域特有事項を定義する。
- 進行原則（計画、継続、停止、PRタイミング）は全体で矛盾させない。
