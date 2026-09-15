@echo off
chcp 65001 >nul 2>&1
setlocal
title 옳은영어 - 동형 모의고사 연결
cd /d "%~dp0"

rem ===========================================================================
rem  옳은영어 - 동형 모의고사 연결 (Windows)
rem  두 번 누르면 끝납니다. 선생님이 하실 일은 첫 회 로그인 한 번뿐입니다.
rem
rem  하는 일
rem    1. Node.js 가 없으면 깝니다 (winget).
rem    2. Claude Code 가 없으면 깝니다 (npm) - 없으면 Codex 를 씁니다.
rem    3. 로그인을 봅니다. 확인이 안 돼도 멈추지 않고 도구가 한 말을 보여 줍니다.
rem    4. 브리지 파일을 내려받아 켭니다.
rem    5. 코드가 들어간 주소로 생성기를 엽니다. 코드를 옮겨 적지 않습니다.
rem
rem  이 창은 쓰시는 동안 켜 두세요. 끄면 연결이 끊깁니다.
rem  이 창은 무슨 일이 있어도 혼자 닫히지 않습니다. 멈추면 까닭을 적고 기다립니다.
rem  적힌 글은 파일 옆 orun-connect.log 에도 그대로 남습니다.
rem
rem  배치 파일에서 지킬 것
rem    · 지연 확장(EnableDelayedExpansion)을 쓰지 않는다. 느낌표가 든 한글 문장을
rem      통째로 삼켜 아무 말 없이 멈추는 일이 생긴다.
rem    · 괄호 블록을 겹치지 않는다. 안에 파이프가 들어가면 파싱이 깨진다. goto 로 간다.
rem    · 남의 배치 파일은 반드시 call 로 부른다. 그냥 부르면 돌아오지 않는다.
rem ===========================================================================

set "APP=https://nathankim6.github.io/orunnathan/mock-exam.html"
set "BRIDGE_URL=https://nathankim6.github.io/orunnathan/orun-bridge.mjs"
set "PORT=8787"
set "TOKENFILE=%~dp0.orun-code"
set "LOG=%~dp0orun-connect.log"
break > "%LOG%" 2>nul
set "STEP=시작"

