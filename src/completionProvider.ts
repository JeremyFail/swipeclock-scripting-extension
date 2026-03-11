import * as vscode from 'vscode';

/**
 * MAINTAINER: Adding new scripting properties or functions
 * -----------------------------------------------
 * When adding new employee, reportingdate, or global items, update:
 *
 * 1. EMPLOYEE PROPERTIES: Add to employeeProperties array below.
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
  { name: 'department1', detail: 'string', documentation: 'Department 1 (requires additional department fields to be enabled in account settings)' },
  { name: 'department2', detail: 'string', documentation: 'Department 2 (requires additional department fields to be enabled in account settings)' },
  { name: 'department3', detail: 'string', documentation: 'Department 3 (requires additional department fields to be enabled in account settings)' },
  { name: 'department4', detail: 'string', documentation: 'Department 4 (requires additional department fields to be enabled in account settings)' },
  { name: 'department5', detail: 'string', documentation: 'Department 5 (requires additional department fields to be enabled in account settings)' },
  { name: 'department6', detail: 'string', documentation: 'Department 6 (requires additional department fields to be enabled in account settings)' },
  { name: 'department7', detail: 'string', documentation: 'Department 7 (requires additional department fields to be enabled in account settings)' },
  { name: 'department8', detail: 'string', documentation: 'Department 8 (requires additional department fields to be enabled in account settings)' },
  { name: 'department9', detail: 'string', documentation: 'Department 9 (requires additional department fields to be enabled in account settings)' },
  { name: 'location', detail: 'string', documentation: 'Default location' },
  { name: 'location1', detail: 'string', documentation: 'Location 1 (requires additional location fields to be enabled in account settings)' },
  { name: 'location2', detail: 'string', documentation: 'Location 2 (requires additional location fields to be enabled in account settings)' },
  { name: 'location3', detail: 'string', documentation: 'Location 3 (requires additional location fields to be enabled in account settings)' },
  { name: 'location4', detail: 'string', documentation: 'Location 4 (requires additional location fields to be enabled in account settings)' },
  { name: 'location5', detail: 'string', documentation: 'Location 5 (requires additional location fields to be enabled in account settings)' },
  { name: 'location6', detail: 'string', documentation: 'Location 6 (requires additional location fields to be enabled in account settings)' },
  { name: 'location7', detail: 'string', documentation: 'Location 7 (requires additional location fields to be enabled in account settings)' },
  { name: 'location8', detail: 'string', documentation: 'Location 8 (requires additional location fields to be enabled in account settings)' },
  { name: 'location9', detail: 'string', documentation: 'Location 9 (requires additional location fields to be enabled in account settings)' },
  { name: 'supervisor', detail: 'string', documentation: 'Employee supervisor' },
  { name: 'home1', detail: 'string', documentation: 'Home field 1' },
  { name: 'home2', detail: 'string', documentation: 'Home field 2' },
  { name: 'home3', detail: 'string', documentation: 'Home field 3' },
  { name: 'home4', detail: 'string', documentation: 'Home field 4 (requires additional home fields to be enabled in account settings)' },
  { name: 'home5', detail: 'string', documentation: 'Home field 5 (requires additional home fields to be enabled in account settings)' },
  { name: 'home6', detail: 'string', documentation: 'Home field 6 (requires additional home fields to be enabled in account settings)' },
  { name: 'home7', detail: 'string', documentation: 'Home field 7 (requires additional home fields to be enabled in account settings)' },
  { name: 'home8', detail: 'string', documentation: 'Home field 8 (requires additional home fields to be enabled in account settings)' },
  { name: 'home9', detail: 'string', documentation: 'Home field 9 (requires additional home fields to be enabled in account settings)' },
  { name: 'autolunchhours', detail: 'number', documentation: 'Auto lunch hours (AutoLunch Hours Threshold in employee setup). Requires the AutoLunch processing rule to be enabled.' },
  { name: 'lunchminutes', detail: 'number', documentation: 'Lunch minutes (AutoLunch Deduct Minutes in employee setup). Requires the AutoLunch processing rule to be enabled.' },
  { name: 'accrualfactor', detail: 'number', documentation: 'Accrual factor. Requires the AccrualFactor processing rule to be enabled.' },
  { name: 'schedule', detail: 'string', documentation: 'Employee schedule (e.g. "7:00am - 4:30pm"). Requires the RoundToSchedule processing rule to be enabled.' },
  { name: 'birthday', detail: 'date', documentation: 'Employee birthday. Requires the Birthday processing rule to be enabled.' },
  { name: 'maxhours', detail: 'number', documentation: 'Max weekly hours (from employee setup "Max Weekly Hours" field). Requires the HoursAlert processing rule to be enabled.' },
  { name: 'jobtitlecode', detail: 'string', documentation: 'Job title code for PBJ. Requires the Payroll-Based Journal (PBJ) processing rule to be enabled.' },
  { name: 'paytypecode', detail: 'string', documentation: 'Pay type code for PBJ. Requires the Payroll-Based Journal (PBJ) processing rule to be enabled.' },
  { name: 'country', detail: 'string', documentation: 'Employee country. Requires the EmployeeCountryState processing rule to be enabled.' },
  { name: 'state', detail: 'string', documentation: 'Employee state. Requires the EmployeeCountryState processing rule to be enabled.' },
  { name: 'employeetype', detail: 'string', documentation: 'Employee type' },
  { name: 'accrualvalidator', detail: 'string', documentation: 'Accrual validator (when BasicAccruals rule is activated)' },
  { name: 'payrate0', detail: 'number', documentation: 'Default pay rate' },
  { name: 'payrate1', detail: 'number', documentation: 'Pay rate 1' },
  { name: 'payrate2', detail: 'number', documentation: 'Pay rate 2' },
  { name: 'payrate3', detail: 'number', documentation: 'Pay rate 3 (requires additional payrate fields to be enabled in account settings)' },
  { name: 'payrate4', detail: 'number', documentation: 'Pay rate 4 (requires additional payrate fields to be enabled in account settings)' },
  { name: 'payrate5', detail: 'number', documentation: 'Pay rate 5 (requires additional payrate fields to be enabled in account settings)' },
  { name: 'payrate6', detail: 'number', documentation: 'Pay rate 6 (requires additional payrate fields to be enabled in account settings)' },
  { name: 'payrate7', detail: 'number', documentation: 'Pay rate 7 (requires additional payrate fields to be enabled in account settings)' },
  { name: 'payrate8', detail: 'number', documentation: 'Pay rate 8 (requires additional payrate fields to be enabled in account settings)' },
  { name: 'payrate9', detail: 'number', documentation: 'Pay rate 9 (requires additional payrate fields to be enabled in account settings)' },
  { name: 'position', detail: 'string', documentation: 'Employee position. Available to WorkforceHub accounts only.' },
  { name: 'exempt', detail: 'string', documentation: 'Employee exempt status: "yes", "no", or blank. Available to WorkforceHub accounts only.' },
  { name: 'lasthiredate', detail: 'date', documentation: 'Employee last hire date. Available to WorkforceHub accounts only.' }
];

// ReportingDate object properties
export const reportingDateProperties = [
  { name: 'tomorrow', detail: 'date', documentation: 'Returns the date of the next day' },
  { name: 'yesterday', detail: 'date', documentation: 'Returns the date of the previous day' },
  { name: 'date', detail: 'date', documentation: 'Returns the date of the timecard line' },
  { name: 'year', detail: 'number', documentation: 'Returns the year of the timecard line' },
  { name: 'month', detail: 'number', documentation: 'Returns the month of the timecard line' },
  { name: 'day', detail: 'number', documentation: 'Returns the day of the timecard line' },
  { name: 'weekday', detail: 'string', documentation: 'Returns the weekday of the timecard line as a letter: MTWRFSU' },
  { name: 'todaysdate', detail: 'date', documentation: 'Returns the current date' },
  { name: 'isfirstdayofmonth', detail: 'boolean', documentation: 'Returns true on the first day of the month' },
  { name: 'islastdayofmonth', detail: 'boolean', documentation: 'Returns true on the last day of the month' },
  { name: 'payperiodstart', detail: 'date', documentation: 'Returns the date of the first day of the pay period' },
  { name: 'payperiodend', detail: 'date', documentation: 'Returns the date of the last day of the pay period' },
  {
    name: 'isholiday',
    detail: 'boolean',
    documentation: 'Property form: returns true if reportingdate.date is a holiday. Function form: reportingdate.isholiday(dateValue) checks a specific date (date string or date object).',
    overloads: [
      {
        signature: 'reportingdate.isholiday',
        detail: 'Property form',
        documentation: 'Returns true if reportingdate.date is a holiday.'
      },
      {
        signature: 'reportingdate.isholiday(dateValue)',
        detail: 'Function form',
        documentation: 'Checks whether the specified date value is a holiday. Accepts a date string or date object.'
      }
    ]
  },
  { name: 'spread', detail: 'timespan', documentation: 'Returns the amount of time between first in punch and last out punch' },
  {
    name: 'totalhours',
    detail: 'number',
    documentation: 'Property form: hours in the day. Function form: reportingdate.totalhours("Category1|Category2") returns hours only for specified punch categories.',
    overloads: [
      {
        signature: 'reportingdate.totalhours',
        detail: 'Property form',
        documentation: 'Returns total hours in the day.'
      },
      {
        signature: 'reportingdate.totalhours(categoryList)',
        detail: 'Function form',
        documentation: 'Returns hours only for specified punch categories. Use the pipe delimiter for multiple categories, e.g. "Regular|Vacation".'
      }
    ]
  },
  {
    name: 'totalhoursot',
    detail: 'number',
    documentation: 'Property form: overtime-eligible hours in the day. Function form: reportingdate.totalhoursot("Category1|Category2") returns overtime-eligible hours only for specified punch categories.',
    overloads: [
      {
        signature: 'reportingdate.totalhoursot',
        detail: 'Property form',
        documentation: 'Returns overtime-eligible hours in the day.'
      },
      {
        signature: 'reportingdate.totalhoursot(categoryList)',
        detail: 'Function form',
        documentation: 'Returns overtime-eligible hours only for specified punch categories. Use the pipe delimiter for multiple categories, e.g. "Regular|Vacation".'
      }
    ]
  },
  { name: 'hourstodate', detail: 'number', documentation: 'Hours to date in the week' },
  { name: 'hourstodateot', detail: 'number', documentation: 'Hours to date in the week that are overtime eligible' },
  {
    name: 'weekhours',
    detail: 'number',
    documentation: 'Property form: hours in the week. Function form: reportingdate.weekhours("Category1|Category2") returns weekly hours only for specified punch categories.',
    overloads: [
      {
        signature: 'reportingdate.weekhours',
        detail: 'Property form',
        documentation: 'Returns total hours in the week.'
      },
      {
        signature: 'reportingdate.weekhours(categoryList)',
        detail: 'Function form',
        documentation: 'Returns weekly hours only for specified punch categories. Use the pipe delimiter for multiple categories, e.g. "Regular|Vacation".'
      }
    ]
  },
  {
    name: 'pphours',
    detail: 'number',
    documentation: 'Property form: hours in the pay period. Function form: reportingdate.pphours("Category1|Category2") returns pay-period hours only for specified punch categories.',
    overloads: [
      {
        signature: 'reportingdate.pphours',
        detail: 'Property form',
        documentation: 'Returns total hours in the pay period.'
      },
      {
        signature: 'reportingdate.pphours(categoryList)',
        detail: 'Function form',
        documentation: 'Returns pay-period hours only for specified punch categories. Use the pipe delimiter for multiple categories, e.g. "Regular|Vacation".'
      }
    ]
  },
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
  { name: 'workweekstart', detail: 'date', documentation: 'Returns the date of the last day of the work week' },
  { name: 'workweekend', detail: 'date', documentation: 'Returns the date of the last day of the work week' }
];

// Global functions
export const globalFunctions = [
  { name: 'dateadd', signature: 'dateadd("mm", 6, employee.startdate)', detail: 'Adds days, months, years, hours, minutes, seconds to any date/time value', documentation: 'dateadd(type, amount, date)\nType: "y", "mm", "d", "h", "n", "s"' },
  { name: 'dateserial', signature: 'dateserial(year, month, day)', detail: 'Constructs a date object', documentation: 'dateserial(reportingdate.year, 12, 31) returns the date 2014-12-31' },
  { name: 'weekday', signature: 'weekday(date)', detail: 'Returns the weekday of the specified date object as a letter: MTWRFSU', documentation: 'weekday(punchdate) returns "M" if the day is Monday' },
  { name: 'cdate', signature: 'cdate(string)', detail: 'Returns a date instead of a string', documentation: 'cdate("2014-11-25") returns the date 2014-11-25' },
  { name: 'cdatetime', signature: 'cdatetime(string)', detail: 'Returns a datetime value', documentation: 'cdatetime("2014-11-25 08:00:00") returns the datetime 2014-11-25 08:00:00' },
  { name: 'ctime', signature: 'ctime(datetime)', detail: 'Returns a time instead of a datetime', documentation: 'ctime(indt) returns 17:00:00 if the time is 5:00pm' },
  { name: 'day', signature: 'day(date)', detail: 'Returns the day of the specified date object', documentation: 'day(punchdate) returns the day number' },
  { name: 'month', signature: 'month(date)', detail: 'Returns the month of the specified date object', documentation: 'month(punchdate) returns the month number' },
  { name: 'year', signature: 'year(date)', detail: 'Returns the year of the specified date object', documentation: 'year(punchdate) returns the year number' },
  { name: 'val', signature: 'val(string)', detail: 'Converts a string into a number', documentation: 'val("5.555") returns 5.555. Null values return 0.' },
  { name: 'isdate', signature: 'isdate(value)', detail: 'Returns true if the specified value is a valid date', documentation: 'Accepts one parameter (string or date object) and returns true or false.' },
  { name: 'cint', signature: 'cint(value)', detail: 'Returns the specified value as an integer', documentation: 'cint("5.555") returns 5. Null values throw an error.' },
  { name: 'cstr', signature: 'cstr(value)', detail: 'Returns the specified value as a string', documentation: 'cstr(5.555) returns "5.555"' },
  { name: 'abs', signature: 'abs(number)', detail: 'Returns the absolute value of the specified number', documentation: 'abs(-5) returns 5' },
  { name: 'translate', signature: 'translate(field, list1, list2)', detail: 'Changes the specified value from one to another', documentation: 'translate(department, "100|110|200", "Warehouse,Shipping,Accounting")' },
  { name: 'within', signature: 'within(field, list)', detail: 'Returns true if the specified value matches the specified list', documentation: 'within(department, "100|110|200") returns true if department is "110"' },
  { name: 'left', signature: 'left(string, count)', detail: 'Returns the first N characters', documentation: 'left("this is the best", 4) returns "this"' },
  { name: 'right', signature: 'right(string, count)', detail: 'Returns the last N characters', documentation: 'right("this is the best", 4) returns "best"' },
  { name: 'mid', signature: 'mid(string, start, count)', detail: 'Returns the middle N characters', documentation: 'mid("this is the best", 6, 2) returns "is"' },
  { name: 'len', signature: 'len(string)', detail: 'Returns the length (count) of characters as an int', documentation: 'Takes any string and returns the number of characters as an integer.\n\nExample: len("hello") returns 5' },
  {
    name: 'split',
    signature: 'split(time) or split(time, pushToNextDay, hideInternalTimes)',
    detail: 'Splits a punch at a time',
    documentation: 'Splits the current punch set at the specified time.',
    overloads: [
      {
        signature: 'split(time)',
        detail: 'Split at time',
        documentation: 'Splits the punch set at the specified time. One parameter: the time at which to split (e.g. 12:00am or "12:00am").',
        parameterTypes: ['time']
      },
      {
        signature: 'split(time, pushToNextDay, hideInternalTimes)',
        detail: 'Split at time with options',
        documentation: 'Splits the punch set at the specified time with options.\n\n1. **time** - When to split (e.g. 12:00am or "12:00am").\n2. **pushToNextDay** - Whether the time after the split should be pushed to the next day (true/false).\n3. **hideInternalTimes** - Whether the internal times of the split should be hidden (true/false).\n\nExample: split(12:00am, true, false);',
        parameterTypes: ['time', 'boolean', 'boolean']
      }
    ]
  },
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
  { name: 'roundin', signature: 'roundin(timeString)', detail: 'Rounds the in time down to the nearest schedule time', documentation: 'roundin("7:45am-8:00am=8:00am")' },
  { name: 'roundout', signature: 'roundout(timeString)', detail: 'Rounds the out time up to the nearest schedule time', documentation: 'roundout("7:45am-8:00am=8:00am")' },
  { name: 'roundends', signature: 'roundends(timeString)', detail: 'Rounds the first and last punch times', documentation: 'roundends("7:45am-8:00am=8:00am")' },
  { name: 'roundtoschedule', signature: 'roundtoschedule(a1, a2, b1, b2)', detail: 'Rounds to the schedule', documentation: 'roundtoschedule(0, 5, 0, 15) - minutes parameters for rounding' },
  { name: 'roundup', signature: 'roundup(number)', detail: 'Rounds the specified value up', documentation: 'roundup(5.555) returns 6' },
  { name: 'rounddown', signature: 'rounddown(number)', detail: 'Rounds the specified value down', documentation: 'rounddown(5.555) returns 5' },
  { name: 'addalert', signature: 'addalert(message)', detail: 'Puts an alert on the timecard line with the specified text/value', documentation: 'addalert("Late") puts "Late" on the timecard line in an alert' },
  { name: 'unpay', signature: 'unpay(hours)', detail: 'Classifies the specified amount of hours on the punchset as unpaid', documentation: 'unpay(hours) - the specified amount of hours on the punchset are no longer paid on the timecard.' },
  { name: 'touches', signature: 'touches(startTime, endTime)', detail: 'Returns true if the punchset touches the specified time range', documentation: 'touches(6:00am, 3:00pm)' },
  { name: 'isedited', signature: 'isedited(property)', detail: 'Returns true if the specified property was edited', documentation: 'isedited(category) - checks if the category was edited' },
  { name: 'tomorrow', signature: 'tomorrow(0)', detail: 'Pushes the punchset to the next day', documentation: 'tomorrow(0) - must have the 0 argument' },
  { name: 'yesterday', signature: 'yesterday(0)', detail: 'Pushes the punchset to the previous day', documentation: 'yesterday(0) - must have the 0 argument' },
  { name: 'overlaps', signature: 'overlaps(startTime, endTime)', detail: 'Returns true if times overlap', documentation: 'Checks if times overlap the in and out times' },
  { name: 'overlap', signature: 'overlap(start1, end1, start2, end2)', detail: 'Returns overlap time', documentation: 'Returns amount of time (as Time Object) that times overlap' },
  { name: 'addentry', signature: 'addentry("type", amount, "category")', detail: 'Adds a new entry on time card', documentation: 'addentry("hours", 8, "Regular") - all three parameters required' },
  { name: 'accrueup', signature: 'accrueup("Bucket", amount, max, vestDate, expDate)', detail: 'Accrues up (increases) hours in an accrual bucket', documentation: 'accrueup("PTO", 4, 160) - first two required, others optional' },
  { name: 'accruedown', signature: 'accruedown("Bucket", amount, min)', detail: 'Accrues down (reduces) hours in an accrual bucket', documentation: 'accruedown("PTO", hours) - first two required, last optional' },
  { name: 'isbucket', signature: 'isbucket("Bucket")', detail: 'Checks whether the value is an accrual bucket', documentation: 'Accepts one string parameter and returns true if the value is a valid accrual bucket for accrual scripting.' },
  { name: 'getbalance', signature: 'getbalance("Bucket")', detail: 'Returns the accrual balance of the specified bucket', documentation: 'getbalance("Vacation") returns the balance of the Vacation bucket' },
  { name: 'setbalance', signature: 'setbalance("Bucket", value)', detail: 'Sets the accrual balance of the specified bucket', documentation: 'setbalance("Vacation", 0) sets the balance of the Vacation bucket to 0' },
  { name: 'otrules', signature: 'otrules("OT Rule Name")', detail: 'Sets the overtime rules for the timecard', documentation: 'Accepts one parameter (string): the two character code of the OT rule. Sets the overtime rules for the timecard. Use "FLSA" for OT40.\n\nExample: otrules("CA")' }
];

// Global timecard properties (exported for hover provider)
export const globalProperties = [
  { name: 'payrate', detail: 'number', documentation: 'Pay rate on the timecard (can be changed)' },
  { name: 'isfirsttoday', detail: 'boolean', documentation: 'Returns true if punchset is the first of the day' },
  { name: 'islasttoday', detail: 'boolean', documentation: 'Returns true if punchset is the last of the day' },
  { name: 'amount', detail: 'number', documentation: 'Dollar amount of the punch set (can be changed) - TIP: when changing the amount, set the addlpay as well so the timecard subtotals are correct' },
  { name: 'addlpay', detail: 'number', documentation: 'Additional pay amount of the punch set (can be changed) - this value is used for the dollar amount subtotals on the timecard. If you change the amount with a script, the additional pay may not be reflected and you will want to set this value as well.' },
  { name: 'hours', detail: 'number', documentation: 'Hours in a single punch set (can be changed)' },
  { name: 'minutes', detail: 'number', documentation: 'Minutes in a single punch set' },
  { name: 'seconds', detail: 'number', documentation: 'Seconds in a single punch set' },
  { name: 'breakseconds', detail: 'number', documentation: 'Break time in seconds (can be changed)' },
  { name: 'minutesout', detail: 'function', documentation: 'Time elapsed from previous out to current in. minutesout(false) includes seconds' },
  { name: 'minutestil', detail: 'number', documentation: 'Time elapsed between current out to next in' },
  { name: 'punchset', detail: 'number', documentation: 'Index number of punch set during the day' },
  { name: 'category', detail: 'string', documentation: 'Pay category of the punch (can be changed)' },
  { name: 'otcategory', detail: 'string', documentation: 'OT category name for the punch (every OT-eligible category has an OT category name). Returns an empty string if the category is not OT-eligible.' },
  { name: 'punchdate', detail: 'date', documentation: 'Date of the punch set - not to be confused with the timecard line reportingdate.date (it may not be the same, particularly for overnight punches or punches affected by yesterday or tomorrow rules)' },
  { name: 'intime', detail: 'time', documentation: 'In time of a punch set' },
  { name: 'outtime', detail: 'time', documentation: 'Out time of a punch set' },
  { name: 'indt', detail: 'datetime', documentation: 'In date/time - full date and time of the in punch (like intime but includes the date)' },
  { name: 'outdt', detail: 'datetime', documentation: 'Out date/time - full date and time of the out punch (like outtime but includes the date)' },
  { name: 'inismissing', detail: 'boolean', documentation: 'Returns true if in time is missing' },
  { name: 'outismissing', detail: 'boolean', documentation: 'Returns true if out time is missing' },
  { name: 'inispresent', detail: 'boolean', documentation: 'Returns true if in time is present (opposite of inismissing)' },
  { name: 'outispresent', detail: 'boolean', documentation: 'Returns true if out time is present (opposite of outismissing)' },
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

// Reserved names that are not user variables (used to filter document variable completion)
const reservedVariableNames = new Set([
  'if', 'else', 'and', 'or', 'true', 'false', 'mod',
  'contains', 'startswith', 'endswith',
  'dateadd', 'dateserial', 'weekday', 'cdate', 'cdatetime', 'ctime',
  'day', 'month', 'year', 'val', 'isdate', 'cint', 'cstr', 'abs',
  'translate', 'within', 'left', 'right', 'mid', 'len', 'split',
  'round', 'roundin', 'roundout', 'roundends', 'roundtoschedule', 'roundup', 'rounddown',
  'addalert', 'unpay', 'touches', 'isedited', 'tomorrow', 'yesterday',
  'overlaps', 'overlap', 'addentry',
  'accrueup', 'accruedown', 'isbucket', 'getbalance', 'setbalance', 'otrules',
  'employee', 'reportingdate',
  'payrate', 'isfirsttoday', 'islasttoday', 'amount', 'addlpay', 'hours', 'minutes', 'seconds',
  'breakseconds', 'minutesout', 'minutestil', 'punchset', 'category', 'otcategory',
  'punchdate', 'intime', 'outtime', 'indt', 'outdt', 'inismissing', 'outismissing', 'inispresent', 'outispresent',
  'istimes', 'ishours', 'ispayonly', 'inisedited', 'outisedited',
  'hourstopunch', 'hourstopunchot', 'linetonow', 'inip', 'outip'
]);

/**
 * Collect variable names defined in the document (left-hand side of =).
 * Returns a Map of display name -> insert text (so $myvar stays as $myvar for local vars).
 */
