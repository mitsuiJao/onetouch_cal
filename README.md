# One-Touch Calendar

One-Touch Calendar is a Chrome Extension that lets you create Google Calendar events from a small popup UI without opening the full Calendar page first.

## What this repository contains

- `manifest.json`: Extension metadata, permissions, and Google OAuth scope configuration.
- `popup.html` / `popup.js`: Main event creation UI and logic.
- `options.html` / `options.js`: Settings page for default duration, auto-close behavior, and auth reset.
- `style.css`: Shared styling for popup and options pages.

## Features

- Create events for a selected date with subject and optional start/end times.
- If only a start time is entered, the end time is calculated from the configured default duration.
- If no times are entered, an all-day event is created.
- One-click access to extension settings from the popup.
- Optional auto-close after successful event creation.

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
