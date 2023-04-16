export default function xmlSafe(text) {
  if (text == null) return '';

  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
