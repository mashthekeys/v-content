export function stringToSQL(str) {
  str = (
    // Strictly necessary
    String(str).replace(/\\/g, "\\\\")
      .replace(/'/g, "\\'")
      // For legibility
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\t/g, "\\t")
      .replace(/[\b]/g, "\\b")
      .replace(/\x00/g, "\\0")
  );

  return `'${str}'`;
}