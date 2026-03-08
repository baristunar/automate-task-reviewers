import { el } from "./dom.js";

let activeResolver = null;

export function confirmAction({
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = true,
}) {
  closeModal(false);

  el.confirmTitle.textContent = title;
  el.confirmMessage.textContent = message;
  el.confirmCancelBtn.textContent = cancelText;
  el.confirmApproveBtn.textContent = confirmText;

  el.confirmApproveBtn.classList.toggle("btn-danger", danger);
  el.confirmApproveBtn.classList.toggle("btn-primary", !danger);

  el.confirmModal.hidden = false;
  el.confirmApproveBtn.focus();

  return new Promise((resolve) => {
    activeResolver = resolve;

    const onCancel = () => closeModal(false);
    const onConfirm = () => closeModal(true);
    const onBackdrop = (event) => {
      if (event.target === el.confirmModal) {
        closeModal(false);
      }
    };
    const onEscape = (event) => {
      if (event.key === "Escape") {
        closeModal(false);
      }
    };

    el.confirmCancelBtn.onclick = onCancel;
    el.confirmApproveBtn.onclick = onConfirm;
    el.confirmModal.onclick = onBackdrop;
    document.addEventListener("keydown", onEscape, { once: true });
  });
}

function closeModal(result) {
  if (activeResolver) {
    activeResolver(result);
    activeResolver = null;
  }

  el.confirmModal.hidden = true;
  el.confirmCancelBtn.onclick = null;
  el.confirmApproveBtn.onclick = null;
  el.confirmModal.onclick = null;
}
