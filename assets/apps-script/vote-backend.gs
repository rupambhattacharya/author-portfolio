/**
 * Song Vote backend — deployed as an Apps Script Web App.
 * Sheet columns: timestamp | song | ip
 */
const SHEET_NAME = 'Votes';
const ALLOWED_SONGS = ['highNoon', 'afterTheRain'];

function doGet(e) {
  const action = e.parameter.action;
  if (action === 'vote') return handleVote(e);
  if (action === 'counts') return handleCounts();
  return jsonResponse({ error: 'unknown action' });
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['timestamp', 'song', 'ip']);
  }
  return sheet;
}

function tally() {
  const rows = getSheet().getDataRange().getValues();
  let highNoon = 0, afterTheRain = 0;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === 'highNoon') highNoon++;
    else if (rows[i][1] === 'afterTheRain') afterTheRain++;
  }
  return { highNoon: highNoon, afterTheRain: afterTheRain };
}

function ipAlreadyVoted(ip) {
  const rows = getSheet().getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][2] === ip) return true;
  }
  return false;
}

function handleVote(e) {
  const song = e.parameter.song;
  const ip = e.parameter.ip || 'unknown';

  if (ALLOWED_SONGS.indexOf(song) === -1) {
    return jsonResponse({ error: 'invalid song' });
  }

  const alreadyVoted = ip !== 'unknown' && ipAlreadyVoted(ip);
  if (!alreadyVoted) {
    getSheet().appendRow([new Date(), song, ip]);
  }

  const counts = tally();
  return jsonResponse({
    highNoon: counts.highNoon,
    afterTheRain: counts.afterTheRain,
    alreadyVoted: alreadyVoted
  });
}

function handleCounts() {
  const counts = tally();
  return jsonResponse({
    highNoon: counts.highNoon,
    afterTheRain: counts.afterTheRain,
    alreadyVoted: false
  });
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
