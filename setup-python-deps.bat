@echo off
echo Installing Python dependencies for PDF parsing...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

echo Python found. Installing dependencies...
cd server\python
pip install -r requirements.txt

if %errorlevel% equ 0 (
    echo.
    echo ✓ Python dependencies installed successfully!
    echo ✓ PDF parsing will now use accurate Python libraries
    echo.
) else (
    echo.
    echo ✗ Failed to install Python dependencies
    echo Please run: pip install PyPDF2 pdfplumber PyMuPDF
    echo.
)

pause