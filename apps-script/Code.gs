const CONFIG = {
  DRIVE_FOLDER_ID: 'YOUR_GOOGLE_DRIVE_FOLDER_ID',
  SPREADSHEET_ID: 'YOUR_GOOGLE_SPREADSHEET_ID',
  GUIDE_LINK: 'YOUR_GUIDE_LINK',
  FROM_NAME: '머니라함'
};

const SCRIPT_VERSION = 'moneyraham-html-email-2026-06-26-v2';

const EMAIL_CONTENT = {
  badge: '머니라함 자료',
  title: '후기 인증 가이드북입니다',
  intro: [
    '후기 인증과 자료 신청 감사합니다.',
    '아래 버튼을 눌러 머니라함 가이드북을 확인해 주세요.',
    '주제와 자료만 바꿔 넣어도 다시 쓸 수 있도록, 핵심 내용을 순서대로 정리했습니다.'
  ],
  boxTitle: '가이드북에서 볼 수 있는 내용',
  items: [
    '후기 인증 후 자료를 확인하는 방법',
    '머니라함 안내 링크를 활용하는 방법',
    '추가 문의가 필요할 때 확인할 내용'
  ],
  buttonText: '가이드북 열기',
  footer: '본 메일은 머니라함 자료 신청에 따라 자동 발송되었습니다.',
  contact: '문의: naminsoo@aixlife.co.kr'
};

function doGet() {
  return jsonResponse({
    ok: true,
    version: SCRIPT_VERSION,
    fromName: CONFIG.FROM_NAME,
    driveFolderId: CONFIG.DRIVE_FOLDER_ID,
    guideLink: CONFIG.GUIDE_LINK,
    emailTitle: EMAIL_CONTENT.title,
    htmlEmail: true
  });
}

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
  const subject = `[${CONFIG.FROM_NAME}] ${EMAIL_CONTENT.title}`;
  const textBody = [
    EMAIL_CONTENT.title,
    '',
    ...EMAIL_CONTENT.intro,
    '',
    EMAIL_CONTENT.boxTitle,
    ...EMAIL_CONTENT.items.map((item, index) => `${index + 1}. ${item}`),
    '',
    `${EMAIL_CONTENT.buttonText}: ${CONFIG.GUIDE_LINK}`,
    '',
    EMAIL_CONTENT.footer,
    EMAIL_CONTENT.contact
  ].join('\n');

  MailApp.sendEmail({
    to: email,
    subject,
    body: textBody,
    htmlBody: buildEmailHtml(),
    name: CONFIG.FROM_NAME
  });
}

function buildEmailHtml() {
  const introHtml = EMAIL_CONTENT.intro
    .map((line) => `<p style="margin:0 0 14px;">${escapeHtml(line)}</p>`)
    .join('');

  const itemsHtml = EMAIL_CONTENT.items
    .map((item, index) => `<li style="margin:0 0 8px;">${index + 1}. ${escapeHtml(item)}</li>`)
    .join('');

  return `
    <div style="margin:0;padding:32px;background:#f6f8f3;font-family:Arial,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;color:#171717;">
      <div style="max-width:720px;margin:0 auto;background:#fffef9;border:1px solid #dfe7d9;border-radius:20px;padding:38px;">
        <div style="display:inline-block;background:#9be7b4;color:#07150d;border-radius:999px;padding:10px 16px;font-size:14px;font-weight:700;">
          ${escapeHtml(EMAIL_CONTENT.badge)}
        </div>

        <h1 style="margin:28px 0 18px;font-size:34px;line-height:1.25;color:#111111;font-weight:800;">
          ${escapeHtml(EMAIL_CONTENT.title)}
        </h1>

        <div style="font-size:17px;line-height:1.8;color:#4b4b4b;">
          ${introHtml}
        </div>

        <div style="margin:28px 0;padding:22px;border:1px solid #dfe7d9;border-radius:14px;background:#fbfcf7;">
          <strong style="display:block;margin-bottom:12px;font-size:18px;color:#111111;">
            ${escapeHtml(EMAIL_CONTENT.boxTitle)}
          </strong>
          <ol style="margin:0;padding-left:0;list-style:none;font-size:16px;line-height:1.8;color:#222222;">
            ${itemsHtml}
          </ol>
        </div>

        <a href="${escapeHtml(CONFIG.GUIDE_LINK)}" style="display:inline-block;background:#111111;color:#ffffff;text-decoration:none;border-radius:12px;padding:16px 24px;font-size:17px;font-weight:700;">
          ${escapeHtml(EMAIL_CONTENT.buttonText)}
        </a>

        <p style="margin:30px 0 0;font-size:14px;line-height:1.7;color:#777777;">
          ${escapeHtml(EMAIL_CONTENT.footer)}<br>
          ${escapeHtml(EMAIL_CONTENT.contact)}
        </p>
      </div>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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
