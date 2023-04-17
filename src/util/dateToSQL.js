export function dateToSQL($from) {
  return $from.toISOString().replace(/T/, ' ').replace(/\.\d+Z$/, '');
}