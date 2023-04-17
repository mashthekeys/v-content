
let globalEvent;

try { globalEvent = Event } catch (referenceError) {}


const $Event = class Event {
  constructor(type, {cancelable}) {
    this.type = type;
    this.cancelable = cancelable;
    this.defaultPrevented = false;
  }

  preventDefault() {
    if (this.cancelable) this.defaultPrevented = true;
  }
};

export default (globalEvent || $Event);