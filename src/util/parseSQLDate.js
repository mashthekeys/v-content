
const DATE_TIME = /^(\d\d\d\d)-(\d\d)-(\d\d)(?: (\d\d):(\d\d):(\d\d)(?:\.(\d*)|)|)/;

export function parseSQLDate(dateString) {

  const [, year, month, day, hour, minute, second, millis] = DATE_TIME.exec(dateString) || [];

  if (!(year > 0)) {
    // Return null for zero dates (0000-00-00 in SQL)
    return null;
  }

  return new Date(Date.UTC(year | 0, month - 1, day | 0, hour | 0, minute | 0, second | 0, millis | 0));
}