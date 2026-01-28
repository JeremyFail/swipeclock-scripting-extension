import * as vscode from 'vscode';

/**
 * MAINTAINER: Adding new scripting properties or functions
 * -----------------------------------------------
 * When adding new employee, reportingdate, or global items, update:
 *
 * 1. EMPLOYEE PROPERTIES: Add to employeeProperties array below.
 *    - Diagnostics (invalid property errors) and completion/hover use this list.
 *    - For numbered fields (department1-9, location1-9, home1-9, payrate1-9) no change needed;
 *      they are generated from the 1-9 range.
 *
 * 2. REPORTINGDATE PROPERTIES: Add to reportingDateProperties array.
 *
 * 3. GLOBAL FUNCTIONS: Add to globalFunctions array.
 *    - Use optional "overloads" for functions with multiple signatures (e.g. round).
 *
 * 4. GLOBAL TIMECARD PROPERTIES: Add to globalProperties array (used in completion + hover).
 *
 * 5. DIAGNOSTICS: src/diagnosticsProvider.ts
 *    - validEmployeeProperties / validReportingDateProperties are built from the arrays above,
 *      so no change needed unless you add new numbered patterns.
 *    - reservedWords: add any new global function or property name so it is not flagged as an undefined variable.
 *
 * 6. SEMANTIC HIGHLIGHTING (optional): src/semanticTokensProvider.ts
 *    - If you want new keywords to get special highlighting, add patterns there.
 *
 * 7. SYNTAX HIGHLIGHTING (optional): syntaxes/swipeclock.tmLanguage.json
 *    - Only if you need new token patterns (e.g. new keyword classes).
 */

// Employee object properties
export const employeeProperties = [
  { name: 'yearsofservice', detail: 'decimal number', documentation: 'Years of service as a decimal number' },
  { name: 'daysofservice', detail: 'decimal number', documentation: 'Days of service as a decimal number' },
  { name: 'monthsofservice', detail: 'decimal number', documentation: 'Months of service as a decimal number' },
  { name: 'anniversary', detail: 'number', documentation: 'Returns a whole number on the anniversary date of the employee' },
  { name: 'monthiversary', detail: 'number', documentation: 'Returns a whole number on the month of the anniversary date' },
  { name: 'title', detail: 'string', documentation: 'Employee title' },
  { name: 'firstname', detail: 'string', documentation: 'Employee first name' },
  { name: 'lastname', detail: 'string', documentation: 'Employee last name' },
  { name: 'code', detail: 'string', documentation: 'Employee code (same as employeecode)' },
  { name: 'employeecode', detail: 'string', documentation: 'Employee code (same as code)' },
  { name: 'designation', detail: 'string', documentation: 'Employee designation' },
  { name: 'startdate', detail: 'date', documentation: 'Employee start date' },
  { name: 'enddate', detail: 'date', documentation: 'Employee end date' },
  { name: 'department', detail: 'string', documentation: 'Default department' },
  { name: 'location', detail: 'string', documentation: 'Default location' },
  { name: 'supervisor', detail: 'string', documentation: 'Employee supervisor' },
  { name: 'home1', detail: 'string', documentation: 'Home field 1' },
  { name: 'home2', detail: 'string', documentation: 'Home field 2' },
  { name: 'home3', detail: 'string', documentation: 'Home field 3' },
  { name: 'autolunchhours', detail: 'number', documentation: 'Auto lunch hours' },
  { name: 'lunchminutes', detail: 'number', documentation: 'Lunch minutes' },
  { name: 'accrualfactor', detail: 'number', documentation: 'Accrual factor' },
  { name: 'employeetype', detail: 'string', documentation: 'Employee type' },
  { name: 'accrualvalidator', detail: 'string', documentation: 'Accrual validator (when BasicAccruals rule is activated)' },
  { name: 'payrate0', detail: 'number', documentation: 'Default pay rate' },
  { name: 'payrate1', detail: 'number', documentation: 'Pay rate 1' },
  { name: 'payrate2', detail: 'number', documentation: 'Pay rate 2' },
  { name: 'position', detail: 'string', documentation: 'Employee position. WorkforceHub accounts only.' },
  { name: 'exempt', detail: 'string', documentation: 'Employee exempt status: "yes", "no", or blank. WorkforceHub accounts only.' },
  { name: 'lasthiredate', detail: 'date', documentation: 'Employee last hire date. WorkforceHub accounts only.' }
];

