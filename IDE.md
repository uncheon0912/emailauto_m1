# 머니라함 후기 인증 페이지 IDE / 개발 가이드

이 문서는 초보자 기준으로 로컬 PC, GitHub, 구글 드라이브, 구글 스프레드시트를 연결해 머니라함 후기 인증 1페이지 웹사이트를 구현하기 위한 작업 순서다.

## 1. 추천 개발 도구

- 코드 편집기: Visual Studio Code
- 브라우저: Chrome
- 버전 관리: GitHub Desktop 또는 Git CLI
- 구글 도구: Google Drive, Google Sheets, Google Apps Script

초기 버전은 HTML, CSS, JavaScript만으로 만든다. 복잡한 서버를 직접 운영하지 않고, 구글 Apps Script를 서버처럼 사용한다.

## 2. 추천 폴더 구조

```text
autoemailsend/
  index.html
  styles.css
  script.js
  config.example.js
  config.local.js
  apps-script/
    Code.gs
    Code.local.gs
  PRD.md
  IDE.md
  README.md
  .env.example
  .gitignore
```

각 파일 역할:

- `index.html`: 1페이지 웹사이트 화면
- `styles.css`: ORYZO 스타일을 적용한 머니라함 디자인
- `script.js`: 파일 업로드, 이메일 검증, Apps Script 호출
- `config.example.js`: GitHub에 올리는 설정 예시 파일
- `config.local.js`: 내 컴퓨터에서만 쓰는 실제 Apps Script 배포 URL 파일
- `apps-script/Code.gs`: GitHub에 올려도 되는 Apps Script 샘플 코드
- `apps-script/Code.local.gs`: 실제 구글 ID가 들어간 로컬 전용 Apps Script 코드
- `PRD.md`: 제품 요구사항 문서
- `IDE.md`: 개발 환경과 구현 순서
- `.env.example`: 필요한 설정값 이름 예시
- `.gitignore`: GitHub에 올리면 안 되는 파일 제외

## 3. 구글 드라이브 폴더 만들기

1. Google Drive에 접속한다.
2. 새 폴더를 만든다.
3. 폴더명을 `머니라함_후기캡처_업로드`로 정한다.
4. 폴더를 열고 주소창에서 폴더 ID를 확인한다.

예시 주소:

```text
https://drive.google.com/drive/folders/구글드라이브폴더ID
```

`folders/` 뒤에 있는 긴 문자열이 폴더 ID다.

## 4. 구글 스프레드시트 만들기

1. Google Sheets에서 새 스프레드시트를 만든다.
2. 파일명을 `머니라함_후기신청_기록`으로 정한다.
3. 첫 번째 행에 아래 컬럼을 만든다.

```text
신청시간 | 이메일 | 이미지파일명 | 이미지URL | 발송링크 | 발송상태 | 오류메시지
```

4. 주소창에서 스프레드시트 ID를 확인한다.

예시 주소:

```text
https://docs.google.com/spreadsheets/d/구글스프레드시트ID/edit
```

`/d/`와 `/edit` 사이의 긴 문자열이 스프레드시트 ID다.

## 5. Google Apps Script 만들기

1. 스프레드시트 상단 메뉴에서 `확장 프로그램 > Apps Script`를 연다.
2. `Code.gs` 파일에 서버 코드를 작성한다.
3. 아래 설정값을 코드 상단에 넣는다.

```javascript
const CONFIG = {
  DRIVE_FOLDER_ID: '구글드라이브폴더ID',
  SPREADSHEET_ID: '구글스프레드시트ID',
  GUIDE_LINK: 'https://example.com/midam-guide',
  FROM_NAME: '머니라함'
};
```

4. 배포 메뉴에서 `새 배포 > 웹 앱`을 선택한다.
5. 실행 사용자: `나`
6. 액세스 권한: 테스트 단계에서는 `모든 사용자`
7. 배포 URL을 복사한다.

주의: 배포 URL은 GitHub에 올리지 않는다. 배포 URL은 `config.local.js`에만 넣는다.

`config.local.js` 예시:

```javascript
window.MIDAM_CONFIG = {
  GOOGLE_APPS_SCRIPT_WEB_APP_URL: 'https://script.google.com/macros/s/긴문자열/exec'
};
```

GitHub에는 `config.example.js`만 올리고, `config.local.js`는 올리지 않는다.

## 6. Apps Script가 처리할 일

Apps Script는 웹사이트에서 받은 데이터를 처리한다.

