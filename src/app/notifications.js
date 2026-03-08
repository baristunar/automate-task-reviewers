import { el } from "./dom.js";

export function toast(message) {
  el.toast.textContent = message;
  el.toast.classList.add("show");
  window.clearTimeout(toast._timer);
  toast._timer = window.setTimeout(() => {
    el.toast.classList.remove("show");
  }, 1700);
}