// ReportingDate object properties
export const reportingDateProperties = [
  { name: 'tomorrow', detail: 'date', documentation: 'Returns the date of the next day' },
  { name: 'yesterday', detail: 'date', documentation: 'Returns the date of the previous day' },
  { name: 'date', detail: 'date', documentation: 'Returns the date of the timecard' },
  { name: 'year', detail: 'number', documentation: 'Returns the year of the timecard' },
  { name: 'month', detail: 'number', documentation: 'Returns the month of the timecard' },
  { name: 'weekday', detail: 'string', documentation: 'Returns the weekday as a letter: MTWRFSU' },
  { name: 'todaysdate', detail: 'date', documentation: 'Returns the current date' },
  { name: 'isfirstdayofmonth', detail: 'boolean', documentation: 'Returns true on the first day of the month' },
  { name: 'islastdayofmonth', detail: 'boolean', documentation: 'Returns true on the last day of the month' },
  { name: 'payperiodstart', detail: 'date', documentation: 'Returns the date of the first day of the pay period' },
  { name: 'payperiodend', detail: 'date', documentation: 'Returns the date of the last day of the pay period' },
  { name: 'isholiday', detail: 'boolean', documentation: 'Returns true if the date is a holiday' },
  { name: 'spread', detail: 'timespan', documentation: 'Returns the amount of time between first in punch and last out punch' },
  { name: 'totalhours', detail: 'number', documentation: 'Hours in the day' },
  { name: 'totalhoursot', detail: 'number', documentation: 'Hours in the day that are overtime eligible' },
  { name: 'hourstodate', detail: 'number', documentation: 'Hours to date in the week' },
  { name: 'hourstodateot', detail: 'number', documentation: 'Hours to date in the week that are overtime eligible' },
  { name: 'weekhours', detail: 'number', documentation: 'Hours in the week' },
  { name: 'pphours', detail: 'number', documentation: 'Hours in the pay period' },
  { name: 'islastpunchpp', detail: 'boolean', documentation: 'Last punch date of the pay period' },
  { name: 'islastpunchweek', detail: 'boolean', documentation: 'Last punch date of the week' },
  { name: 'totalweek', detail: 'function', documentation: 'Returns amounts in numeric prompts and dollar amounts in the work week. Requires argument: reportingdate.totalweek("<promptFieldName>")' },
  { name: 'totalpp', detail: 'function', documentation: 'Returns amounts in numeric prompts and dollar amounts in the pay period. Requires argument: reportingdate.totalpp("<promptFieldName>")' },
  { name: 'totalday', detail: 'function', documentation: 'Returns amounts in numeric prompts and dollar amounts on the day. Requires argument: reportingdate.totalday("<promptFieldName>")' },
  { name: 'punchsets', detail: 'number', documentation: 'Returns how many punch sets are in the day' },
  { name: 'depthours', detail: 'function', documentation: 'Returns hours allocated to a labor prompt. Requires arguments: reportingdate.depthours("<FieldName>", "<Value>")' },
  { name: 'schedhours', detail: 'function', documentation: 'Returns scheduled hours in the day. Optional argument: reportingdate.schedhours(<punchset>)' },
  { name: 'schedlines', detail: 'number', documentation: 'Returns the total amount of scheduled lines in the day' },
  { name: 'schedin', detail: 'function', documentation: 'Returns the in time of a scheduled line. Optional argument: reportingdate.schedin(<punchset>)' },
  { name: 'schedout', detail: 'function', documentation: 'Returns the out time of a scheduled line. Optional argument: reportingdate.schedout(<punchset>)' },
  { name: 'schedplace', detail: 'function', documentation: 'Returns the place of a scheduled line. Optional argument: reportingdate.schedplace(<punchset>)' },
  { name: 'workweekend', detail: 'date', documentation: 'Returns the date of the last day of the work week' }
];

