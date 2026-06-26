# 머니라함 후기 인증 메일 발송 페이지

카카오톡 후기 캡처 이미지를 업로드하고 이메일을 입력하면, 지정된 링크를 이메일로 발송하는 1페이지 웹사이트 프로젝트입니다.

초기 MVP는 Google Apps Script를 서버처럼 사용합니다.

- 이미지 저장: Google Drive
- 신청 기록: Google Sheets
- 이메일 발송: GmailApp 또는 MailApp
- 화면: HTML, CSS, JavaScript 1페이지

## 현재 문서

- `PRD.md`: 제품 요구사항 문서
- `IDE.md`: 개발 환경, 구글 연동, GitHub 작업 가이드
- `apps-script/Code.gs`: GitHub에 올려도 되는 Apps Script 샘플
- `apps-script/Code.local.gs`: 실제 구글 ID가 들어간 로컬 전용 파일

## 다음 단계

1. Google Apps Script에 `apps-script/Code.local.gs` 내용을 붙여넣기
2. Apps Script 웹앱 배포
3. 로컬 테스트는 `config.local.js`에 배포 URL을 넣고 `index.html`을 브라우저에서 열기
4. Netlify 배포 시 환경변수 `GOOGLE_APPS_SCRIPT_WEB_APP_URL`에 Apps Script 웹앱 URL 넣기
5. 실제 발송 테스트 진행

## 보안 주의

아래 값은 GitHub에 올리지 않습니다.

- Apps Script 배포 URL
- Google Drive 폴더 ID
- Google Sheets 스프레드시트 ID
- 개인 계정 정보
- API 키 또는 비밀번호

이 프로젝트에서는 `.env`, `config.local.js`, `apps-script/Code.local.gs`를 GitHub에 올리지 않도록 `.gitignore`에 등록해두었습니다.

## Netlify 배포 설정

Netlify에서 GitHub 저장소를 연결한 뒤 아래 환경변수를 추가합니다.

```text
GOOGLE_APPS_SCRIPT_WEB_APP_URL=https://script.google.com/macros/s/배포ID/exec
```

빌드 명령은 비워두고, 배포 폴더는 루트 `.`를 사용하면 됩니다. `netlify.toml`에 기본 설정이 포함되어 있습니다.
