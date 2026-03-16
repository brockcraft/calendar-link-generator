# Add-to-Calendar Link Generator — Project Context

## What this is

A self-contained, single-file HTML tool (`calendar-link-generator.html`) that generates "Add to Calendar" button embed code for use in Mailchimp HTML emails. Hosted on GitHub Pages — no local setup required. Open it in any browser.

The problem it solves: Mailchimp has no native "add to calendar" feature. Third-party tools like AddEvent and RSVPify do this but charge money. This tool replicates that functionality for free.

**Tool URL:** https://brockcraft.github.io/calendar-link-generator/calendar-link-generator.html
**GitHub repo:** https://github.com/brockcraft/calendar-link-generator

---

## How it works

The tool generates URL-based calendar links for four providers, plus a hosted `.ics` file for Apple:

| Provider | Method |
|---|---|
| Google Calendar | URL parameter link to `calendar.google.com/calendar/render` |
| Outlook.com | URL parameter link to `outlook.live.com/calendar/0/deeplink/compose` |
| Office 365 | URL parameter link to `outlook.office.com/calendar/0/deeplink/compose` |
| Yahoo Calendar | URL parameter link to `calendar.yahoo.com` |
| Apple / iCal | `.ics` file published to GitHub Pages via Apps Script backend |

The generated output is a `<table>`-wrapped block of HTML anchor tags with inline styles, ready to paste into a Mailchimp **Code** content block (the `</>` icon in the drag-and-drop editor).

---

## Key technical decisions

### Apple Calendar requires a hosted .ics file
Email clients strip `data:` URIs from links for security reasons, so you cannot embed the `.ics` file inline. The workflow is:
1. The tool generates an `.ics` file in memory.
2. The user clicks **Publish to GitHub** — this POSTs the `.ics` content to a Google Apps Script Web App.
3. The Apps Script backend commits the file to the GitHub repo via the GitHub Contents API.
4. The returned GitHub Pages URL (e.g. `https://brockcraft.github.io/calendar-link-generator/ics/Event-Name.ics`) is injected into the Apple Calendar button automatically.

The Apple button in the preview uses a `data:` URI so the user can test it locally. After publishing, the embed uses the real hosted URL — which triggers iOS "Add to Calendar" and macOS Calendar on double-click.

### Apps Script backend
- Acts as a CORS-safe proxy between the browser and the GitHub API (browsers can't call the GitHub API directly from a hosted page without CORS issues).
- Receives `.ics` content as `text/plain` POST body (avoids preflight OPTIONS request).
- Stores a GitHub classic PAT (with `public_repo` scope) in Script Properties — never in code.
- Deployed as: **Execute as: Me**, **Who has access: Anyone**.
- Deployment URL stored in `APPS_SCRIPT_URL` constant in the HTML.

### Email HTML uses table layout + inline styles
All generated button HTML uses `<table>` wrappers and fully inline CSS. This is intentional — email clients (especially Outlook) strip `<style>` blocks and ignore external stylesheets. Inline styles are the only reliable approach.

### Date/time handling
- Google and Yahoo use a compact format: `YYYYMMDDTHHMMSS` (local time, no Z suffix)
- Outlook uses ISO 8601: `YYYY-MM-DDTHH:MM:SS`
- The `.ics` file uses `DTSTART;TZID=<tz>:YYYYMMDDTHHMMSS` with the user-selected IANA timezone string

---

## UI features

- **Custom calendar date picker** — clicking the date field opens a month-grid popup with prev/next navigation. Today is highlighted; past dates are dimmed. Clicking outside closes it.
- **Calendar toggles** — checkboxes to include/exclude any of the five providers
- **Button style** — Outline (white background + colored border per provider), hardcoded
- **Light mode UI** — white/light-gray theme with blue (`#3b6ff5`) accent
- **Copy Embed Code** — one-click copy for the embed HTML
- **Publish to GitHub** — publishes the `.ics` file and auto-updates the Apple button URL

---

## Output sections (after Generate)

1. **Preview** — live preview of the calendar buttons
2. **Step 1: Apple / iCal** — "Publish to GitHub" button (only shown if Apple is checked)
3. **Step 2: HTML Embed Code** — the table HTML to paste into Mailchimp

---

## Fonts & styling

- **Syne** (headings, generate button) — Google Fonts
- **DM Sans** (body, form inputs)
- **DM Mono** (labels, code blocks, section headers)
- Accent color: `#3b6ff5`
- All CSS variables defined in `:root` at the top of the `<style>` block

---

## What has NOT been built yet (possible next steps)

- Multi-day event support (currently assumes single-day)
- All-day event toggle
- Recurring event support
- Option to customize the "Add to your calendar:" label text
- Export/save event presets for reuse