// Global functions
export const globalFunctions = [
  { name: 'dateadd', signature: 'dateadd("mm", 6, employee.startdate)', detail: 'Adds days, months, or years to any date', documentation: 'dateadd(type, amount, date)\nType: "y", "mm", "d", "h", "n", "s"' },
  { name: 'dateserial', signature: 'dateserial(year, month, day)', detail: 'Constructs a date object', documentation: 'dateserial(reportingdate.year, 12, 31) returns Dec. 31st of the year' },
  { name: 'weekday', signature: 'weekday(date)', detail: 'Returns weekday as letter: MTWRFSU', documentation: 'weekday(punchdate) returns "M" if Monday' },
  { name: 'cdate', signature: 'cdate(string)', detail: 'Returns a date instead of a string', documentation: 'cdate("2014-11-25") returns the date 2014-11-25' },
  { name: 'cdatetime', signature: 'cdatetime(string)', detail: 'Returns a datetime value', documentation: 'cdatetime("2014-11-25 08:00:00") returns 2014-11-25 08:00:00' },
  { name: 'ctime', signature: 'ctime(datetime)', detail: 'Returns a time instead of a datetime', documentation: 'ctime(indt) returns 17:00:00 if the time is 5:00pm' },
  { name: 'day', signature: 'day(date)', detail: 'Returns the day of the date object', documentation: 'Returns the day number' },
  { name: 'month', signature: 'month(date)', detail: 'Returns the month of the date object', documentation: 'Returns the month number' },
  { name: 'year', signature: 'year(date)', detail: 'Returns the year of the date object', documentation: 'Returns the year number' },
  { name: 'val', signature: 'val(string)', detail: 'Converts a string into a number', documentation: 'val("5.555") returns 5.555. Null values return 0.' },
  { name: 'cint', signature: 'cint(value)', detail: 'Returns an integer', documentation: 'cint("5.555") returns 5. Null values throw an error.' },
  { name: 'cstr', signature: 'cstr(value)', detail: 'Returns a string', documentation: 'cstr(5.555) returns "5.555"' },
  { name: 'abs', signature: 'abs(number)', detail: 'Returns a positive number', documentation: 'abs(-5) returns 5' },
  { name: 'translate', signature: 'translate(field, list1, list2)', detail: 'Changes value from one to another', documentation: 'translate(department, "100|110|200", "Warehouse,Shipping,Accounting")' },
  { name: 'within', signature: 'within(field, list)', detail: 'Returns true if value matches list', documentation: 'within(department, "100|110|200") returns true if department is "110"' },
  { name: 'left', signature: 'left(string, count)', detail: 'Returns first N characters', documentation: 'left("this is the best", 4) returns "this"' },
  { name: 'right', signature: 'right(string, count)', detail: 'Returns last N characters', documentation: 'right("this is the best", 4) returns "best"' },
  { name: 'mid', signature: 'mid(string, start, count)', detail: 'Returns middle characters', documentation: 'mid("this is the best", 6, 2) returns "is"' },
  { 
    name: 'round', 
    signature: 'round(timeString) or round(number)', 
    detail: 'Rounds time or number', 
    documentation: 'round("7:45am-8:00am=8:00am") or round(5.555) returns 6',
    overloads: [
      {
        signature: 'round(timeString)',
        detail: 'Rounds punch times',
        documentation: 'Rounds time up or down to the desired time.\n\nExamples:\n- round("7:45am-8:00am=8:00am") - rounds 7:50am to 8:00am\n- round("N15") - rounds to nearest 15 minutes\n- round("U30") - rounds up to nearest 30 minutes\n- round("ID15") - rounds IN punch down to nearest 15 minutes',
        parameterTypes: ['string']
      },
      {
        signature: 'round(number)',
        detail: 'Rounds mathematical value',
        documentation: 'Rounds the value up or down to the nearest whole number.\n\nExample: round(5.555) returns 6\n\nNote: Cannot be used in RoundScript when rounding times occurs.',
        parameterTypes: ['number']
      }
    ]
  },
  { name: 'roundin', signature: 'roundin(timeString)', detail: 'Rounds the in time', documentation: 'roundin("7:45am-8:00am=8:00am")' },
  { name: 'roundout', signature: 'roundout(timeString)', detail: 'Rounds the out time', documentation: 'roundout("7:45am-8:00am=8:00am")' },
  { name: 'roundends', signature: 'roundends(timeString)', detail: 'Rounds first and last punch', documentation: 'roundends("7:45am-8:00am=8:00am")' },
  { name: 'roundtoschedule', signature: 'roundtoschedule(a1, a2, b1, b2)', detail: 'Rounds to schedule', documentation: 'roundtoschedule(0, 5, 0, 15) - minutes parameters for rounding' },
  { name: 'roundup', signature: 'roundup(number)', detail: 'Rounds value up', documentation: 'roundup(5.555) returns 6' },
  { name: 'rounddown', signature: 'rounddown(number)', detail: 'Rounds value down', documentation: 'rounddown(5.555) returns 5' },
  { name: 'addalert', signature: 'addalert(message)', detail: 'Puts an alert on the timecard', documentation: 'addalert("Late") puts "Late" on the timecard' },
  { name: 'unpay', signature: 'unpay(hours)', detail: 'Classifies hours as unpaid', documentation: 'unpay(hours) - hours don\'t count towards earnings' },
  { name: 'touches', signature: 'touches(startTime, endTime)', detail: 'Returns true if punch set touches time range', documentation: 'touches(6:00am, 3:00pm)' },
  { name: 'isedited', signature: 'isedited(property)', detail: 'Returns true if property was edited', documentation: 'isedited(category) - checks if category was edited' },
  { name: 'tomorrow', signature: 'tomorrow(0)', detail: 'Pushes punch to next day', documentation: 'tomorrow(0) - must have the 0 argument' },
  { name: 'yesterday', signature: 'yesterday(0)', detail: 'Pushes punch to previous day', documentation: 'yesterday(0) - must have the 0 argument' },
  { name: 'overlaps', signature: 'overlaps(startTime, endTime)', detail: 'Returns true if times overlap', documentation: 'Checks if times overlap the in and out times' },
  { name: 'overlap', signature: 'overlap(start1, end1, start2, end2)', detail: 'Returns overlap time', documentation: 'Returns amount of time (as Time Object) that times overlap' },
  { name: 'addentry', signature: 'addentry("type", amount, "category")', detail: 'Adds a new entry on time card', documentation: 'addentry("hours", 8, "Regular") - all three parameters required' },
  { name: 'accrueup', signature: 'accrueup("Bucket", amount, max, vestDate, expDate)', detail: 'Accrues up hours in bucket', documentation: 'accrueup("PTO", 4, 160) - first two required, others optional' },
  { name: 'accruedown', signature: 'accruedown("Bucket", amount, min)', detail: 'Accrues down hours in bucket', documentation: 'accruedown("PTO", hours) - first two required, last optional' },
  { name: 'getbalance', signature: 'getbalance("Bucket")', detail: 'Returns hours in bucket', documentation: 'getbalance("Vacation") returns number of hours' },
  { name: 'setbalance', signature: 'setbalance("Bucket", value)', detail: 'Sets balance of bucket', documentation: 'setbalance("Vacation", 0) sets balance to 0' }
];

