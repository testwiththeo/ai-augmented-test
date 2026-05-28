import { test as base } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";

export const test = base.extend<{
  loggedInPage: LoginPage;
}>({
  loggedInPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.fillEmail("theo@weareanoa.app");
    await loginPage.clickContinue();
    await loginPage.fillPassword("Theodorus.15");
    await loginPage.clickSignIn();
    await page.waitForURL(/^http:\/\/localhost\/[^\/]+\/$/);
    await use(loginPage);
  },
});

export { expect } from "@playwright/test";
