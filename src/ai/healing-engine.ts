import { type Locator, type Page } from "@playwright/test";
import { suggestSelectors } from "./openai-client";
import { captureDomSnapshot } from "./dom-snapshot";
import {
  findHealedSelector,
  storeHealedSelector,
} from "./chroma-client";
import type { HealedSelectorRecord } from "./chroma-client";

interface HealingResult {
  healed: boolean;
  originalSelector: string;
  healedSelector: string;
  attempts: number;
}

/**
 * Try to heal a failed locator by checking ChromaDB cache first, then AI.
 * Returns the first working selector, or null if all fail.
 */
async function healSelector(
  page: Page,
  originalDescription: string,
  domSnippet: string,
  pageUrl: string
): Promise<{ selector: string | null; fromCache: boolean }> {
  // Step 1: Check ChromaDB cache
  const cached = await findHealedSelector(
    originalDescription,
    originalDescription,
    pageUrl
  );
  if (cached) {
    const locator = page.locator(cached);
    const visible = await locator.isVisible({ timeout: 2000 }).catch(() => false);
    if (visible) {
      return { selector: cached, fromCache: true };
    }
  }

  // Step 2: Fall back to OpenAI
  const suggestions = await suggestSelectors(
    originalDescription,
    domSnippet,
    originalDescription
  );

  for (const suggestion of suggestions) {
    try {
      const selector = extractSelector(suggestion);
      const locator = page.locator(selector);
      const visible = await locator.isVisible({ timeout: 2000 });
      if (visible) {
        return { selector: suggestion, fromCache: false };
      }
    } catch {
      continue;
    }
  }
  return { selector: null, fromCache: false };
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
    const result = await healSelector(page, description, domSnippet, page.url());
    const alternative = result.selector;

    if (alternative) {
      console.log(`[Healing] ✅ Healed! "${description}" → "${alternative}"${result.fromCache ? ' (from cache)' : ''}`);

      healing = {
        healed: true,
        originalSelector: description,
        healedSelector: alternative,
        attempts: 1,
      };

      // Store in ChromaDB if it came from OpenAI (cache for future)
      if (!result.fromCache) {
        const record: HealedSelectorRecord = {
          id: `heal-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
          originalSelector: description,
          healedSelector: alternative,
          elementDescription: description,
          pageUrl: page.url(),
          domSnippet,
          timestamp: new Date().toISOString(),
        };
        storeHealedSelector(record).catch(() => {});
      }

      // Retry with the healed locator
      const healedLocator = page.locator(alternative);
      const result_data = await action();
      return { result: result_data, healing };
    }

    console.log(`[Healing] ❌ Could not heal "${description}"`);
    throw error; // Re-throw original error if healing failed
  }
}

export type { HealingResult };
