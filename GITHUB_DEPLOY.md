# GitHub Upload & Deployment Guide - ZEE CDR Forensic
**Zee Meta Advertising Agency (Reg)**

---

## 🌐 MULTI-LINGUAL INDEX / فہرست / الفهرس

1. [English GitHub Guide](#1-english-github-guide)
2. [اردو میں گٹ ہب اپ لوڈ گائیڈ](#2-اردو-میں-گٹ-ہب-اپ-لوڈ-گائیڈ)
3. [دليل الرفع على GitHub باللغة العربية](#3-دليل-الرفع-على-github-باللغة-العربية)

---

## 1. ENGLISH GITHUB GUIDE

### Method A: Web Browser Upload (Simplest - No Git Required)
1. Go to [https://github.com/new](https://github.com/new) and log into your GitHub account.
2. Enter Repository Name: `ZEE-CDR-Forensic`
3. Select **Public**, leave "Add a README file" unchecked, and click **Create repository**.
4. On the new repository page, click the link **"uploading an existing file"**.
5. Drag and drop all files and folders from `c:\Users\hp\Documents\CDR App` into the browser:
   - `index.html`
   - `css/` folder (`css/styles.css`)
   - `js/` folder (`js/app.js`, `js/data.js`, `js/modules/`)
   - `README.md`
   - `LICENSE`
   - `.gitignore`
6. Click **Commit changes**.

### Method B: GitHub Desktop (Recommended Desktop App)
1. Download & Install [GitHub Desktop](https://desktop.github.com/).
2. Open GitHub Desktop and click **File -> Add Local Repository**.
3. Choose path: `c:\Users\hp\Documents\CDR App`.
4. Click **Publish repository** to push it directly to your GitHub account!

### Method C: Git CLI (Command Line)
Open PowerShell inside `c:\Users\hp\Documents\CDR App` and run:
```bash
git init
git add .
git commit -m "Initial release: ZEE CDR Forensic V5.2.0"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ZEE-CDR-Forensic.git
git push -u origin main
```

---

### How to Enable Free Live Web Hosting (GitHub Pages)
Once uploaded to GitHub:
1. Open your repository page: `https://github.com/YOUR_USERNAME/ZEE-CDR-Forensic`
2. Click **Settings** (top right tab).
3. In the left sidebar, click **Pages**.
4. Under **Build and deployment -> Branch**, select `main` branch and `/ (root)` folder.
5. Click **Save**.
6. Within 1 minute, your app will be live at:
   `https://YOUR_USERNAME.github.io/ZEE-CDR-Forensic/`

---

## 2. اردو میں گٹ ہب اپ لوڈ گائیڈ

### طریقہ 1: ویب براؤزر کے ذریعے اپ لوڈ (سب سے آسان - بغیر کسی سافٹ ویئر کے)
1. براؤزر میں [https://github.com/new](https://github.com/new) کھولیں اور اپنے گٹ ہب اکاؤنٹ میں لاگ ان کریں۔
2. ریپوزٹری کا نام رکھیں: `ZEE-CDR-Forensic`
3. **Public** منتخب کریں اور **Create repository** بٹن پر کلک کریں۔
4. اگلے پیج پر **"uploading an existing file"** والے لنکس پر کلک کریں۔
5. فولڈر `c:\Users\hp\Documents\CDR App` کی تمام فائلیں (`index.html`, `css`, `js`, `README.md`) ڈریگ کر کے گٹ ہب پر ڈراپ کر دیں۔
6. نیچے **Commit changes** پر کلک کریں۔

### طریقہ 2: گٹ ہب ڈیسک ٹاپ کے ذریعے (GitHub Desktop App)
1. [GitHub Desktop](https://desktop.github.com/) ڈاؤن لوڈ کریں۔
2. ایپ کھول کر **File -> Add Local Repository** پر کلک کریں۔
3. پاتھ سیٹ کریں: `c:\Users\hp\Documents\CDR App`
4. **Publish repository** بٹن دبائیں، آپ کا تمام کوڈ گٹ ہب پر منتقل ہو جائے گا!

---

### مفت لائیو ویب سائٹ آن لائن کرنے کا طریقہ (GitHub Pages)
کوڈ اپ لوڈ ہونے کے بعد:
1. اپنے گٹ ہب پیج `https://github.com/YOUR_USERNAME/ZEE-CDR-Forensic` پر جائیں۔
2. اوپر **Settings** ٹیب پر کلک کریں۔
3. بائیں جانب **Pages** پر کلک کریں۔
4. Branch میں `main` منتخب کریں اور **Save** پر کلک کریں۔
5. 1 منٹ میں آپ کی ویب ایپ اس لنک پر لائیو چل جائے گی:
   `https://YOUR_USERNAME.github.io/ZEE-CDR-Forensic/`

---

## 3. دليل الرفع على GitHub باللغة العربية

### الطريقة الأولى: الرفع عبر متصفح الويب (الأسهل بدون برامج)
1. افتح الرابط [https://github.com/new](https://github.com/new) وسجل الدخول لحسابك.
2. اكتب اسم المستودع: `ZEE-CDR-Forensic`
3. اختر **Public** ثم اضغط على **Create repository**.
4. اضغط على خيار **"uploading an existing file"**.
5. اسحب وانسخ جميع ملفات المجسد `c:\Users\hp\Documents\CDR App` إلى المتصفح.
6. اضغط **Commit changes**.

### تشغيل الموقع مجاناً أونلاين (GitHub Pages):
من إعدادات المستودع **Settings -> Pages** اختر الفرع `main` واضغط **Save**. سيعمل الموقع مباشرة على الرابط:
`https://YOUR_USERNAME.github.io/ZEE-CDR-Forensic/`