// Global timecard properties (exported for hover provider)
export const globalProperties = [
  { name: 'payrate', detail: 'number', documentation: 'Pay rate on the timecard (can be changed)' },
  { name: 'isfirsttoday', detail: 'boolean', documentation: 'Returns true if punchset is the first of the day' },
  { name: 'islasttoday', detail: 'boolean', documentation: 'Returns true if punchset is the last of the day' },
  { name: 'hours', detail: 'number', documentation: 'Hours in a single punch set (can be changed)' },
  { name: 'minutes', detail: 'number', documentation: 'Minutes in a single punch set' },
  { name: 'seconds', detail: 'number', documentation: 'Seconds in a single punch set' },
  { name: 'breakseconds', detail: 'number', documentation: 'Break time in seconds (can be changed)' },
  { name: 'minutesout', detail: 'function', documentation: 'Time elapsed from previous out to current in. minutesout(false) includes seconds' },
  { name: 'minutestil', detail: 'number', documentation: 'Time elapsed between current out to next in' },
  { name: 'punchset', detail: 'number', documentation: 'Index number of punch set during the day' },
  { name: 'category', detail: 'string', documentation: 'Pay category of the punch (can be changed)' },
  { name: 'punchdate', detail: 'date', documentation: 'Date of the punch set' },
  { name: 'intime', detail: 'time', documentation: 'In time of a punch set' },
  { name: 'outtime', detail: 'time', documentation: 'Out time of a punch set' },
  { name: 'inismissing', detail: 'boolean', documentation: 'Returns true if in time is missing' },
  { name: 'outismissing', detail: 'boolean', documentation: 'Returns true if out time is missing' },
  { name: 'istimes', detail: 'boolean', documentation: 'True if timecard row has times (in and/or out)' },
  { name: 'ishours', detail: 'boolean', documentation: 'True if timecard row has hours entry (like Vacation)' },
  { name: 'ispayonly', detail: 'boolean', documentation: 'True if timecard row has dollar amount entry' },
  { name: 'inisedited', detail: 'boolean', documentation: 'True if in time was edited' },
  { name: 'outisedited', detail: 'boolean', documentation: 'True if out time was edited' },
  { name: 'isedited', detail: 'boolean', documentation: 'True if ANY part of the timecard row was edited' },
  { name: 'hourstopunch', detail: 'number', documentation: 'Hours previous to the punch set for that day' },
  { name: 'hourstopunchot', detail: 'number', documentation: 'Overtime eligible hours previous to punch set' },
  { name: 'linetonow', detail: 'number', documentation: 'Seconds from last punch to current time (limited to 18 hours)' },
  { name: 'inip', detail: 'string', documentation: 'IP address of the in punch' },
  { name: 'outip', detail: 'string', documentation: 'IP address of the out punch' }
];

