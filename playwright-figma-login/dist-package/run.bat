@echo off
chcp 65001 > nul
title Figma Cookie Collector

echo.
echo  ================================================
echo    Figma Auto Login + Cookie Sync to GitHub
echo  ================================================
echo.

cd /d "%~dp0"

REM -- Dung node.exe co san trong thu muc (khong can cai Node.js) --
set NODE_CMD=node.exe
if not exist "node.exe" (
    where node >nul 2>&1
    if %errorlevel% neq 0 (
        echo [LOI] Khong tim thay node.exe. Vui long giai nen lai tu file zip.
        goto :DONE
    )
    set NODE_CMD=node
)

REM -- Kiem tra node_modules (duong dan giai nen qua dai se thieu file) --
if not exist "node_modules\playwright-core\package.json" (
    echo [LOI] Thieu node_modules\playwright-core
    echo.
    echo  Nguyen nhan: Windows gioi han 260 ky tu trong duong dan.
    echo  Cach sua   : Giai nen vao thu muc ngan hon, vi du C:\figma-login\
    goto :DONE
)

REM -- Kiem tra Chrome (tranh dung ProgramFiles x86 trong for loop) --
set CHROME_OK=0
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set CHROME_OK=1
if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" set CHROME_OK=1
set PFX86=%ProgramFiles(x86)%
if exist "%PFX86%\Google\Chrome\Application\chrome.exe" set CHROME_OK=1
if %CHROME_OK%==0 (
    echo [LOI] Khong tim thay Google Chrome. Tai va cai dat tai: https://www.google.com/chrome
    goto :DONE
)

REM -- Kiem tra file config --
if not exist "config.enc" (
    echo [LOI] Khong tim thay file config.enc
    goto :DONE
)

REM -- Chay chinh --
%NODE_CMD% bundle.js
set EXIT_CODE=%errorlevel%

echo.
if %EXIT_CODE% equ 0 (
    echo  ================================================
    echo    HOAN THANH! Cookie da duoc luu vao GitHub
    echo  ================================================
) else (
    echo  ================================================
    echo    CO LOI XAY RA - Ma loi: %EXIT_CODE%
    echo    Kiem tra thong bao phia tren de biet chi tiet
    echo  ================================================
)

:DONE
echo.
pause
