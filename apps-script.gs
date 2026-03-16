// ── Add-to-Calendar .ics Publisher ───────────────────────────────────────
// Receives .ics content from the HTML tool, commits it to the GitHub repo,
// and returns the GitHub Pages URL — a clean .ics link that works on all
// platforms (iOS "Add to Calendar" prompt, macOS double-click, etc.)
//
// SETUP (one-time):
//   1. Create a GitHub PAT: github.com → Settings → Developer Settings →
//      Personal access tokens → Tokens (classic) → Generate new token
//      Scopes: check "public_repo" → Generate → copy the token.
//   2. In the Apps Script editor: Project Settings (gear) → Script Properties
//      Add: Key = GITHUB_TOKEN  Value = [paste token] → Save
//   3. Deploy → Manage Deployments → pencil → New version → Deploy
//      (keeps the same URL — do NOT create a new deployment)
// ──────────────────────────────────────────────────────────────────────────

const GITHUB_REPO  = 'brockcraft/calendar-link-generator';
const GITHUB_OWNER = 'brockcraft';
const ICS_DIR      = 'ics';

function doPost(e) {
  try {
    const data     = JSON.parse(e.postData.contents);
    const filename = data.filename;  // e.g. "HCEC-Meetup.ics"
    const content  = data.content;

    const token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
    if (!token) throw new Error('GITHUB_TOKEN script property not set');

    const path    = ICS_DIR + '/' + filename;
    const apiUrl  = 'https://api.github.com/repos/' + GITHUB_REPO + '/contents/' + path;
    const headers = {
      'Authorization': 'Bearer ' + token,
      'Content-Type':  'application/json',
      'Accept':        'application/vnd.github+json'
    };

    // Check if the file already exists (need its SHA to update)
    let sha = null;
    const getRes = UrlFetchApp.fetch(apiUrl, { method: 'GET', headers, muteHttpExceptions: true });
    if (getRes.getResponseCode() === 200) {
      sha = JSON.parse(getRes.getContentText()).sha;
    }

    // Commit the file (create or update)
    const body = {
      message: (sha ? 'Update ' : 'Add ') + filename,
      content: Utilities.base64Encode(Utilities.newBlob(content, 'text/calendar').getBytes())
    };
    if (sha) body.sha = sha;

    const putRes = UrlFetchApp.fetch(apiUrl, {
      method:  'PUT',
      headers,
      payload: JSON.stringify(body),
      muteHttpExceptions: true
    });

    const code = putRes.getResponseCode();
    if (code !== 200 && code !== 201) {
      throw new Error('GitHub API error ' + code + ': ' + putRes.getContentText());
    }

    const url = 'https://' + GITHUB_OWNER + '.github.io/calendar-link-generator/' + path;

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, url }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
