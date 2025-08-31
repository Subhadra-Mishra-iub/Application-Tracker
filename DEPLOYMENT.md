# Quick Deployment Guide - Job Application Tracker

## 🚀 Quick Start (5 minutes)

### 1. Gmail Setup
- Create label: "Job Search" in Gmail
- Apply to job-related emails

### 2. Google Apps Script Setup
1. Go to [script.google.com](https://script.google.com)
2. Create new project
3. Copy `JobApplicationTracker.gs` content
4. Enable Gmail API and Google Sheets API

### 3. Google Sheet Setup
1. Create new Google Sheet
2. Go to Extensions → Apps Script
3. Paste the code again
4. Save project

### 4. Initial Run
1. Run `runOnce` function
2. Grant permissions
3. Run `createDailyTrigger` function

### 5. Test
- Check for "Job Tracker" menu in sheet
- Click "Run Now" to test

## 📋 Checklist

- [ ] Gmail "Job Search" label created
- [ ] Google Apps Script project created
- [ ] Code pasted and saved
- [ ] APIs enabled (Gmail + Sheets)
- [ ] Google Sheet created and linked
- [ ] Initial setup run (`runOnce`)
- [ ] Daily trigger created (`createDailyTrigger`)
- [ ] "Job Tracker" menu appears
- [ ] Manual test successful

## 🔧 Common Issues

| Issue | Solution |
|-------|----------|
| No menu | Refresh sheet page |
| No emails found | Check label exists and is applied |
| Permission errors | Re-run setup functions |
| Script not running | Check triggers in Apps Script |

## 📞 Support

- Check execution logs in Apps Script
- Review `SETUP_GUIDE.md` for detailed steps
- See `CONFIG.md` for customization options

---

**Created by Subhadra Mishra**

