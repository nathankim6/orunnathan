@echo off
chcp 65001 >nul 2>&1
setlocal EnableDelayedExpansion
title 옳은영어 - 동형 모의고사 연결
cd /d "%~dp0"

rem ===========================================================================
rem  옳은영어 - 동형 모의고사 연결 (Windows)
rem  두 번 누르면 끝납니다. 선생님이 하실 일은 첫 회 로그인 한 번뿐입니다.
rem
rem  하는 일
rem    1. Node.js 가 없으면 깝니다 (winget).
rem    2. Claude Code 가 없으면 깝니다 (npm) - 없으면 Codex 를 씁니다.
rem    3. 로그인이 안 돼 있으면 로그인 창을 띄우고 끝날 때까지 기다립니다.
rem    4. 브리지 파일을 내려받아 켭니다.
rem    5. 코드가 들어간 주소로 생성기를 엽니다. 코드를 옮겨 적지 않습니다.
rem
rem  이 창은 쓰시는 동안 켜 두세요. 끄면 연결이 끊깁니다.
rem ===========================================================================

set "APP=https://nathankim6.github.io/orunnathan/mock-exam.html"
set "BRIDGE_URL=https://nathankim6.github.io/orunnathan/orun-bridge.mjs"
set "PORT=8787"
set "TOKENFILE=%~dp0.orun-code"