// Operators
const operators = [
  { name: 'and', detail: 'logical AND operator', documentation: 'Logical AND (also &&)' },
  { name: 'or', detail: 'logical OR operator', documentation: 'Logical OR (also ||)' },
  { name: '&&', detail: 'logical AND operator', documentation: 'Logical AND (also and)' },
  { name: '||', detail: 'logical OR operator', documentation: 'Logical OR (also or)' },
  { name: '==', detail: 'equals operator', documentation: 'Equals (preferred, case sensitive for strings)' },
  { name: '=', detail: 'equals operator', documentation: 'Equals (also ==)' },
  { name: '!=', detail: 'not equals operator', documentation: 'Does not equal (also <>)' },
  { name: '<>', detail: 'not equals operator', documentation: 'Does not equal (also !=)' },
  { name: '>', detail: 'greater than', documentation: 'Greater than' },
  { name: '>=', detail: 'greater than or equal', documentation: 'Greater than or equal to' },
  { name: '<', detail: 'less than', documentation: 'Less than' },
  { name: '<=', detail: 'less than or equal', documentation: 'Less than or equal to' },
  { name: 'contains', detail: 'string contains operator', documentation: 'Checks if string contains another string' },
  { name: 'startswith', detail: 'string starts with operator', documentation: 'Checks if string starts with another string' },
  { name: 'endswith', detail: 'string ends with operator', documentation: 'Checks if string ends with another string' }
];