- 이메일 형식 확인
- 이미지 base64 데이터를 파일로 변환
- 구글 드라이브 폴더에 이미지 저장
- 구글 스프레드시트에 신청 기록 저장
- 사용자 이메일로 가이드 링크 발송
- 성공 또는 실패 결과 반환

## 7. 프론트엔드 구현 순서

1. `index.html`에 1페이지 구조를 만든다.
2. 좌측에는 머니라함 후기 안내 문구를 배치한다.
3. 우측에는 업로드 폼을 배치한다.
4. `styles.css`에 ORYZO 스타일 토큰을 넣고 머니라함 톤으로 적용한다.
5. `script.js`에서 필수값 검증을 만든다.
6. 파일을 base64로 변환한다.
7. Apps Script 웹앱 URL로 `POST` 요청을 보낸다.
8. 결과에 따라 성공 또는 실패 메시지를 보여준다.

## 8. 스타일 적용 기준

`styles.css` 첫 부분에 아래 토큰을 둔다.

```css
:root {
  --color-pitch-darkness: #100904;
  --color-cork-dust: #ffedd7;
  --color-rust-accent: #dc5000;
  --color-olive-green: #445231;
  --color-faded-bark: #382416;
  --color-aged-stone: #887b6d;
  --color-light-cork: #f6e0c6;
  --color-faint-hazel: #bbac97;
  --color-subtle-moss: #5d6c49;
  --color-deep-mocha: #40372e;
  --font-main: Inter, "Noto Sans KR", system-ui, sans-serif;
  --radius-buttons: 36px;
}
```

주요 화면 스타일:

- 전체 배경: `#100904`
- 기본 글자: `#ffedd7`
- CTA 버튼: `#dc5000`
- 폼 박스: `#15100d` 또는 `#382416`
- 입력창: 투명 배경, `#ffedd7` 테두리, 각진 모서리

## 9. 개인정보 안내 문구 초안

웹사이트 폼 아래에 접기/펼치기 형태로 넣는다.

```text
수집 항목: 이메일 주소, 카카오톡 후기 캡처 이미지, 신청 시간
이용 목적: 후기 확인 및 머니라함 가이드 링크 발송
보관 기간: 신청일로부터 30일 또는 목적 달성 후 파기
안내: 캡처 이미지에 불필요한 개인정보가 포함되지 않도록 확인 후 업로드해 주세요.
```

법률 검토가 필요한 실제 운영 전에는 개인정보처리방침과 이벤트 안내 문구를 별도로 점검하는 것이 좋다.

## 10. GitHub에 올릴 때 주의할 파일

`.gitignore`에 아래 내용을 넣는다.

```text
.env
*.local
config.local.js
apps-script/Code.local.gs
node_modules/
dist/
```

GitHub에 올려도 되는 것:

- HTML, CSS, JavaScript 코드
- PRD, README 같은 문서
- Apps Script 샘플 코드

GitHub에 올리면 안 되는 것:

- 실제 Apps Script 배포 URL
- 실제 구글 드라이브 폴더 ID
- 실제 구글 스프레드시트 ID
- 비밀번호, API 키, 개인 계정 정보

## 11. 노트북과 집 PC에서 이어서 작업하는 방법

노트북에서:

```bash
git init
git add .
git commit -m "Create midam review request PRD"
git branch -M main
git remote add origin https://github.com/내계정/autoemailsend.git
git push -u origin main
```

집 PC에서:

```bash
git clone https://github.com/내계정/autoemailsend.git
cd autoemailsend
```

작업 후에는:

```bash
git add .
git commit -m "Update midam review page"
git push
```

다른 PC에서 이어서 시작할 때는:

```bash
git pull
```

## 12. MVP 완료 체크리스트

- [ ] `index.html`이 1페이지 화면을 보여준다.
- [ ] 첨부 이미지 선택 UI가 있다.
- [ ] 이메일 입력 UI가 있다.
- [ ] 개인정보 동의 체크박스가 있다.
- [ ] 신청 버튼 클릭 시 필수값 검증이 된다.
- [ ] Apps Script로 데이터가 전송된다.
- [ ] 이미지가 구글 드라이브에 저장된다.
- [ ] 신청 기록이 구글 스프레드시트에 저장된다.
- [ ] 지정 링크가 이메일로 발송된다.
- [ ] 모바일 화면에서도 깨지지 않는다.

## 13. 다음 구현 단계

1. HTML/CSS/JS 1페이지를 만든다.
2. Apps Script 샘플 서버 코드를 만든다.
3. 구글 드라이브 폴더 ID와 스프레드시트 ID를 연결한다.
4. 실제 이메일 발송 테스트를 한다.
5. GitHub에 안전하게 업로드한다.
