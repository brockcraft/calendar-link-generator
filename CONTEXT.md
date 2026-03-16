# Add-to-Calendar Link Generator — Project Context

## What this is

A self-contained, single-file HTML tool (`calendar-link-generator.html`) that generates "Add to Calendar" button embed code for use in Mailchimp HTML emails. It is a local tool — no server, no dependencies, no build step. Open it in any browser.

The problem it solves: Mailchimp has no native "add to calendar" feature. Third-party tools like AddEvent and RSVPify do this but charge money. This tool replicates that functionality for free.

---

## How it works

The tool generates URL-based calendar links for four providers, plus a downloadable `.ics` file for Apple:

| Provider | Method |
|---|---|
| Google Calendar | URL parameter link to `calendar.google.com/calendar/render` |
| Outlook.com | URL parameter link to `outlook.live.com/calendar/0/deeplink/compose` |
| Office 365 | URL parameter link to `outlook.office.com/calendar/0/deeplink/compose` |
| Yahoo Calendar | URL parameter link to `calendar.yahoo.com` |
| Apple / iCal | Requires a hosted `.ics` file (see important note below) |

The generated output is a `<table>`-wrapped block of HTML anchor tags with inline styles, ready to paste into a Mailchimp **Code** content block (the `</>` icon in the drag-and-drop editor).

---

## Key technical decisions

### Apple Calendar requires a hosted .ics file
Email clients strip `data:` URIs from links for security reasons, so you cannot embed the `.ics` file inline. The workflow is:
1. The tool generates and lets the user download a `.ics` file.
2. The user hosts it somewhere publicly accessible (their own site, Dropbox public link, Google Drive "Anyone with link" share).
3. The user pastes the public URL into the **Apple .ics Hosted URL** field and regenerates.

The Apple button in the preview uses a `data:` URI so the user can test it locally (it triggers a download). In the actual email embed, it must be a real hosted URL.

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
- **Button style tabs** — Colored (brand colors per provider), Dark (all black), Outline (white bg + colored border)
- **Light mode UI** — white/light-gray theme with blue (`#3b6ff5`) accent
- **Copy buttons** — one-click copy for the embed HTML and raw ICS content
- **ICS download** — downloads the generated `.ics` file directly from the browser

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
- A "copy all" button that copies the full embed block in one click
- Option to customize the "Add to your calendar:" label text
- Preview of what the buttons will look like in a simulated email frame
- Export/save event presets for reuse