export class SwipeclockCompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    const linePrefix = document.lineAt(position).text.substr(0, position.character);
    const items: vscode.CompletionItem[] = [];

    // Check if we're completing after "employee." (case-insensitive)
    if (linePrefix.match(/employee\.$/i)) {
      employeeProperties.forEach(prop => {
        const item = new vscode.CompletionItem(prop.name, vscode.CompletionItemKind.Property);
        item.detail = prop.detail;
        item.documentation = new vscode.MarkdownString(prop.documentation);
        item.insertText = prop.name;
        // Enable case-insensitive filtering
        item.filterText = prop.name.toLowerCase();
        items.push(item);
      });
      
      // Add dynamic properties (department1-9, location1-9, etc.)
      for (let i = 1; i <= 9; i++) {
        const deptItem = new vscode.CompletionItem(`department${i}`, vscode.CompletionItemKind.Property);
        deptItem.filterText = `department${i}`.toLowerCase();
        items.push(deptItem);
        
        const locItem = new vscode.CompletionItem(`location${i}`, vscode.CompletionItemKind.Property);
        locItem.filterText = `location${i}`.toLowerCase();
        items.push(locItem);
        
        const homeItem = new vscode.CompletionItem(`home${i}`, vscode.CompletionItemKind.Property);
        homeItem.filterText = `home${i}`.toLowerCase();
        items.push(homeItem);
        
        const payItem = new vscode.CompletionItem(`payrate${i}`, vscode.CompletionItemKind.Property);
        payItem.filterText = `payrate${i}`.toLowerCase();
        items.push(payItem);
      }
      
      return items;
    }

    // Check if we're completing after "reportingdate." (case-insensitive)
    if (linePrefix.match(/reportingdate\.$/i)) {
      reportingDateProperties.forEach(prop => {
        const item = new vscode.CompletionItem(prop.name, vscode.CompletionItemKind.Property);
        item.detail = prop.detail;
        item.documentation = new vscode.MarkdownString(prop.documentation);
        item.insertText = prop.name;
        // Enable case-insensitive filtering
        item.filterText = prop.name.toLowerCase();
        items.push(item);
      });
      return items;
    }

    // Add all global functions (case-insensitive)
    globalFunctions.forEach(func => {
      const item = new vscode.CompletionItem(func.name, vscode.CompletionItemKind.Function);
      item.detail = func.detail;
      item.documentation = new vscode.MarkdownString(func.documentation);
      item.insertText = new vscode.SnippetString(`${func.name}($0)`);
      // Enable case-insensitive filtering
      item.filterText = func.name.toLowerCase();
      items.push(item);
    });

    // Add global properties (case-insensitive)
    globalProperties.forEach(prop => {
      const item = new vscode.CompletionItem(prop.name, vscode.CompletionItemKind.Variable);
      item.detail = prop.detail;
      item.documentation = new vscode.MarkdownString(prop.documentation);
      // Enable case-insensitive filtering
      item.filterText = prop.name.toLowerCase();
      items.push(item);
    });

    // Add object names (case-insensitive)
    const employeeItem = new vscode.CompletionItem('employee', vscode.CompletionItemKind.Class);
    employeeItem.detail = 'Global employee object';
    employeeItem.documentation = new vscode.MarkdownString('Access employee properties using employee.propertyName');
    employeeItem.insertText = 'employee.';
    employeeItem.filterText = 'employee';
    items.push(employeeItem);

    const reportingDateItem = new vscode.CompletionItem('reportingdate', vscode.CompletionItemKind.Class);
    reportingDateItem.detail = 'Global reportingdate object';
    reportingDateItem.documentation = new vscode.MarkdownString('Access reporting date properties using reportingdate.propertyName');
    reportingDateItem.insertText = 'reportingdate.';
    reportingDateItem.filterText = 'reportingdate';
    items.push(reportingDateItem);

    // Add operators (case-insensitive, only if context suggests it)
    if (context.triggerKind === vscode.CompletionTriggerKind.Invoke) {
      operators.forEach(op => {
        const item = new vscode.CompletionItem(op.name, vscode.CompletionItemKind.Operator);
        item.detail = op.detail;
        item.documentation = new vscode.MarkdownString(op.documentation);
        // Enable case-insensitive filtering for text operators
        if (op.name.match(/^[a-z]+$/i)) {
          item.filterText = op.name.toLowerCase();
        }
        items.push(item);
      });
    }

    // Add keywords (case-insensitive)
    const keywords = [
      { name: 'if', detail: 'Conditional statement' },
      { name: 'else if', detail: 'Conditional statement' },
      { name: 'else', detail: 'Conditional statement' },
      { name: 'true', detail: 'Boolean literal' },
      { name: 'false', detail: 'Boolean literal' }
    ];

    keywords.forEach(keyword => {
      const item = new vscode.CompletionItem(keyword.name, vscode.CompletionItemKind.Keyword);
      item.detail = keyword.detail;
      // Enable case-insensitive filtering
      item.filterText = keyword.name.toLowerCase();
      items.push(item);
    });

    return items;
  }
}
