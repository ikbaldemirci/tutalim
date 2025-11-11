const bus =
  typeof window !== "undefined" && window.document ? new EventTarget() : null;

export const on = (type, handler) => {
  if (!bus) return () => {};
  const listener = (e) => handler(e.detail);
  bus.addEventListener(type, listener);
  return () => bus.removeEventListener(type, listener);
};

export const emit = (type, detail) => {
  if (!bus) return false;
  return bus.dispatchEvent(new CustomEvent(type, { detail }));
};

export const NOTIFY_EVENT = "notify";