call :main
set "RC=%ERRORLEVEL%"
echo(
echo   ------------------------------------------------------------
if "%RC%"=="0" goto tailok
echo   여기서 멈췄습니다. 멈춘 자리: %STEP%   멈춤 번호 %RC%
echo     바로 위에 적힌 글을 그대로 알려 주시면 고쳐 드립니다.
goto tailend
:tailok
echo   끝났습니다.
:tailend
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

rem ── 어디까지 갔는지 ───────────────────────────────────────────────────────
:mark
set "STEP=%~1"
>>"%LOG%" echo [자리] %~1
goto :eof

rem ── 그 문이 비어 있는가 (0 비었음 / 3 쓰이는 중) ───────────────────────────
:portfree
"%NODE%" -e "var n=require('net'),s=n.createServer();s.once('error',function(e){process.exit(e.code==='EADDRINUSE'?3:0)});s.once('listening',function(){s.close(function(){process.exit(0)})});s.listen(+process.argv[1],'127.0.0.1')" %1 >nul 2>&1
exit /b

rem ── 그 문에 우리 브리지가 이미 떠 있는가 (0 그렇다) ────────────────────────
:bridgehere
"%NODE%" -e "fetch('http://127.0.0.1:'+process.argv[1]+'/health').then(function(r){return r.json()}).then(function(j){process.exit(j&&j.name==='orun-bridge'?0:1)}).catch(function(){process.exit(1)})" %1 >nul 2>&1
exit /b

rem ── 로그인돼 있는가 (0 그렇다) ────────────────────────────────────────────
:probe
if "%AGENT%"=="codex" goto probecodex
echo ping | "%AGENTBIN%" -p --output-format text >nul 2>&1
exit /b
:probecodex
echo ping | "%AGENTBIN%" exec --json --sandbox read-only --skip-git-repo-check - >nul 2>&1
exit /b

rem ── 도구가 뭐라고 하는지 그대로 ───────────────────────────────────────────
:showprobe
if "%AGENT%"=="codex" goto showcodex
echo ping | "%AGENTBIN%" -p --output-format text 2>&1
goto :eof
:showcodex
echo ping | "%AGENTBIN%" exec --sandbox read-only --skip-git-repo-check - 2>&1
goto :eof

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
call :mark "Node 찾기"
set "NODE="
for /f "delims=" %%i in ('where node 2^>nul') do if not defined NODE set "NODE=%%i"
if not defined NODE if exist "%PF%\nodejs\node.exe" set "NODE=%PF%\nodejs\node.exe"
if defined NODE goto nodeok

call :say "[1/5] Node.js 를 깝니다. 몇 분 걸립니다..."
call :mark "Node 설치"
winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
rem 방금 깐 것은 이 창의 PATH 에 없다. 설치 자리를 직접 본다.
if exist "%PF%\nodejs\node.exe" set "NODE=%PF%\nodejs\node.exe"
if not defined NODE if exist "%PF86%\nodejs\node.exe" set "NODE=%PF86%\nodejs\node.exe"
if defined NODE goto nodeok

echo(
call :say "* Node.js 를 찾지 못했습니다."
call :say "  nodejs.org 에서 Windows LTS 를 내려받아 설치한 뒤,"
call :say "  이 파일을 다시 두 번 눌러 주세요."
exit /b 11

:nodeok
set "NODEV="
for /f "delims=" %%v in ('"%NODE%" -v 2^>nul') do set "NODEV=%%v"
set "NMAJ=%NODEV:v=%"
for /f "tokens=1 delims=." %%a in ("%NMAJ%") do set "NMAJ=%%a"
set /a NMAJ=NMAJ+0 2>nul
if %NMAJ% GEQ 18 goto nodenew
echo(
call :say "* Node.js 가 너무 오래됐습니다. %NODEV%"
call :say "  nodejs.org 에서 LTS 18 이상을 깔고 다시 눌러 주세요."
exit /b 12

:nodenew
call :say "[1/5] Node.js %NODEV%  준비됨"

rem npm 은 node 옆에 있다
for %%d in ("%NODE%") do set "NODEDIR=%%~dpd"
set "NPM=%NODEDIR%npm.cmd"
if not exist "%NPM%" set "NPM=npm"

rem ── 코드는 한 번만 만들고 그다음부터 그대로 쓴다 ───────────────────────────
call :mark "코드 준비"
set "HADCODE="
set "CODE="
if not exist "%TOKENFILE%" goto makecode
set /p CODE=<"%TOKENFILE%"
set "HADCODE=1"
:makecode
if defined CODE goto codeok
rem 글자는 서른두 개다. 여섯 바이트를 서른둘로 접어 고른다.
"%NODE%" -e "var a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',s='',b=require('crypto').randomBytes(6);for(var i=0;i!==6;i++)s+=a.charAt(b[i]&31);require('fs').writeFileSync(process.argv[1],s)" "%TOKENFILE%"
if exist "%TOKENFILE%" set /p CODE=<"%TOKENFILE%"
attrib +h "%TOKENFILE%" >nul 2>&1
set "HADCODE="
:codeok
set "CODE=%CODE: =%"
if defined CODE goto codehave
echo(
call :say "* 코드를 만들지 못했습니다. Node.js 가 제대로 깔렸는지 확인해 주세요."
exit /b 13
:codehave

rem ── 문 번호 - 이미 쓰이고 있으면 비껴간다 ──────────────────────────────────
rem 예전에 켜 둔 창이 아직 살아 있으면 새 브리지는 곧바로 죽는다. 그래서 먼저 본다.
call :mark "문 번호 보기"
call :portfree %PORT%
if not errorlevel 3 goto portok

if not defined HADCODE goto steparound
call :bridgehere %PORT%
if errorlevel 1 goto steparound
echo(
call :say "이미 켜져 있습니다. 새로 켜지 않고 그대로 씁니다."
call :say "먼저 열어 둔 검은 창을 닫지 마세요 - 그 창이 연결을 잡고 있습니다."
echo(
call :say "[5/5] 생성기를 엽니다..."
start "" "%APP%#connect=%CODE%@http://127.0.0.1:%PORT%"
echo(
call :say "이 창은 닫으셔도 됩니다."
exit /b 0

:steparound
set "TRY=0"
:trynext
set /a TRY=TRY+1
if %TRY% GTR 8 goto noport
set /a CAND=%PORT%+%TRY%
call :portfree %CAND%
if errorlevel 3 goto trynext
call :say "%PORT% 번 문이 쓰이고 있어 %CAND% 번으로 옮깁니다"
set "PORT=%CAND%"
goto portok

:noport
echo(
call :say "* %PORT% 번 문이 쓰이고 있고 대신 쓸 번호도 못 찾았습니다."
call :say "  컴퓨터를 다시 켠 뒤 눌러 주세요."
exit /b 14

:portok

rem ── 2. 도구 (Claude Code 우선, 없으면 Codex) ────────────────────────────────
call :mark "도구 찾기"
set "AGENT="
set "AGENTBIN="
for /f "delims=" %%i in ('where claude 2^>nul') do if not defined AGENTBIN set "AGENTBIN=%%i"
if defined AGENTBIN set "AGENT=claude"
if defined AGENTBIN goto agentok
for /f "delims=" %%i in ('where codex 2^>nul') do if not defined AGENTBIN set "AGENTBIN=%%i"
if defined AGENTBIN set "AGENT=codex"
if defined AGENTBIN goto agentok

call :say "[2/5] Claude Code 를 깝니다. 몇 분 걸립니다..."
call :mark "도구 설치"
call "%NPM%" i -g @anthropic-ai/claude-code
for /f "delims=" %%i in ('where claude 2^>nul') do if not defined AGENTBIN set "AGENTBIN=%%i"
if not defined AGENTBIN if exist "%APPDATA%\npm\claude.cmd" set "AGENTBIN=%APPDATA%\npm\claude.cmd"
if defined AGENTBIN set "AGENT=claude"
if defined AGENTBIN goto agentok

echo(
call :say "* Claude Code 를 깔지 못했습니다."
call :say "  이 창에서 아래 한 줄을 직접 넣어 보시고, 나오는 글을 알려 주세요."
call :say "    npm i -g @anthropic-ai/claude-code"
exit /b 21

:agentok
call :say "[2/5] %AGENT%  준비됨"

rem ── 3. 로그인 ──────────────────────────────────────────────────────────────
rem 확인이 안 돼도 여기서 끝내지 않는다 - 확인하는 방법이 도구 판마다 달라
rem 멀쩡히 로그인된 분을 막아 세우는 일이 생긴다. 진짜 판정은 아래 브리지 표가 한다.
call :mark "로그인 확인"
call :say "[3/5] 로그인을 확인합니다..."
call :probe
if not errorlevel 1 goto loginok

echo(
call :say "로그인이 필요해 보입니다. 곧 %AGENT% 가 열립니다."
call :say "로그인을 마친 뒤, 그 창을 닫고 여기로 돌아오세요."
echo(
pause
call :mark "로그인 창"
call "%AGENTBIN%"
echo(
call :say "로그인을 다시 확인합니다..."
call :mark "로그인 재확인"
call :probe
if not errorlevel 1 goto loginok

echo(
call :say "로그인 확인이 되지 않습니다. %AGENT% 가 뭐라고 하는지 그대로 보여 드립니다 -"
call :say "............................................................"
call :showprobe
>>"%LOG%" echo [도구가 한 말] 위 화면 참고
call :say "............................................................"
echo(
call :say "그래도 켜 보겠습니다. 잠시 뒤 나오는 표에서 %AGENT% 가"
call :say "준비됨 이면 그대로 쓰시면 되고, 없음 이면 로그인이 덜 된 것입니다."
goto bridgestep

:loginok
call :say "[3/5] 로그인 확인됨"

:bridgestep
rem ── 4. 브리지 ──────────────────────────────────────────────────────────────
call :mark "브리지 내려받기"
call :say "[4/5] 브리지를 내려받습니다..."
curl -fsSL "%BRIDGE_URL%" -o "%~dp0orun-bridge.mjs"
if exist "%~dp0orun-bridge.mjs" goto bridgeok
echo(
call :say "* 브리지 파일을 받지 못했습니다. 인터넷 연결을 확인해 주세요."
exit /b 41
:bridgeok

rem ── 5. 켜고 연다 ───────────────────────────────────────────────────────────
call :mark "생성기 열기"
call :say "[5/5] 생성기를 엽니다..."
start "" "%APP%#connect=%CODE%@http://127.0.0.1:%PORT%"
echo(
echo   ------------------------------------------------------------
echo   이어졌습니다. 이 창은 쓰시는 동안 켜 두세요.
echo   끝내시려면 이 창을 닫으시면 됩니다.
echo   ------------------------------------------------------------
echo(

call :mark "브리지 켜기"
"%NODE%" "%~dp0orun-bridge.mjs" --port %PORT% --token %CODE%
exit /b 0
