const CONFIG = {
  DRIVE_FOLDER_ID: 'YOUR_GOOGLE_DRIVE_FOLDER_ID',
  SPREADSHEET_ID: 'YOUR_GOOGLE_SPREADSHEET_ID',
  GUIDE_LINK: 'YOUR_GUIDE_LINK',
  FROM_NAME: '머니라함'
};

function doPost(event) {
  try {
    const payload = JSON.parse(event.postData.contents);
    const result = handleReviewRequest(payload);
    return jsonResponse({ ok: true, ...result });
  } catch (error) {
    return jsonResponse({
      ok: false,
      message: error.message || '신청 처리 중 오류가 발생했습니다.'
    });
  }
}

function handleReviewRequest(payload) {
  const email = String(payload.email || '').trim();
  const fileName = String(payload.fileName || 'capture.png').trim();
  const mimeType = String(payload.mimeType || '').trim();
  const fileData = String(payload.fileData || '');

  if (!isValidEmail(email)) {
    throw new Error('이메일 주소가 올바르지 않습니다.');
  }

  if (!fileData.startsWith('data:image/')) {
    throw new Error('이미지 파일이 올바르지 않습니다.');
  }

  const savedFile = saveImageToDrive(fileData, fileName, mimeType, email);
  let status = 'SENT';
  let errorMessage = '';

  try {
    sendGuideEmail(email);
  } catch (error) {
    status = 'FAILED';
    errorMessage = error.message || String(error);
  }

  appendSheetRow({
    email,
    imageFileName: savedFile.getName(),
    imageUrl: savedFile.getUrl(),
    status,
    errorMessage
  });

  if (status === 'FAILED') {
    throw new Error('이미지는 저장되었지만 이메일 발송에 실패했습니다.');
  }

  return {
    imageUrl: savedFile.getUrl(),
    status
  };
}

function saveImageToDrive(fileData, originalFileName, mimeType, email) {
  const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
  const base64 = fileData.split(',')[1];
  const bytes = Utilities.base64Decode(base64);
  const safeEmail = email.replace(/[^a-zA-Z0-9@._-]/g, '_');
  const extension = getExtension(originalFileName, mimeType);
  const fileName = `${formatDate(new Date())}_${safeEmail}.${extension}`;
  const blob = Utilities.newBlob(bytes, mimeType, fileName);

  return folder.createFile(blob);
}

function appendSheetRow(data) {
  const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheets()[0];
  sheet.appendRow([
    new Date(),
    data.email,
    data.imageFileName,
    data.imageUrl,
    CONFIG.GUIDE_LINK,
    data.status,
    data.errorMessage
  ]);
}

function sendGuideEmail(email) {
  const subject = '[머니라함] 후기 인증 가이드 링크를 보내드립니다';
  const body = [
    '안녕하세요. 머니라함입니다.',
    '',
    '후기 인증 신청이 접수되어 가이드 링크를 보내드립니다.',
    CONFIG.GUIDE_LINK,
    '',
    '본 메일은 후기 인증 신청 후 자동으로 발송되었습니다.',
    '감사합니다.'
  ].join('\n');

  MailApp.sendEmail({
    to: email,
    subject,
    body,
    name: CONFIG.FROM_NAME
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getExtension(fileName, mimeType) {
  const extension = String(fileName).split('.').pop().toLowerCase();
  if (['jpg', 'jpeg', 'png', 'webp'].includes(extension)) {
    return extension;
  }

  const mimeMap = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp'
  };

  return mimeMap[mimeType] || 'png';
}

function formatDate(date) {
  return Utilities.formatDate(date, 'Asia/Seoul', 'yyyy-MM-dd_HHmmss');
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
