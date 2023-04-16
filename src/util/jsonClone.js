
export default function jsonClone(object) {
  if (object == null) return null;

  return JSON.parse(JSON.stringify(object));
}
