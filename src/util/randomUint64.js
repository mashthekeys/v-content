import crypto from "crypto";

export default function randomUint64() {
  const uidSource = crypto.getRandomValues(new BigUint64Array(1));

  return uidSource.toString();
}