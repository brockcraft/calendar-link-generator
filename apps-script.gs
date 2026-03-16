// ── Add-to-Calendar .ics Uploader + Server ────────────────────────────────
// doPost: receives .ics content from the HTML tool, saves it to Drive.
// doGet:  serves the .ics file with text/calendar MIME type so iOS/macOS
//         shows "Add to Calendar" natively instead of triggering a download.
//
// SETUP (one-time):
//   1. Create a folder in Google Drive.
//   2. Open it — copy the folder ID from the URL:
//      drive.google.com/drive/folders/THIS_PART_IS_THE_ID
//   3. Paste it into FOLDER_ID below.
//   4. Click Deploy → New Deployment → type: Web App
//      Execute as: Me  |  Who has access: Anyone
//   5. Click Deploy → authorize when prompted → copy the Web App URL.
//   6. Paste the Web App URL into calendar-link-generator.html (APPS_SCRIPT_URL).
//
// TO UPDATE (after editing this script):
//   Deploy → Manage Deployments → pencil icon → Version: New version → Deploy
//   (keeps the same URL — do NOT create a new deployment)
// ──────────────────────────────────────────────────────────────────────────

const FOLDER_ID = '1jANRTAZw9ftMbOmfKs9b3DpkARgX2JDH';

// Serve a stored .ics file with text/calendar MIME type
// URL: <web-app-url>?file=<filename-without-extension>
function doGet(e) {
  try {
    const filename = (e.parameter.file || '') + '.ics';
    const folder   = DriveApp.getFolderById(FOLDER_ID);
    const files    = folder.getFilesByName(filename);
    if (!files.hasNext()) {
      return ContentService.createTextOutput('File not found').setMimeType(ContentService.MimeType.TEXT);
    }
    const content = files.next().getBlob().getDataAsString();
    return ContentService.createTextOutput(content).setMimeType(ContentService.MimeType.ICAL);
  } catch (err) {
    return ContentService.createTextOutput('Error: ' + err.message).setMimeType(ContentService.MimeType.TEXT);
  }
}

// Receive .ics content from the HTML tool and save it to Drive
function doPost(e) {
  try {
    const data     = JSON.parse(e.postData.contents);
    const filename = data.filename;
    const content  = data.content;
    const safeName = filename.replace(/\.ics$/i, '');

    const folder = DriveApp.getFolderById(FOLDER_ID);

    // Remove any existing file with the same name (clean re-upload)
    const existing = folder.getFilesByName(filename);
    while (existing.hasNext()) existing.next().setTrashed(true);

    // Save to Drive (no need to make public — served via doGet)
    folder.createFile(filename, content, 'text/calendar');

    // Return a doGet URL that serves the file with proper MIME type
    const url = ScriptApp.getService().getUrl() + '?file=' + encodeURIComponent(safeName);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, url }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
