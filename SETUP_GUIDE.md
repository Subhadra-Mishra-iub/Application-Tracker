# Setup Guide - Job Application Tracker

This guide provides detailed step-by-step instructions to set up the Job Application Tracker Google Apps Script.

## Prerequisites Checklist

Before starting, ensure you have:
- [ ] A Gmail account with job-related emails
- [ ] Access to Google Sheets
- [ ] Basic familiarity with Google Apps Script

## Step-by-Step Setup

### Step 1: Prepare Gmail

1. **Open Gmail** in your browser
2. **Create the "Job Search" label**:
   - Click on the gear icon (Settings) in the top right
   - Go to "Labels" tab
   - Click "Create new label"
   - Name it exactly: `Job Search`
   - Click "Create"

3. **Apply the label to relevant emails**:
   - Select emails related to job applications, rejections, interviews
   - Click the "Labels" button (tag icon)
   - Select "Job Search"
   - Click "Apply"

### Step 2: Create Google Sheet

1. **Go to Google Sheets**: [sheets.google.com](https://sheets.google.com)
2. **Create a new spreadsheet**:
   - Click the "+" button to create a new sheet
   - Name it "Job Application Tracker"
3. **Note the URL**: Copy the spreadsheet URL for later reference

### Step 3: Set Up Google Apps Script

1. **Open Google Apps Script**: [script.google.com](https://script.google.com)
2. **Create new project**:
   - Click "New Project"
   - Name it "Job Application Tracker"
3. **Replace default code**:
   - Delete all content in the default `Code.gs` file
   - Copy the entire content from `JobApplicationTracker.gs`
   - Paste it into the editor
4. **Save the project**: Press Ctrl+S (or Cmd+S on Mac)

### Step 4: Enable Required Services

1. **In the Apps Script editor**, click the "+" icon next to "Services"
2. **Add Gmail API**:
   - Search for "Gmail API"
   - Click "Add"
3. **Add Google Sheets API**:
   - Search for "Google Sheets API"
   - Click "Add"
4. **Click "Done"**

### Step 5: Link Script to Your Sheet

1. **Go back to your Google Sheet**
2. **Open Apps Script from the sheet**:
   - Click "Extensions" in the menu
   - Select "Apps Script"
3. **This will open the Apps Script editor linked to your sheet**
4. **Copy the code again**:
   - Delete any existing code
   - Copy from `JobApplicationTracker.gs`
   - Paste into the editor
5. **Save the project**

### Step 6: Initial Setup and Permissions

1. **Run the initial setup**:
   - In the Apps Script editor, select `runOnce` from the function dropdown
   - Click the "Run" button (play icon)
2. **Grant permissions**:
   - A popup will appear asking for permissions
   - Click "Review Permissions"
   - Choose your Google account
   - Click "Advanced" → "Go to [Project Name] (unsafe)"
   - Click "Allow"
3. **Wait for completion**: The script will run and create the initial sheets

### Step 7: Set Up Daily Trigger

1. **Create automatic daily trigger**:
   - Select `createDailyTrigger` from the function dropdown
   - Click "Run"
   - This sets up automatic daily runs at 9 AM
2. **Verify trigger creation**:
   - In the Apps Script editor, click on "Triggers" (clock icon)
   - You should see a trigger for `updateJobTracker` running daily

### Step 8: Test the Setup

1. **Go back to your Google Sheet**
2. **Check for the menu**:
   - You should see a "Job Tracker" menu in the top menu bar
   - If not visible, refresh the page
3. **Test manual run**:
   - Click "Job Tracker" → "Run Now"
   - Check if new data appears in the "Applications" sheet
4. **Verify sheets created**:
   - You should have three sheets:
     - **Applications** (main data)
     - **Daily Summary** (summary by date)
     - **Processed** (hidden, tracks processed emails)

## Verification Checklist

After setup, verify these items:

- [ ] Gmail has "Job Search" label created
- [ ] Google Sheet has three tabs: Applications, Daily Summary, Processed
- [ ] "Job Tracker" menu appears in Google Sheet
- [ ] Manual "Run Now" works and adds data
- [ ] Daily trigger is set up (check Apps Script Triggers)
- [ ] No error messages in Apps Script execution logs

## Troubleshooting Common Issues

### Issue: "Job Tracker" menu not appearing
**Solution**: 
- Refresh the Google Sheet page
- Check that the `onOpen()` function is in your script
- Ensure the script is saved

### Issue: No emails found
**Solution**:
- Verify "Job Search" label exists in Gmail
- Apply the label to some test emails
- Check the Gmail search query in the CONFIG section

### Issue: Permission errors
**Solution**:
- Re-run the `runOnce` function
- Grant all requested permissions
- Check that Gmail and Sheets APIs are enabled

### Issue: Script not running automatically
**Solution**:
- Check the Triggers section in Apps Script
- Re-run `createDailyTrigger` function
- Verify the trigger time is set correctly

## Next Steps

Once setup is complete:

1. **Apply "Job Search" label** to existing job-related emails
2. **Run "Run Now"** to populate initial data
3. **Customize settings** if needed (see README.md for configuration options)
4. **Monitor the Daily Summary** sheet for insights

## Support

If you encounter issues:
1. Check the Apps Script execution logs
2. Verify all prerequisites are met
3. Review the troubleshooting section in README.md
4. Ensure all permissions are granted

---

**Created by Subhadra Mishra**
