# Configuration Guide - Job Application Tracker

This guide explains all the configurable settings in the Job Application Tracker script.

## Main Configuration Object

All settings are defined in the `CONFIG` object at the top of the script:

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

## Configuration Options

### Sheet Names

```javascript
SHEET_NAME: 'Applications'           // Main data sheet
PROCESSED_SHEET: 'Processed'         // Hidden tracking sheet
SUMMARY_SHEET: 'Daily Summary'       // Summary sheet
```

**Customization**: Change these to use different sheet names if needed.

### Gmail Label

```javascript
LABEL: 'Job Search'
```

**Customization**: 
- Change to any existing Gmail label name
- Must match exactly (case-sensitive)
- The label must exist in your Gmail account

### Lookback Period

```javascript
LOOKBACK_DAYS: 7
```

**Customization**:
- Number of days to look back when running manually
- Higher values = more emails processed but slower performance
- Recommended: 7-30 days

### Gmail Search Query

```javascript
BASE_QUERY:
  '("thank you for applying" OR "application received" OR subject:applied OR ' +
  'subject:"your application" OR subject:rejected OR subject:interview OR ' +
  'subject:"next steps" OR subject:"assessment" OR subject:"shortlisted")'
```

**Customization**: Add or modify search terms to match your email patterns.

#### Common Search Terms to Add:

```javascript
// For job offers
'OR subject:"offer" OR subject:"hired" OR subject:"welcome" OR subject:"congratulations"'

// For technical assessments
'OR subject:"coding" OR subject:"hackerrank" OR subject:"codility" OR subject:"leetcode"'

// For scheduling
'OR subject:"schedule" OR subject:"calendar" OR subject:"meeting"'

// For rejections
'OR subject:"unfortunately" OR subject:"regret" OR subject:"decline"'
```

## Trigger Configuration

### Daily Trigger Time

```javascript
function createDailyTrigger() {
  deleteAllTriggers_();
  ScriptApp.newTrigger('updateJobTracker')
    .timeBased()
    .everyDays(1)
    .atHour(9)     // ← Change this number (0-23)
    .create();
}
```

**Customization**:
- Change `atHour(9)` to any hour (0-23)
- 0 = midnight, 9 = 9 AM, 17 = 5 PM, etc.

### Trigger Frequency

```javascript
// Daily (current)
.everyDays(1)

// Every 2 days
.everyDays(2)

// Weekly
.everyWeeks(1)

// Hourly (not recommended for this use case)
.everyHours(1)
```

## Status Detection Patterns

The script automatically categorizes emails based on subject line patterns:

### Current Status Categories

```javascript
const status =
  /reject|declin|unsuccessful|no longer under consideration/i.test(subj) ? 'Rejected' :
  /interview|schedule|next step|phone screen|assessment|coding test|hackerank|codility/i.test(subj) ? 'Interview/Next Step' :
  /apply|application|received|thank you for applying|we received your/i.test(subj) ? 'Applied/Auto-ack' :
  'Other';
```

### Adding New Status Categories

```javascript
const status =
  /reject|declin|unsuccessful|no longer under consideration/i.test(subj) ? 'Rejected' :
  /offer|hired|welcome|congratulations/i.test(subj) ? 'Offer/Accepted' :           // New category
  /withdraw|cancel|decline/i.test(subj) ? 'Withdrawn' :                            // New category
  /interview|schedule|next step|phone screen|assessment|coding test|hackerank|codility/i.test(subj) ? 'Interview/Next Step' :
  /apply|application|received|thank you for applying|we received your/i.test(subj) ? 'Applied/Auto-ack' :
  'Other';
```

## Company/Role Extraction

### Company Name Patterns

The script extracts company names using these patterns:

1. **From subject line**: "at Company Name" or "with Company Name"
2. **From sender display name**: If not a generic email
3. **From email domain**: As fallback

### Role Extraction Patterns

