
const hasEventConstructor = typeof Event === "function";

if (!hasEventConstructor) {
  const globalEvent = window.Event;

  function Event(type, {bubbles, cancelable} = {}) {
    const event = document.createEvent("Event");

    event.initEvent(type, bubbles, cancelable);

    return event;
  }

  Event.prototype = globalEvent.prototype;

  window.Event = Event;
}
