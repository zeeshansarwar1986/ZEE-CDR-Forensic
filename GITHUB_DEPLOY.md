# GitHub Upload & Deployment Guide - ZEE CDR Forensic
**Repository**: [https://github.com/zeeshansarwar1986/ZEE-CDR-Forensic](https://github.com/zeeshansarwar1986/ZEE-CDR-Forensic)

---

## 🌐 MULTI-LINGUAL INDEX / فہرست / الفهرس
1. [English Guide](#1-english-guide)
2. [اردو گائیڈ (سٹیپ بائی سٹیپ طریقہ)](#2-اردو-گائیڈ-سٹیپ-بائی-سٹیپ-طریقہ)
3. [الدليل باللغة العربية](#3-الدليل-باللغة-العربية)

---

## 1. ENGLISH GUIDE

The Git repository has been completely configured and committed locally with:
- Remote: `https://github.com/zeeshansarwar1986/ZEE-CDR-Forensic.git`
- Branch: `main`
- All project files, modules, `index.html`, and `README.md` are staged and committed.

### Method 1: Double-Click "PUSH_TO_GITHUB.bat" (Easiest & Fastest)
1. In your project folder `c:\Users\hp\Documents\CDR App\`, double-click **`PUSH_TO_GITHUB.bat`**.
2. A command prompt window will open and connect to GitHub.
3. Enter your GitHub Username (`zeeshansarwar1986`) and your **GitHub Personal Access Token** (or password).
4. All files and commits will push directly to `https://github.com/zeeshansarwar1986/ZEE-CDR-Forensic`!

### Method 2: Web Browser Drag & Drop
1. Open this link in your web browser:
   [https://github.com/zeeshansarwar1986/ZEE-CDR-Forensic/upload/main](https://github.com/zeeshansarwar1986/ZEE-CDR-Forensic/upload/main)
2. Drag and drop all files from `c:\Users\hp\Documents\CDR App\` into the browser window:
   - `index.html`
   - `README.md`
   - `css/` folder (`styles.css`)
   - `js/` folder (`app.js`, `data.js`, `modules/`)
   - `LICENSE`
   - `.gitignore`
3. Click **Commit changes**.

### Method 3: Using a GitHub Personal Access Token (PAT)
If you generate a GitHub Personal Access Token at [https://github.com/settings/tokens](https://github.com/settings/tokens) with `repo` permissions:
Run in PowerShell:
```powershell
$env:PATH = "$env:LOCALAPPDATA\MinGit\cmd;$env:PATH"
git push https://<YOUR_TOKEN>@github.com/zeeshansarwar1986/ZEE-CDR-Forensic.git main
```

---

## 2. اردو گائیڈ (سٹیپ بائی سٹیپ طریقہ)

آپ کا پورا پروجیکٹ اور ریڈمی فائل لوکل طور پر گٹ ہب ریپوزٹری کے ساتھ لنک کر دی گئی ہے۔

### طریقہ نمبر 1: "PUSH_TO_GITHUB.bat" پر ڈبل کلک کریں (سب سے تیز ترین)
1. اپنے فولڈر `c:\Users\hp\Documents\CDR App\` میں موجود **`PUSH_TO_GITHUB.bat`** فائل پر ڈبل کلک کریں۔
2. سامنے کھلنے والی ونڈو میں اپنا گٹ ہب یوزرنیم (`zeeshansarwar1986`) اور ٹوکن (یا پاس ورڈ) درج کریں۔
3. آپ کا مکمل پروجیکٹ اور ریڈمی فائل فوراً گٹ ہب پر اپ لوڈ ہو جائے گی!

### طریقہ نمبر 2: ویب براؤزر کے ذریعے ڈائریکٹ اپ لوڈ (سب سے آسان)
1. براؤزر میں یہ لنک کھولیں:
   [https://github.com/zeeshansarwar1986/ZEE-CDR-Forensic/upload/main](https://github.com/zeeshansarwar1986/ZEE-CDR-Forensic/upload/main)
2. اپنے فولڈر `c:\Users\hp\Documents\CDR App` کی تمام فائلیں (`index.html`, `README.md`, `css`, `js`) سلیکٹ کر کے گٹ ہب پر ڈریگ اینڈ ڈراپ (Drag & Drop) کر دیں۔
3. نیچے **Commit changes** کے بٹن پر کلک کریں۔

---

### مفت لائیو ویب سائٹ آن لائن کرنے کا طریقہ (GitHub Pages)
اپ لوڈ کے بعد اگر آپ اس ایپ کو دنیا بھر میں لائیو انٹرنیٹ پر چلانا چاہتے ہیں:
1. اپنے گٹ ہب ریپوزٹری پیج کی **Settings** میں جائیں:
   `https://github.com/zeeshansarwar1986/ZEE-CDR-Forensic/settings/pages`
2. **Build and deployment -> Branch** میں `main` منتخب کریں اور **Save** پر کلک کریں۔
3. 1 منٹ کے اندر آپ کی ویب سائٹ اس ایڈریس پر لائیو ہو جائے گی:
   **`https://zeeshansarwar1986.github.io/ZEE-CDR-Forensic/`**

---

## 3. الدليل باللغة العربية

المشروع جاهز ومُعد بالكامل للرفع على مستودعك:
`https://github.com/zeeshansarwar1986/ZEE-CDR-Forensic.git`

### الطريقة 1: تشغيل ملف `PUSH_TO_GITHUB.bat`
انقر نقراً مزدوجاً على الملف `PUSH_TO_GITHUB.bat` داخل المجلد، ثم أدخل اسم المستخدم وكلمة المرور أو رمز الوصول الخاص بك ليتم الرفع فوراً.

### الطريقة 2: السحب والإفلات عبر المتصفح
افتح الرابط: [https://github.com/zeeshansarwar1986/ZEE-CDR-Forensic/upload/main](https://github.com/zeeshansarwar1986/ZEE-CDR-Forensic/upload/main) واسحب جميع الملفات والمجلدات ثم اضغط **Commit changes**.
