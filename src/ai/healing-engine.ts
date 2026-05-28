import { type Locator, type Page } from "@playwright/test";
import { suggestSelectors } from "./openai-client";
import { captureDomSnapshot } from "./dom-snapshot";

interface HealingResult {
  healed: boolean;
  originalSelector: string;
  healedSelector: string;
  attempts: number;
}

/**
 * Try to heal a failed locator by getting alternative selectors from AI.
 * Returns the first working selector, or null if all fail.
 */
async function healSelector(
  page: Page,
  originalDescription: string,
  domSnippet: string
): Promise<string | null> {
  const suggestions = await suggestSelectors(
    originalDescription,
    domSnippet,
    originalDescription
  );

  for (const suggestion of suggestions) {
    try {
      // Parse the suggestion - it might be a Playwright code or CSS selector
      const selector = extractSelector(suggestion);
      const locator = page.locator(selector);
      const visible = await locator.isVisible({ timeout: 2000 });
      if (visible) {
        return suggestion;
      }
    } catch {
      // Try next suggestion
      continue;
    }
  }
  return null;
}

/**
 * Extract a usable selector from an AI suggestion string.
 * Handles both Playwright code and raw selectors.
 */
function extractSelector(suggestion: string): string {
  // Handle Playwright getBy* patterns
  if (suggestion.includes("getByRole")) {
    const match = suggestion.match(/getByRole\(['"]([^'"]+)['"],\s*\{[^}]*name:\s*['"]([^'"]+)['"]/);
    if (match) return `[role="${match[1]}"][aria-name="${match[2]}"]`;
  }
  if (suggestion.includes("getByText")) {
    const match = suggestion.match(/getByText\(['"]([^'"]+)['"]/);
    if (match) return `text=${match[1]}`;
  }
  if (suggestion.includes("getByPlaceholder")) {
    const match = suggestion.match(/getByPlaceholder\(['"]([^'"]+)['"]/);
    if (match) return `[placeholder="${match[1]}"]`;
  }
  if (suggestion.includes("getByLabel")) {
    const match = suggestion.match(/getByLabel\(['"]([^'"]+)['"]/);
    if (match) return `[aria-label="${match[1]}"]`;
  }
  if (suggestion.includes("getByTestId")) {
    const match = suggestion.match(/getByTestId\(['"]([^'"]+)['"]/);
    if (match) return `[data-testid="${match[1]}"]`;
  }

  // Raw CSS/XPath selector
  return suggestion;
}

/**
 * Wraps a Playwright Locator with self-healing capability.
 * If the original locator fails, it tries to find alternatives using AI.
 */
export async function withHealing<T>(
  page: Page,
  locator: Locator,
  action: () => Promise<T>,
  description: string
): Promise<{ result: T; healing: HealingResult | null }> {
  let healing: HealingResult | null = null;

  try {
    const result = await action();
    return { result, healing };
  } catch (error) {
    // Capturing DOM snapshot
    console.log(`[Healing] Locator failed: "${description}". Attempting to heal...`);

    const domSnippet = await captureDomSnapshot(page, description);
    const alternative = await healSelector(page, description, domSnippet);

    if (alternative) {
      console.log(`[Healing] ✅ Healed! "${description}" → "${alternative}"`);
      healing = {
        healed: true,
        originalSelector: description,
        healedSelector: alternative,
        attempts: 1,
      };

      // Retry with the healed locator
      const healedLocator = page.locator(alternative);
      const result = await action();
      return { result, healing };
    }

    console.log(`[Healing] ❌ Could not heal "${description}"`);
    throw error; // Re-throw original error if healing failed
  }
}

export type { HealingResult };
