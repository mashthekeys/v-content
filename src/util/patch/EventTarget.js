
let defined = undefined;

try {
  defined = (typeof EventTarget === "function");
} catch (referenceError) {
  defined = false;
}

if (!defined) {
  const $EventTarget = require('@ungap/event-target').default;

  try {
    window.EventTarget = $EventTarget;
  } catch (referenceError) {
    global.EventTarget = $EventTarget;
  }
}
