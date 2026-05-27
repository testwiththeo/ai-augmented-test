import { test, expect } from "@playwright/test";

test("SauceDemo page title is correct", async ({ page }) => {
  await page.goto("https://www.saucedemo.com");
  await expect(page).toHaveTitle(/Swag Labs/);
});
