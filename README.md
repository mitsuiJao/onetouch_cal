# One-Touch Calendar

![banner](./image/ontouch-calendar.png)

https://chromewebstore.google.com/detail/one-touch-calendar/lmgkjjlpffgiklcbecgfkhboifoeohee

One-Touch Calendar is a Chrome Extension that lets you create Google Calendar events from a small popup UI without opening the full Calendar page first.

> 日本語は英語の後に続きます

## What this repository contains

- `manifest.json`: Extension metadata, permissions, and Google OAuth scope configuration.
- `popup.html` / `popup.js`: Main event creation UI and logic.
- `options.html` / `options.js`: Settings page for default duration, auto-close delay, and auth reset.
- `style.css`: Shared styling for popup and options pages.

## Features

- Create events for a selected date with subject and optional start/end times.
- If only a start time is entered, the end time is calculated from the configured default duration.
- If no times are entered, an all-day event is created.
- One-click access to extension settings from the popup.
- Configurable auto-close delay (3/5/8/10 seconds, or never) after successful event creation.
- Undo button to delete the just-created event within that delay window.

## Permissions used

- `identity`: For Google account OAuth authentication.
- `storage`: To save extension settings.
- `https://www.googleapis.com/*` host permission: To call Google Calendar API.
- OAuth scope: `https://www.googleapis.com/auth/calendar.events`.

## Local usage (development)

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select this repository folder.
4. Open the extension popup and sign in when prompted.
5. Add an event.

## Notes

- This project is currently a plain HTML/CSS/JavaScript extension with no build step.
- No automated tests are configured in this repository at this time.

---

# One-Touch Calendar（日本語）

One-Touch Calendar は、Google カレンダー本体を開かなくても、ポップアップ UI から予定をすばやく作成できる Chrome 拡張です。

## このリポジトリに含まれるもの

- `manifest.json`: 拡張機能のメタデータ、権限、Google OAuth スコープ設定
- `popup.html` / `popup.js`: 予定追加用ポップアップ画面とそのロジック
- `options.html` / `options.js`: 既定の予定時間、閉じるまでの時間、認証リセットなどの設定画面
- `style.css`: ポップアップと設定画面で共通利用するスタイル

## 主な機能

- 件名・日付・開始/終了時刻（任意）を入力して予定を作成
- 開始時刻のみ入力した場合、設定された既定時間から終了時刻を自動計算
- 時刻を入力しない場合、終日予定として作成
- ポップアップからワンクリックで設定画面へ移動
- 予定作成成功後にポップアップを閉じるまでの時間を設定可能(3/5/8/10秒、または閉じない)
- 取り消し(Undo)ボタンで、閉じるまでの間に直近追加した予定を削除できる

## 利用する権限

- `identity`: Google アカウント OAuth 認証に利用
- `storage`: 拡張機能の設定保存に利用
- `https://www.googleapis.com/*`（host permission）: Google Calendar API 呼び出しに利用
- OAuth scope: `https://www.googleapis.com/auth/calendar.events`

## ローカルでの利用（開発）

1. `chrome://extensions` を開く
2. **Developer mode** を有効化
3. **Load unpacked** でこのリポジトリフォルダを選択
4. 拡張機能のポップアップを開き、必要に応じてサインイン
5. 予定を追加

## 補足

- このプロジェクトはプレーンな HTML/CSS/JavaScript で構成されており、ビルド手順はありません。
- 現時点では自動テストは設定されていません。
