/**
 * Generates safely escaped CSV content to prevent formula injection and parsing errors
 */
export function generateCsv(headers: string[], rows: (string | number | boolean | null | undefined)[][]): string {
  const sanitizeCell = (value: any): string => {
    if (value === null || value === undefined) return '""';
    let str = String(value);

    // Prevent formula injection in Excel / Sheets
    if (/^[=+\-@\t\r]/.test(str)) {
      str = `'${str}`;
    }

    // Escape double quotes
    str = str.replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerRow = headers.map(h => sanitizeCell(h)).join(',');
  const dataRows = rows.map(row => row.map(cell => sanitizeCell(cell)).join(','));

  return [headerRow, ...dataRows].join('\r\n');
}