```javascript
const patterns = [
  /(?:application|applied|consideration|interview|assessment|screen(?:ing)?|invite|schedule|offer)\s*(?:for|to)?\s*(?:the\s*)?(?:position|role|job)?\s*[""]?(.+?)[""]?(?:\s+(?:at|with|in)\s+|$)/i,
  /(?:for|as)\s+[""]?(.+?)[""]?(?:\s+(?:at|with|in)\s+|$)/i,
  /position[:\s-]+[""]?(.+?)[""]?(?:\s+(?:at|with|in)\s+|$)/i,
  /role[:\s-]+[""]?(.+?)[""]?(?:\s+(?:at|with|in)\s+|$)/i
];
```

**Customization**: Add new patterns to match your email formats.

## Performance Settings

### Thread Limit

```javascript
const threads = fetchAllThreads_(query, 500); // cap for safety
```

**Customization**:
- Increase for more emails processed per run
- Decrease if hitting time limits
- Recommended: 100-1000

### Page Size

```javascript
const pageSize = 100;
```

**Customization**:
- Number of threads fetched per API call
- Higher values = faster but more memory usage
- Recommended: 50-200

## Email Filtering

### Generic Email Domains

The script filters out generic email domains when extracting company names:

```javascript
/(do.?not.?reply|no.?reply|noreply|careers|jobs|hr|talent|notification|support|team|system|workday|greenhouse|lever|icims|bamboohr)/i
```

**Customization**: Add or remove domains as needed.

### Company Name Cleaning

```javascript
function cleanCompany_(name) {
  return titleCase_(name.replace(/\s*(careers|recruiting|talent acquisition|notifications?|support)\s*$/i, '').trim());
}
```

**Customization**: Add more terms to remove from company names.

## Advanced Customization

### Custom Date Format

```javascript
function formatDate_(d) {
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}
```

**Customization**: Change date format as needed:
- `'MM/dd/yyyy'` for US format
- `'dd/MM/yyyy'` for European format
- `'yyyy-MM-dd HH:mm'` to include time

### Custom Time Zone

```javascript
Session.getScriptTimeZone()
```

**Customization**: Replace with specific timezone:
- `'America/New_York'`
- `'Europe/London'`
- `'Asia/Tokyo'`

## Example Custom Configurations

### For Technical Jobs

```javascript
const CONFIG = {
  SHEET_NAME: 'Tech Applications',
  PROCESSED_SHEET: 'Processed',
  SUMMARY_SHEET: 'Daily Summary',
  LOOKBACK_DAYS: 14,
  LABEL: 'Tech Jobs',
  BASE_QUERY:
    '("thank you for applying" OR "application received" OR subject:applied OR ' +
    'subject:"your application" OR subject:rejected OR subject:interview OR ' +
    'subject:"next steps" OR subject:"assessment" OR subject:"shortlisted" OR ' +
    'subject:"coding" OR subject:"hackerrank" OR subject:"leetcode" OR ' +
    'subject:"technical" OR subject:"programming")'
};
```

### For Multiple Job Types

```javascript
const CONFIG = {
  SHEET_NAME: 'All Applications',
  PROCESSED_SHEET: 'Processed',
  SUMMARY_SHEET: 'Daily Summary',
  LOOKBACK_DAYS: 30,
  LABEL: 'Job Applications',
  BASE_QUERY:
    '("thank you for applying" OR "application received" OR subject:applied OR ' +
    'subject:"your application" OR subject:rejected OR subject:interview OR ' +
    'subject:"next steps" OR subject:"assessment" OR subject:"shortlisted" OR ' +
    'subject:"offer" OR subject:"hired" OR subject:"welcome" OR ' +
    'subject:"unfortunately" OR subject:"regret" OR subject:"decline")'
};
```

## Best Practices

1. **Start with default settings** and customize as needed
2. **Test changes** with a small lookback period first
3. **Monitor execution logs** for performance issues
4. **Backup your script** before making major changes
5. **Use descriptive sheet names** for better organization

---

**Note**: After making configuration changes, save the script and test with the "Run Now" function to ensure everything works correctly.
