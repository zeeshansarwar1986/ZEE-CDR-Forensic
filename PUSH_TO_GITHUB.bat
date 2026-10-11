@echo off
title Push ZEE CDR Forensic to GitHub
echo ========================================================
echo  ZEE CDR Forensic - GitHub Push Utility
echo  Repository: https://github.com/zeeshansarwar1986/ZEE-CDR-Forensic.git
echo ========================================================
echo.

set PATH=%LOCALAPPDATA%\MinGit\cmd;%PATH%

echo Staging any modified files...
git add -A

echo Committing changes...
git commit -m "Update ZEE CDR Forensic to latest version with Geoapify & README" --allow-empty

echo Setting main branch...
git branch -M main

echo Setting remote repository...
git remote set-url origin https://github.com/zeeshansarwar1986/ZEE-CDR-Forensic.git

echo.
echo Pushing to GitHub (origin main)...
echo If prompted, enter your GitHub Username and Personal Access Token (or password).
echo.
git push -u origin main

echo.
echo ========================================================
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Successfully pushed to GitHub!
    echo Visit: https://github.com/zeeshansarwar1986/ZEE-CDR-Forensic
) else (
    echo [NOTE] Push requires GitHub Authentication.
    echo Please see GITHUB_DEPLOY.md for instructions or use a GitHub Personal Access Token.
)
echo ========================================================
pause
