
export function deepFreeze(object) {
  const willFreeze = arguments[1] ?? [];

  willFreeze.push(object);

  // Retrieve the property names defined on object
  const propNames = Reflect.ownKeys(object);

  // Freeze properties before freezing self
  for (const name of propNames) {
    const value = object[name];

    if ((value && typeof value === "object") || typeof value === "function") {
      if (!willFreeze.includes(value) && !Object.isFrozen(value)) {
        deepFreeze(value, willFreeze);
      }
    }
  }

  willFreeze.splice(willFreeze.indexOf(object), 1);

  return Object.freeze(object);
}
