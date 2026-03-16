# Add-to-Calendar Link Generator

A single-file HTML tool that generates "Add to Calendar" button embed code for Mailchimp HTML emails.

## Files

| File | Description |
|------|-------------|
| `calendar-link-generator.html` | The tool — open in any browser, no build step |
| `apps-script.gs` | Google Apps Script backend — publishes `.ics` files to this repo via GitHub API |
| `ics/` | Hosted `.ics` files served via GitHub Pages |

## How it works

Generates calendar links for Google, Outlook.com, Office 365, Yahoo, and Apple Calendar. The output is a `<table>`-based HTML block with inline styles — paste it into a Mailchimp **Code** (`</>`) content block.

Form values are automatically saved to `localStorage` and restored on reload. A **Clear This Form** button resets everything back to defaults.

Apple Calendar requires a hosted `.ics` file (email clients strip `data:` URIs). Clicking **Publish to GitHub** sends the `.ics` to the Apps Script backend, which commits it here and returns the GitHub Pages URL — a real `.ics` link that triggers iOS "Add to Calendar" and macOS Calendar on double-click.

## Setup (Apps Script backend)

1. Create a GitHub classic PAT with `public_repo` scope at github.com/settings/tokens
2. In the Apps Script editor: **Project Settings → Script Properties** → add `GITHUB_TOKEN` = your token
3. Deploy as a Web App: **Execute as: Me**, **Who has access: Anyone**
4. Paste the deployment URL into `APPS_SCRIPT_URL` in `calendar-link-generator.html`

## GitHub Pages URL pattern

```
https://brockcraft.github.io/calendar-link-generator/ics/<filename>.ics
```
