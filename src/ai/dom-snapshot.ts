import { type Page } from "@playwright/test";

/**
 * Capture a DOM snapshot around a failed locator.
 * Tries to find elements near where the locator should be.
 */
export async function captureDomSnapshot(
  page: Page,
  failedSelector: string,
  context?: string
): Promise<string> {
  const snapshot = await page.evaluate((selectorHint) => {
    // Get all interactive elements with their attributes
    const elements: string[] = [];

    // Collect buttons
    document.querySelectorAll("button, a, input, select, textarea, [role='button'], [role='link'], [tabindex]").forEach((el) => {
      const tag = el.tagName.toLowerCase();
      const text = (el as HTMLElement).innerText?.trim().substring(0, 40) || "";
      const placeholder = el.getAttribute("placeholder") || "";
      const ariaLabel = el.getAttribute("aria-label") || "";
      const testId = el.getAttribute("data-testid") || "";
      const id = el.id || "";
      const classes = Array.from(el.classList).join(".").substring(0, 60);
      const role = el.getAttribute("role") || "";

      if (text || placeholder || ariaLabel || testId || id) {
        elements.push(
          `<${tag}` +
            (id ? ` id="${id}"` : "") +
            (classes ? ` class="${classes}"` : "") +
            (role ? ` role="${role}"` : "") +
            (ariaLabel ? ` aria-label="${ariaLabel}"` : "") +
            (testId ? ` data-testid="${testId}"` : "") +
            (placeholder ? ` placeholder="${placeholder}"` : "") +
            (text ? `>${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}` : " />")
        );
      }
    });

    return elements.slice(0, 100).join("\n");
  }, failedSelector);

  return (
    `<!-- Failed selector: ${failedSelector} -->\n` +
    (context ? `<!-- Context: ${context} -->\n` : "") +
    `<!-- Page URL: ${page.url()} -->\n` +
    `<snapshot>\n${snapshot}\n</snapshot>`
  );
}