echo(
echo   옳은영어 · 동형 모의고사 연결
echo   ------------------------------------------------------------
echo(

rem ── 1. Node ────────────────────────────────────────────────────────────────
set "NODE="
for /f "delims=" %%i in ('where node 2^>nul') do if not defined NODE set "NODE=%%i"
if not defined NODE if exist "%ProgramFiles%\nodejs\node.exe" set "NODE=%ProgramFiles%\nodejs\node.exe"

if not defined NODE (
  echo   [1/5] Node.js 를 깝니다. 몇 분 걸립니다...
  winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
  rem 방금 깐 것은 이 창의 PATH 에 없다. 설치 자리를 직접 본다.
  if exist "%ProgramFiles%\nodejs\node.exe" set "NODE=%ProgramFiles%\nodejs\node.exe"
  if not defined NODE if exist "%ProgramFiles(x86)%\nodejs\node.exe" set "NODE=%ProgramFiles(x86)%\nodejs\node.exe"
)

if not defined NODE (
  echo(
  echo   ! Node.js 를 찾지 못했습니다.
  echo     nodejs.org 에서 Windows LTS 를 내려받아 설치한 뒤,
  echo     이 파일을 다시 두 번 눌러 주세요.
  echo(
  pause
  exit /b 1
)
for /f "delims=" %%v in ('"%NODE%" -v 2^>nul') do set "NODEV=%%v"
echo   [1/5] Node.js %NODEV%  준비됨

rem npm 은 node 옆에 있다
for %%d in ("%NODE%") do set "NODEDIR=%%~dpd"
set "NPM=%NODEDIR%npm.cmd"
if not exist "%NPM%" set "NPM=npm"

rem ── 2. 도구 (Claude Code 우선, 없으면 Codex) ────────────────────────────────
set "AGENT="
set "AGENTBIN="
for /f "delims=" %%i in ('where claude 2^>nul') do if not defined AGENTBIN ( set "AGENT=claude" & set "AGENTBIN=%%i" )
if not defined AGENTBIN for /f "delims=" %%i in ('where codex 2^>nul') do if not defined AGENTBIN ( set "AGENT=codex" & set "AGENTBIN=%%i" )

if not defined AGENTBIN (
  echo   [2/5] Claude Code 를 깝니다. 몇 분 걸립니다...
  call "%NPM%" i -g @anthropic-ai/claude-code
  for /f "delims=" %%i in ('where claude 2^>nul') do if not defined AGENTBIN ( set "AGENT=claude" & set "AGENTBIN=%%i" )
  if not defined AGENTBIN if exist "%APPDATA%\npm\claude.cmd" ( set "AGENT=claude" & set "AGENTBIN=%APPDATA%\npm\claude.cmd" )
)

if not defined AGENTBIN (
  echo(
  echo   ! Claude Code 를 깔지 못했습니다.
  echo     이 창에서 아래 한 줄을 직접 넣어 보시고, 나오는 글을 알려 주세요.
  echo       npm i -g @anthropic-ai/claude-code
  echo(
  pause
  exit /b 1
)
echo   [2/5] %AGENT%  준비됨

rem ── 3. 로그인 ──────────────────────────────────────────────────────────────
echo   [3/5] 로그인을 확인합니다...
set "LOGGEDIN="
if "%AGENT%"=="claude" (
  echo ping | "%AGENTBIN%" -p --output-format text >nul 2>&1 && set "LOGGEDIN=1"
) else (
  echo ping | "%AGENTBIN%" exec --json --sandbox read-only --skip-git-repo-check - >nul 2>&1 && set "LOGGEDIN=1"
)

if not defined LOGGEDIN (
  echo(
  echo   로그인이 필요합니다. 곧 %AGENT% 가 열립니다.
  echo   브라우저에서 로그인을 마친 뒤, 그 창을 닫고 여기로 돌아오세요.
  echo(
  pause
  "%AGENTBIN%"
  echo(
  echo   로그인을 다시 확인합니다...
  if "%AGENT%"=="claude" (
    echo ping | "%AGENTBIN%" -p --output-format text >nul 2>&1 && set "LOGGEDIN=1"
  ) else (
    echo ping | "%AGENTBIN%" exec --json --sandbox read-only --skip-git-repo-check - >nul 2>&1 && set "LOGGEDIN=1"
  )
)

if not defined LOGGEDIN (
  echo(
  echo   ! 아직 로그인이 안 돼 있습니다.
  echo     이 창에서 %AGENT% 를 직접 한 번 실행해 로그인한 뒤,
  echo     이 파일을 다시 두 번 눌러 주세요.
  echo(
  pause
  exit /b 1
)
echo   [3/5] 로그인 확인됨

rem ── 4. 브리지 ──────────────────────────────────────────────────────────────
echo   [4/5] 브리지를 내려받습니다...
curl -fsSL "%BRIDGE_URL%" -o "%~dp0orun-bridge.mjs"
if not exist "%~dp0orun-bridge.mjs" (
  echo(
  echo   ! 브리지 파일을 받지 못했습니다. 인터넷 연결을 확인해 주세요.
  echo(
  pause
  exit /b 1
)

rem 코드는 한 번만 만들고 그다음부터 그대로 쓴다 - 주소가 매번 바뀌지 않게
if exist "%TOKENFILE%" (
  set /p CODE=<"%TOKENFILE%"
) else (
  for /f "delims=" %%c in ('"%NODE%" -e "const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';for(const n of require('crypto').randomBytes(6))s+=a[n%%a.length];console.log(s)"') do set "CODE=%%c"
  >"%TOKENFILE%" echo !CODE!
  attrib +h "%TOKENFILE%" >nul 2>&1
)
set "CODE=%CODE: =%"

rem ── 5. 켜고 연다 ───────────────────────────────────────────────────────────
echo   [5/5] 생성기를 엽니다...
start "" "%APP%#connect=%CODE%@http://127.0.0.1:%PORT%"
echo(
echo   ------------------------------------------------------------
echo   이어졌습니다. 이 창은 쓰시는 동안 켜 두세요.
echo   끝내시려면 이 창을 닫으시면 됩니다.
echo   ------------------------------------------------------------
echo(

"%NODE%" "%~dp0orun-bridge.mjs" --port %PORT% --token %CODE%

echo(
echo   연결이 끝났습니다. 아무 키나 누르면 창이 닫힙니다.
pause >nul
