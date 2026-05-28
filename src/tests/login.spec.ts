import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";

test("sign in with valid credentials", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.fillEmail("theo@weareanoa.app");
  await loginPage.clickContinue();
  await loginPage.fillPassword("Theodorus.15");
  await loginPage.clickSignIn();

  await expect(page).toHaveURL(/^http:\/\/localhost\/[^\/]+\/$/);
});

test("show erorr when password is wrong", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.fillEmail("theo@weareanoa.app");
  await loginPage.clickContinue();
  await loginPage.fillPassword("wrong-password");
  await loginPage.clickSignIn();

  await expect(page.getByText("Authentication failed")).toBeVisible();
});
