/**
 * =========================================================================
 * Peninsula Yachts — Google Sheets 3-Step Lead Integration
 * Worksheet: "Peninsula yachts contacts"
 * 
 * Columns:
 * A: Date & Time
 * B: Email
 * C: Phone
 * D: Full Name
 * E: Address
 * F: Last Completed Step
 * G: Lead Status
 * H: Source
 * I: Lead ID
 * =========================================================================
 */

const SHEET_NAME = 'Peninsula yachts contacts';
const HEADERS = [
  'Date & Time',
  'Email',
  'Phone',
  'Full Name',
  'Address',
  'Last Completed Step',
  'Lead Status',
  'Source',
  'Lead ID'
];

/**
 * Formula Injection Protection:
 * Neutralizes any cell value beginning with =, +, -, @, tab, or newline
 * so that Google Sheets / Excel will never execute it as a formula or command.
 */
function sanitizeCellValue(val) {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  if (/^[=+\-@\t\r]/.test(str)) {
    return "'" + str;
  }
  return str;
}

/**
 * Get or create the target worksheet with styled headers
 */
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Insert headers
    sheet.appendRow(HEADERS);
    
    // Style header row
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#080D15');
    headerRange.setFontColor('#FAF8F5');
    sheet.setFrozenRows(1);
    
    // Auto-fit column widths
    for (let c = 1; c <= HEADERS.length; c++) {
      sheet.setColumnWidth(c, 160);
    }
  }
  
  return sheet;
}

/**
 * Finds the row index (1-based) matching the given Lead ID in Column I (9th column).
 * Returns -1 if not found.
 */
function findRowByLeadId(sheet, leadId) {
  if (!leadId) return -1;
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  
  // Column I is index 9
  const leadIdValues = sheet.getRange(2, 9, lastRow - 1, 1).getValues();
  for (let i = 0; i < leadIdValues.length; i++) {
    if (String(leadIdValues[i][0]).trim() === String(leadId).trim()) {
      return i + 2; // +2 accounts for 0-index and header row
    }
  }
  return -1;
}

/**
 * Main Webhook Receiver (POST)
 */
function doPost(e) {
  // Use ScriptLock to ensure concurrent submissions do not overwrite or duplicate rows
  const lock = LockService.getScriptLock();
  
  try {
    // Wait up to 30 seconds for concurrent requests to clear
    const acquired = lock.tryLock(30000);
    if (!acquired) {
      return createJsonResponse({
        success: false,
        error: 'System is busy processing previous requests. Please retry in a moment.'
      }, 503);
    }
    
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({ success: false, error: 'Empty request payload' }, 400);
    }
    
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    const leadId = sanitizeCellValue(payload.leadId);
    
    if (!leadId) {
      return createJsonResponse({ success: false, error: 'Missing Lead ID' }, 400);
    }
    
    const sheet = getOrCreateSheet();
    const now = payload.dateTime ? sanitizeCellValue(payload.dateTime) : Utilities.formatDate(new Date(), 'Australia/Melbourne', 'yyyy-MM-dd HH:mm:ss');
    
    // Handle Step 1: Email
    if (action === 'step1') {
      const email = sanitizeCellValue(payload.email);
      const source = sanitizeCellValue(payload.source || 'Aperio Website');
      
      // Check if leadId already exists (prevents duplicates on double-click or retry)
      const existingRow = findRowByLeadId(sheet, leadId);
      
      if (existingRow > 0) {
        // Update existing row
        sheet.getRange(existingRow, 2).setValue(email); // Column B: Email
        sheet.getRange(existingRow, 6).setValue(1);     // Column F: Last Completed Step
        sheet.getRange(existingRow, 7).setValue('Incomplete'); // Column G: Lead Status
        sheet.getRange(existingRow, 8).setValue(source);       // Column H: Source
      } else {
        // Append brand new row
        sheet.appendRow([
          now,                // A: Date & Time
          email,              // B: Email
          '',                 // C: Phone
          '',                 // D: Full Name
          '',                 // E: Address
          1,                  // F: Last Completed Step
          'Incomplete',       // G: Lead Status
          source,             // H: Source
          leadId              // I: Lead ID
        ]);
      }
      
      return createJsonResponse({
        success: true,
        action: 'step1',
        leadId: leadId,
        message: 'Step 1 recorded successfully in Google Sheets.'
      });
    }
    
    // Handle Step 2: Phone Number
    if (action === 'step2') {
      const phone = sanitizeCellValue(payload.phone);
      const existingRow = findRowByLeadId(sheet, leadId);
      
      if (existingRow > 0) {
        // Update matched row
        sheet.getRange(existingRow, 3).setValue(phone); // Column C: Phone
        sheet.getRange(existingRow, 6).setValue(2);     // Column F: Last Completed Step
        sheet.getRange(existingRow, 7).setValue('Incomplete'); // Column G: Lead Status
      } else {
        // If row wasn't found (edge case), append with known info
        sheet.appendRow([
          now,
          '',
          phone,
          '',
          '',
          2,
          'Incomplete',
          'Aperio Website',
          leadId
        ]);
      }
      
      return createJsonResponse({
        success: true,
        action: 'step2',
        leadId: leadId,
        message: 'Step 2 recorded successfully in Google Sheets.'
      });
    }
    
    // Handle Step 3: Full Name & Address
    if (action === 'step3') {
      const fullName = sanitizeCellValue(payload.fullName);
      const address = sanitizeCellValue(payload.address);
      const existingRow = findRowByLeadId(sheet, leadId);
      
      if (existingRow > 0) {
        // Update matched row
        sheet.getRange(existingRow, 4).setValue(fullName); // Column D: Full Name
        sheet.getRange(existingRow, 5).setValue(address);  // Column E: Address
        sheet.getRange(existingRow, 6).setValue(3);         // Column F: Last Completed Step
        sheet.getRange(existingRow, 7).setValue('Completed'); // Column G: Lead Status
      } else {
        sheet.appendRow([
          now,
          '',
          '',
          fullName,
          address,
          3,
          'Completed',
          'Aperio Website',
          leadId
        ]);
      }
      
      return createJsonResponse({
        success: true,
        action: 'step3',
        leadId: leadId,
        message: 'Step 3 completed and recorded successfully in Google Sheets.'
      });
    }
    
    return createJsonResponse({ success: false, error: 'Unknown action: ' + action }, 400);
    
  } catch (err) {
    return createJsonResponse({
      success: false,
      error: err.toString()
    }, 500);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Health check / Ping endpoint (GET)
 */
function doGet(e) {
  try {
    const sheet = getOrCreateSheet();
    const rowCount = Math.max(0, sheet.getLastRow() - 1);
    return createJsonResponse({
      status: 'active',
      sheetName: SHEET_NAME,
      leadCount: rowCount,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return createJsonResponse({
      status: 'error',
      message: err.toString()
    }, 500);
  }
}

/**
 * Helper to return a JSON response with proper CORS headers
 */
function createJsonResponse(data, statusCode) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
