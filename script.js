const form = document.querySelector('#review-form');
const fileInput = document.querySelector('#capture');
const fileButton = document.querySelector('.file-trigger');
const fileLabel = document.querySelector('#file-label');
const submitButton = document.querySelector('#submit-button');
const statusMessage = document.querySelector('#status-message');

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

fileButton.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  fileLabel.textContent = file ? file.name : '이미지 선택';
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearStatus();

  const endpoint = window.MIDAM_CONFIG?.GOOGLE_APPS_SCRIPT_WEB_APP_URL || '/.netlify/functions/submit-review';
  const file = fileInput.files[0];
  const email = form.email.value.trim();
  const consent = form.consent.checked;

  if (!endpoint) {
    showStatus('Netlify Function 또는 Apps Script 웹앱 URL이 아직 연결되지 않았습니다.', 'error');
    return;
  }

  if (!file) {
    showStatus('카카오톡 후기 캡처 이미지를 선택해 주세요.', 'error');
    return;
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    showStatus('jpg, png, webp 이미지 파일만 업로드할 수 있습니다.', 'error');
    return;
  }

  if (file.size > MAX_FILE_SIZE) {
    showStatus('이미지는 10MB 이하로 업로드해 주세요.', 'error');
    return;
  }

  if (!isValidEmail(email)) {
    showStatus('이메일 주소를 올바르게 입력해 주세요.', 'error');
    return;
  }

  if (!consent) {
    showStatus('개인정보 수집 및 이용에 동의해 주세요.', 'error');
    return;
  }

  try {
    setLoading(true);
    const fileData = await toDataUrl(file);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({
        email,
        fileName: file.name,
        mimeType: file.type,
        fileData
      })
    });

    const result = await response.json();

    if (!result.ok) {
      throw new Error(result.message || '신청 처리 중 오류가 발생했습니다.');
    }

    form.reset();
    fileLabel.textContent = '이미지 선택';
    showStatus('신청 완료! 입력한 이메일로 가이드 링크를 보냈습니다.', 'success');
  } catch (error) {
    showStatus(error.message || '잠시 후 다시 시도해 주세요.', 'error');
  } finally {
    setLoading(false);
  }
});

function toDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('이미지를 읽지 못했습니다.'));
    reader.readAsDataURL(file);
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function setLoading(isLoading) {
  submitButton.disabled = isLoading;
  submitButton.textContent = isLoading ? '발송 중입니다...' : '가이드 링크 메일 받기';
}

function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
}

function clearStatus() {
  statusMessage.textContent = '';
  statusMessage.className = 'status-message';
}
