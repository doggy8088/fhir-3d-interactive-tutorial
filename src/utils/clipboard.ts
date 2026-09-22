/**
 * Copies text to the clipboard.
 *
 * `navigator.clipboard` only exists in a secure context (HTTPS or localhost)
 * and can still be denied by the user or by permissions policy, so a
 * `document.execCommand("copy")` fallback keeps the control usable.
 * Returns `false` when both paths fail so the caller can surface the failure.
 */
export async function copyText(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Permission denied or clipboard unavailable — try the legacy path.
    }
  }
  return legacyCopy(text);
}

function legacyCopy(text: string): boolean {
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.setAttribute("aria-hidden", "true");
    area.style.position = "fixed";
    area.style.top = "-1000px";
    area.style.opacity = "0";

    const selection = document.getSelection();
    const previousRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    document.body.appendChild(area);
    area.select();
    const succeeded = document.execCommand("copy");
    document.body.removeChild(area);

    if (previousRange && selection) {
      selection.removeAllRanges();
      selection.addRange(previousRange);
    }
    return succeeded;
  } catch {
    return false;
  }
}
