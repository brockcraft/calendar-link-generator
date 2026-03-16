// ── Add-to-Calendar .ics Uploader ──────────────────────────────────────────
// Receives .ics content from the HTML tool, saves it to a Drive folder,
// makes it publicly accessible, and returns the download URL.
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
// ──────────────────────────────────────────────────────────────────────────

const FOLDER_ID = '1jANRTAZw9ftMbOmfKs9b3DpkARgX2JDH';

function doPost(e) {
  try {
    const data     = JSON.parse(e.postData.contents);
    const filename = data.filename;
    const content  = data.content;

    const folder = DriveApp.getFolderById(FOLDER_ID);

    // Remove any existing file with the same name (clean re-upload)
    const existing = folder.getFilesByName(filename);
    while (existing.hasNext()) existing.next().setTrashed(true);

    // Create the file and make it accessible to anyone with the link
    const file = folder.createFile(filename, content, 'text/calendar');
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const url = 'https://drive.google.com/uc?export=download&id=' + file.getId();

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, url }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
