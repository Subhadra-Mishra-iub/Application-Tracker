# Job Application Tracker

A Google Apps Script that automatically tracks job applications by scanning Gmail for job-related emails and maintaining a comprehensive spreadsheet with daily summaries.

## Features

- **Automatic Email Scanning**: Scans Gmail for job-related emails using smart queries
- **Smart Parsing**: Automatically extracts company names, job roles, and application status
- **Deduplication**: Prevents duplicate entries using message IDs
- **Daily Summary**: Maintains a summary sheet showing applications and rejections per date
- **Customizable Triggers**: Set up daily automatic runs at your preferred time
- **Easy Menu Interface**: Access all functions directly from Google Sheets

## Setup Instructions

### Prerequisites

1. **Gmail Account**: You need a Gmail account with job-related emails
2. **Google Sheets**: Create a new Google Sheet where the data will be stored
3. **Gmail Label**: Create a label called "Job Search" in Gmail and apply it to relevant emails

### Step 1: Create Gmail Label

1. Open Gmail
2. Go to Settings → Labels
3. Create a new label called "Job Search"
4. Apply this label to emails from job applications, rejections, interviews, etc.

### Step 2: Set Up Google Apps Script

1. **Open Google Apps Script**:
   - Go to [script.google.com](https://script.google.com)
   - Click "New Project"

2. **Copy the Code**:
   - Delete the default `Code.gs` content
   - Copy the entire content from `JobApplicationTracker.gs` and paste it into the editor

3. **Save the Project**:
   - Click "Save" (Ctrl+S or Cmd+S)
   - Name your project "Job Application Tracker"

### Step 3: Enable Required APIs

1. **Enable Gmail API**:
   - In the Apps Script editor, click on "Services" (+ icon)
   - Add "Gmail API"
   - Click "Add"

2. **Enable Google Sheets API**:
   - Add "Google Sheets API" as well
   - Click "Add"

### Step 4: Create Google Sheet

1. **Create New Sheet**:
   - Go to [sheets.google.com](https://sheets.google.com)
   - Create a new Google Sheet
   - Name it "Job Application Tracker"

2. **Link Script to Sheet**:
   - In your Google Sheet, go to Extensions → Apps Script
   - This will open the Apps Script editor
   - Copy the code from `JobApplicationTracker.gs` here
   - Save the project

### Step 5: Initial Setup

1. **Run Initial Setup**:
   - In the Apps Script editor, select the `runOnce` function from the dropdown
   - Click the "Run" button
   - Grant necessary permissions when prompted

2. **Create Daily Trigger**:
   - Select the `createDailyTrigger` function
   - Click "Run"
   - This sets up automatic daily runs at 9 AM (you can modify the time in the code)

### Step 6: Verify Setup

1. **Check Sheets Created**:
   - Your Google Sheet should now have three tabs:
     - **Applications**: Main data sheet with all job applications
     - **Daily Summary**: Summary of applications and rejections by date
     - **Processed**: Hidden sheet tracking processed emails

2. **Test Manual Run**:
   - In your Google Sheet, you should see a "Job Tracker" menu
   - Click "Job Tracker" → "Run Now" to test the functionality

## Configuration

### Customizing Settings

Edit the `CONFIG` object in the script to customize:

```javascript
const CONFIG = {
  SHEET_NAME: 'Applications',        // Main sheet name
  PROCESSED_SHEET: 'Processed',      // Hidden sheet for processed MessageIds
  SUMMARY_SHEET: 'Daily Summary',    // Summary sheet name
  LOOKBACK_DAYS: 7,                  // Backfill window for manual runs
  LABEL: 'Job Search',               // Gmail label to filter job emails
  BASE_QUERY: '...'                  // Gmail search query
};
```

### Changing Trigger Time

To change the daily trigger time, modify the `createDailyTrigger` function:

```javascript
function createDailyTrigger() {
  deleteAllTriggers_();
  ScriptApp.newTrigger('updateJobTracker')
    .timeBased()
    .everyDays(1)
    .atHour(10)     // Change this number (0-23)
    .create();
}
```

## Usage

### Manual Operations

1. **Run Now**: Manually trigger the tracker to scan for new emails
2. **Update Daily Summary**: Refresh the summary sheet
3. **Enrich Existing Rows**: Fill in missing company/role information for existing entries
4. **Recreate Daily Trigger**: Reset the automatic daily trigger

### Understanding the Data

#### Applications Sheet Columns:
- **Date**: Email date (YYYY-MM-DD format)
- **Company**: Extracted company name
- **Role**: Extracted job role/position
- **Status**: Application status (Applied/Auto-ack, Rejected, Interview/Next Step, Other)
- **Subject**: Email subject line
- **From**: Sender information
- **ThreadId**: Gmail thread ID
- **MessageId**: Unique message identifier
- **Link**: Direct link to the email thread

#### Daily Summary Sheet:
- **Date**: Date in YYYY-MM-DD format
- **Applications**: Number of applications received that day
- **Rejections**: Number of rejections received that day
- **Last Updated**: Timestamp of last summary update

## Troubleshooting

### Common Issues

1. **No Emails Found**:
   - Ensure you have the "Job Search" label created in Gmail
   - Apply the label to relevant emails
   - Check that emails match the search query in `BASE_QUERY`

2. **Permission Errors**:
   - Make sure you've granted all necessary permissions
   - Re-run the setup functions if needed

3. **Script Not Running**:
   - Check that the trigger is properly set up
   - Verify the script is saved and deployed

4. **Missing Company/Role Data**:
   - Use "Enrich Existing Rows" to fill missing data
   - The parser works best with well-formatted email subjects

### Debugging

- Use `Logger.log()` statements in the script to debug
- Check the execution logs in Apps Script editor
- Verify Gmail search queries work manually in Gmail

## Advanced Features

### Custom Email Queries

Modify the `BASE_QUERY` in the CONFIG to include additional search terms:

```javascript
BASE_QUERY:
  '("thank you for applying" OR "application received" OR subject:applied OR ' +
  'subject:"your application" OR subject:rejected OR subject:interview OR ' +
  'subject:"next steps" OR subject:"assessment" OR subject:"shortlisted" OR ' +
  'subject:"offer" OR subject:"hired")'
```

### Custom Status Detection

Add new status patterns in the `parseSubject_` function:

```javascript
const status =
  /reject|declin|unsuccessful|no longer under consideration/i.test(subj) ? 'Rejected' :
  /offer|hired|welcome|congratulations/i.test(subj) ? 'Offer/Accepted' :
  /interview|schedule|next step|phone screen|assessment|coding test|hackerank|codility/i.test(subj) ? 'Interview/Next Step' :
  /apply|application|received|thank you for applying|we received your/i.test(subj) ? 'Applied/Auto-ack' :
  'Other';
```

## Author

**Subhadra Mishra**

This project was created to streamline the job application tracking process by automating the collection and organization of job-related emails into a comprehensive spreadsheet with daily summaries.

## License

This project is open source and available under the MIT License.

## Contributing

Feel free to submit issues and enhancement requests!

---

**Note**: This script requires appropriate Gmail and Google Sheets permissions. Make sure to review and understand the permissions before running the script.