function getDocumentVariables(document: vscode.TextDocument): Map<string, string> {
  const result = new Map<string, string>();
  const text = document.getText();
  const lines = text.split(/\r?\n/);
  let inBlockComment = false;

  const assignmentPattern = /(\$[a-zA-Z_][a-zA-Z0-9_]*|[a-zA-Z_][a-zA-Z0-9_]*)\s*=/gi;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    let lineToCheck = lines[lineIndex];

    if (inBlockComment) {
      const endIdx = lineToCheck.indexOf('*/');
      if (endIdx !== -1) {
        inBlockComment = false;
        lineToCheck = lineToCheck.substring(endIdx + 2);
      } else {
        continue;
      }
    } else {
      const blockStart = lineToCheck.indexOf('/*');
      if (blockStart !== -1) {
        const blockEnd = lineToCheck.indexOf('*/', blockStart + 2);
        if (blockEnd === -1) {
          inBlockComment = true;
          lineToCheck = lineToCheck.substring(0, blockStart);
        } else {
          lineToCheck = lineToCheck.substring(0, blockStart) + lineToCheck.substring(blockEnd + 2);
        }
      }
    }

    const commentIdx = lineToCheck.indexOf('//');
    if (commentIdx !== -1) {
      lineToCheck = lineToCheck.substring(0, commentIdx);
    }

    let match: RegExpExecArray | null;
    assignmentPattern.lastIndex = 0;
    while ((match = assignmentPattern.exec(lineToCheck)) !== null) {
      const rawName = match[1];
      const lower = rawName.toLowerCase();
      const withoutDollar = lower.replace(/^\$/, '');
      if (reservedVariableNames.has(withoutDollar)) continue;
      if (withoutDollar === 'employee' || withoutDollar === 'reportingdate') continue;
      // Use original casing for display/insert so $MyVar stays $MyVar
      result.set(lower, rawName);
    }
  }
  return result;
}

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
    const autoInsertObjectPeriod = vscode.workspace.getConfiguration('swipeclock').get<boolean>('completion.autoInsertObjectPeriod', true);

    const employeeMemberMatch = linePrefix.match(/employee\.([a-zA-Z0-9_]*)$/i);
    const reportingDateMemberMatch = linePrefix.match(/reportingdate\.([a-zA-Z0-9_]*)$/i);

    // Check if we're completing after "employee." (case-insensitive), including partial member typing
    if (employeeMemberMatch) {
      const typedMember = employeeMemberMatch[1] ?? '';
      const replaceRange = new vscode.Range(
        position.line,
        position.character - typedMember.length,
        position.line,
        position.character
      );
      employeeProperties.forEach(prop => {
        const item = new vscode.CompletionItem(prop.name, vscode.CompletionItemKind.Property);
        item.detail = prop.detail;
        item.documentation = new vscode.MarkdownString(prop.documentation);
        item.insertText = prop.name;
        item.range = replaceRange;
        // Enable case-insensitive filtering
        item.filterText = prop.name.toLowerCase();
        items.push(item);
      });
      
      return items;
    }

    // Check if we're completing after "reportingdate." (case-insensitive), including partial member typing
    if (reportingDateMemberMatch) {
      const typedMember = reportingDateMemberMatch[1] ?? '';
      const replaceRange = new vscode.Range(
        position.line,
        position.character - typedMember.length,
        position.line,
        position.character
      );
      reportingDateProperties.forEach(prop => {
        const item = new vscode.CompletionItem(prop.name, vscode.CompletionItemKind.Property);
        item.detail = prop.detail;
        item.documentation = new vscode.MarkdownString(prop.documentation);
        item.insertText = prop.name;
        item.range = replaceRange;
        // Enable case-insensitive filtering
        item.filterText = prop.name.toLowerCase();
        items.push(item);
      });
      return items;
    }

    // When user has typed $ (with or without more chars), only suggest local variables
    const localVarPrefixMatch = linePrefix.match(/\$[a-zA-Z0-9_]*$/);
    if (localVarPrefixMatch) {
      const typedAfterDollar = localVarPrefixMatch[0].slice(1); // e.g. "my" from "$my"
      const typedLower = typedAfterDollar.toLowerCase();
      const localVarReplaceRange = new vscode.Range(
        position.line,
        position.character - localVarPrefixMatch[0].length,
        position.line,
        position.character
      );
      const documentVariables = getDocumentVariables(document);
      const localVars: Array<{ insertText: string; key: string }> = [];
      documentVariables.forEach((insertText, key) => {
        if (!key.startsWith('$')) return;
        localVars.push({ insertText, key });
      });

      // When they typed something after $, only suggest vars whose name contains that substring (case-insensitive)
      const filtered = typedLower.length === 0
        ? localVars
        : localVars.filter(({ key }) => {
            const nameAfterDollar = key.slice(1).toLowerCase();
            return nameAfterDollar.includes(typedLower);
          });

      // Sort: names that start with the typed prefix first, then others that contain it
      filtered.sort((a, b) => {
        const nameA = a.key.slice(1).toLowerCase();
        const nameB = b.key.slice(1).toLowerCase();
        const aStarts = typedLower.length === 0 || nameA.startsWith(typedLower);
        const bStarts = typedLower.length === 0 || nameB.startsWith(typedLower);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return nameA.localeCompare(nameB);
      });

      filtered.forEach(({ insertText, key }) => {
        const item = new vscode.CompletionItem(insertText, vscode.CompletionItemKind.Variable);
        item.detail = 'Local variable (defined in this script)';
        item.documentation = new vscode.MarkdownString('Local variable');
        item.insertText = insertText;
        item.filterText = key; // not used for filtering when we filter ourselves, but keep for display
        const nameAfterDollar = key.slice(1).toLowerCase();
        const startsWithTyped = typedLower.length === 0 || nameAfterDollar.startsWith(typedLower);
        item.sortText = (startsWithTyped ? '0_' : '1_') + key;
        item.range = localVarReplaceRange;
        items.push(item);
      });
      return items;
    }

    // Add variables defined in this document (global and local $var)
    const documentVariables = getDocumentVariables(document);
    documentVariables.forEach((insertText, key) => {
      const item = new vscode.CompletionItem(insertText, vscode.CompletionItemKind.Variable);
      item.detail = key.startsWith('$') ? 'Local variable (defined in this script)' : 'Variable (defined in this script)';
      item.documentation = new vscode.MarkdownString(key.startsWith('$') ? 'Local variable' : 'Global variable');
      item.insertText = insertText;
      item.filterText = key;
      item.sortText = '0_' + key;
      items.push(item);
    });

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
    employeeItem.insertText = autoInsertObjectPeriod ? 'employee.' : 'employee';
    if (autoInsertObjectPeriod) {
      employeeItem.command = { command: 'editor.action.triggerSuggest', title: 'Reopen suggestions' };
    }
    employeeItem.filterText = 'employee';
    items.push(employeeItem);

    const reportingDateItem = new vscode.CompletionItem('reportingdate', vscode.CompletionItemKind.Class);
    reportingDateItem.detail = 'Global reportingdate object';
    reportingDateItem.documentation = new vscode.MarkdownString('Access reporting date properties using reportingdate.propertyName');
    reportingDateItem.insertText = autoInsertObjectPeriod ? 'reportingdate.' : 'reportingdate';
    if (autoInsertObjectPeriod) {
      reportingDateItem.command = { command: 'editor.action.triggerSuggest', title: 'Reopen suggestions' };
    }
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
