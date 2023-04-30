const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export function parseRFCDate(string) {
  const $ = /^\w{3}, (\d{1,2}) (\w{3}) (\d{4}) (\d{1,2})[-:](\d{1,2})[-:](\d{1,2})(\.\d*|) GMT$/.exec(string);

  const monthIndex = $ === null ? -1 : MONTHS.indexOf($[2].toUpperCase());

  return (monthIndex !== -1
      ? new Date(Date.UTC(+$[3], monthIndex, +$[1], +$[4], +$[5], +$[6], ($[7] || 0) * 1000))
      : undefined
  );
}