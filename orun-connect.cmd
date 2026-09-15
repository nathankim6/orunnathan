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
rem  이 창은 무슨 일이 있어도 혼자 닫히지 않습니다. 멈추면 까닭을 적고 기다립니다.
rem  적힌 글은 파일 옆 orun-connect.log 에도 그대로 남습니다.
rem ===========================================================================

set "APP=https://nathankim6.github.io/orunnathan/mock-exam.html"
set "BRIDGE_URL=https://nathankim6.github.io/orunnathan/orun-bridge.mjs"
set "PORT=8787"
set "TOKENFILE=%~dp0.orun-code"
set "LOG=%~dp0orun-connect.log"
break > "%LOG%" 2>nul

call :main
set "RC=%ERRORLEVEL%"
echo(
echo   ------------------------------------------------------------
if "%RC%"=="0" (
  echo   끝났습니다.
) else (
  echo   ! 여기서 멈췄습니다. 멈춤 번호 %RC%
  echo     바로 위에 적힌 글을 그대로 알려 주시면 고쳐 드립니다.
)
echo     적어 둔 곳: %LOG%
echo   ------------------------------------------------------------
echo   아무 키나 누르면 창이 닫힙니다.
pause >nul
exit /b %RC%

rem ── 화면에 적고 기록에도 남긴다 ───────────────────────────────────────────
:say
echo   %~1
>>"%LOG%" echo   %~1
goto :eof

rem ── 그 문이 비어 있는가 (0 비었음 / 3 쓰이는 중) ───────────────────────────
:portfree
"%NODE%" -e "var n=require('net'),s=n.createServer();s.once('error',function(e){process.exit(e.code==='EADDRINUSE'?3:0)});s.once('listening',function(){s.close(function(){process.exit(0)})});s.listen(+process.argv[1],'127.0.0.1')" %1 >nul 2>&1
exit /b %ERRORLEVEL%

rem ── 그 문에 우리 브리지가 이미 떠 있는가 (0 그렇다) ────────────────────────
:bridgehere
"%NODE%" -e "fetch('http://127.0.0.1:'+process.argv[1]+'/health').then(function(r){return r.json()}).then(function(j){process.exit(j&&j.name==='orun-bridge'?0:1)}).catch(function(){process.exit(1)})" %1 >nul 2>&1
exit /b %ERRORLEVEL%

rem ===========================================================================
:main
rem 괄호가 든 이름은 블록 안에서 깨진다. 미리 담아 둔다.
set "PF=%ProgramFiles%"
set "PF86=%ProgramFiles(x86)%"

echo(
echo   옳은영어 · 동형 모의고사 연결
echo   ------------------------------------------------------------
echo(

rem ── 1. Node ────────────────────────────────────────────────────────────────
set "NODE="
for /f "delims=" %%i in ('where node 2^>nul') do if not defined NODE set "NODE=%%i"
if not defined NODE if exist "%PF%\nodejs\node.exe" set "NODE=%PF%\nodejs\node.exe"

if not defined NODE (
  call :say "[1/5] Node.js 를 깝니다. 몇 분 걸립니다..."
  winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
  rem 방금 깐 것은 이 창의 PATH 에 없다. 설치 자리를 직접 본다.
  if exist "%PF%\nodejs\node.exe" set "NODE=%PF%\nodejs\node.exe"
  if not defined NODE if exist "%PF86%\nodejs\node.exe" set "NODE=%PF86%\nodejs\node.exe"
)

if not defined NODE (
  echo(
  call :say "! Node.js 를 찾지 못했습니다."
  call :say "  nodejs.org 에서 Windows LTS 를 내려받아 설치한 뒤,"
  call :say "  이 파일을 다시 두 번 눌러 주세요."
  exit /b 11
)
for /f "delims=" %%v in ('"%NODE%" -v 2^>nul') do set "NODEV=%%v"
set "NMAJ=%NODEV:v=%"
for /f "tokens=1 delims=." %%a in ("%NMAJ%") do set "NMAJ=%%a"
set /a NMAJ=NMAJ+0 2>nul
if %NMAJ% LSS 18 (
  echo(
  call :say "! Node.js 가 너무 오래됐습니다. %NODEV%"
  call :say "  nodejs.org 에서 LTS 18 이상을 깔고 다시 눌러 주세요."
  exit /b 12
)
call :say "[1/5] Node.js %NODEV%  준비됨"

rem npm 은 node 옆에 있다
for %%d in ("%NODE%") do set "NODEDIR=%%~dpd"
set "NPM=%NODEDIR%npm.cmd"
if not exist "%NPM%" set "NPM=npm"

rem ── 코드는 한 번만 만들고 그다음부터 그대로 쓴다 ───────────────────────────
set "HADCODE="
set "CODE="
if exist "%TOKENFILE%" (
  set /p CODE=<"%TOKENFILE%"
  set "HADCODE=1"
)
if not defined CODE (
  rem 글자는 서른두 개다. 여섯 바이트를 서른둘로 접어 고른다.
  "%NODE%" -e "var a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',s='',b=require('crypto').randomBytes(6);for(var i=0;i!==6;i++)s+=a.charAt(b[i]&31);require('fs').writeFileSync(process.argv[1],s)" "%TOKENFILE%"
  if exist "%TOKENFILE%" set /p CODE=<"%TOKENFILE%"
  attrib +h "%TOKENFILE%" >nul 2>&1
  set "HADCODE="
)
set "CODE=%CODE: =%"
if not defined CODE (
  echo(
  call :say "! 코드를 만들지 못했습니다. Node.js 가 제대로 깔렸는지 확인해 주세요."
  exit /b 13
)

rem ── 문 번호 - 이미 쓰이고 있으면 비껴간다 ──────────────────────────────────
rem 예전에 켜 둔 창이 아직 살아 있으면 새 브리지는 곧바로 죽는다. 그래서 먼저 본다.
call :portfree %PORT%
if errorlevel 3 (
  set "REUSE="
  if defined HADCODE (
    call :bridgehere %PORT%
    if not errorlevel 1 set "REUSE=1"
  )
  if defined REUSE (
    echo(
    call :say "이미 켜져 있습니다. 새로 켜지 않고 그대로 씁니다."
    call :say "먼저 열어 둔 검정 창을 닫지 마세요 - 그 창이 연결을 잡고 있습니다."
    echo(
    call :say "[5/5] 생성기를 엽니다..."
    start "" "%APP%#connect=%CODE%@http://127.0.0.1:%PORT%"
    echo(
    call :say "이 창은 닫으셔도 됩니다."
    exit /b 0
  )
  set "NEWPORT="
  for %%k in (1 2 3 4 5 6 7 8) do (
    if not defined NEWPORT (
      set /a TRYPORT=%PORT%+%%k
      call :portfree !TRYPORT!
      if not errorlevel 3 set "NEWPORT=!TRYPORT!"
    )
  )
  if not defined NEWPORT (
    echo(
    call :say "! %PORT% 번 문이 쓰이고 있고 대신 쓸 번호도 못 찾았습니다."
    call :say "  컴퓨터를 다시 켠 뒤 눌러 주세요."
    exit /b 14
  )
  call :say "%PORT% 번 문이 쓰이고 있어 !NEWPORT! 번으로 옮깁니다"
  set "PORT=!NEWPORT!"
)

rem ── 2. 도구 (Claude Code 우선, 없으면 Codex) ────────────────────────────────
set "AGENT="
set "AGENTBIN="
for /f "delims=" %%i in ('where claude 2^>nul') do if not defined AGENTBIN ( set "AGENT=claude" & set "AGENTBIN=%%i" )
if not defined AGENTBIN for /f "delims=" %%i in ('where codex 2^>nul') do if not defined AGENTBIN ( set "AGENT=codex" & set "AGENTBIN=%%i" )

if not defined AGENTBIN (
  call :say "[2/5] Claude Code 를 깝니다. 몇 분 걸립니다..."
  call "%NPM%" i -g @anthropic-ai/claude-code
  for /f "delims=" %%i in ('where claude 2^>nul') do if not defined AGENTBIN ( set "AGENT=claude" & set "AGENTBIN=%%i" )
  if not defined AGENTBIN if exist "%APPDATA%\npm\claude.cmd" ( set "AGENT=claude" & set "AGENTBIN=%APPDATA%\npm\claude.cmd" )
)

if not defined AGENTBIN (
  echo(
  call :say "! Claude Code 를 깔지 못했습니다."
  call :say "  이 창에서 아래 한 줄을 직접 넣어 보시고, 나오는 글을 알려 주세요."
  call :say "    npm i -g @anthropic-ai/claude-code"
  exit /b 21
)
call :say "[2/5] %AGENT%  준비됨"

rem ── 3. 로그인 ──────────────────────────────────────────────────────────────
call :say "[3/5] 로그인을 확인합니다..."
set "LOGGEDIN="
if "%AGENT%"=="claude" (
  echo ping | "%AGENTBIN%" -p --output-format text >nul 2>&1 && set "LOGGEDIN=1"
) else (
  echo ping | "%AGENTBIN%" exec --json --sandbox read-only --skip-git-repo-check - >nul 2>&1 && set "LOGGEDIN=1"
)

if not defined LOGGEDIN (
  echo(
  call :say "로그인이 필요합니다. 곧 %AGENT% 가 열립니다."
  call :say "브라우저에서 로그인을 마친 뒤, 그 창을 닫고 여기로 돌아오세요."
  echo(
  pause
  "%AGENTBIN%"
  echo(
  call :say "로그인을 다시 확인합니다..."
  if "%AGENT%"=="claude" (
    echo ping | "%AGENTBIN%" -p --output-format text >nul 2>&1 && set "LOGGEDIN=1"
  ) else (
    echo ping | "%AGENTBIN%" exec --json --sandbox read-only --skip-git-repo-check - >nul 2>&1 && set "LOGGEDIN=1"
  )
)

if not defined LOGGEDIN (
  echo(
  call :say "! 아직 로그인이 안 돼 있습니다."
  call :say "  이 창에서 %AGENT% 를 직접 한 번 실행해 로그인한 뒤,"
  call :say "  이 파일을 다시 두 번 눌러 주세요."
  exit /b 31
)
call :say "[3/5] 로그인 확인됨"

rem ── 4. 브리지 ──────────────────────────────────────────────────────────────
call :say "[4/5] 브리지를 내려받습니다..."
curl -fsSL "%BRIDGE_URL%" -o "%~dp0orun-bridge.mjs"
if not exist "%~dp0orun-bridge.mjs" (
  echo(
  call :say "! 브리지 파일을 받지 못했습니다. 인터넷 연결을 확인해 주세요."
  exit /b 41
)

rem ── 5. 켜고 연다 ───────────────────────────────────────────────────────────
call :say "[5/5] 생성기를 엽니다..."
start "" "%APP%#connect=%CODE%@http://127.0.0.1:%PORT%"
echo(
echo   ------------------------------------------------------------
echo   이어졌습니다. 이 창은 쓰시는 동안 켜 두세요.
echo   끝내시려면 이 창을 닫으시면 됩니다.
echo   ------------------------------------------------------------
echo(

"%NODE%" "%~dp0orun-bridge.mjs" --port %PORT% --token %CODE%
exit /b 0
