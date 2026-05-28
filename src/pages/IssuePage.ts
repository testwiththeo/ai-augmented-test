import { type Page, type Locator } from "@playwright/test";

export class IssuePage {
  readonly page: Page;
  readonly createIssueButton: Locator;
  readonly firstIssueButton: Locator;
  readonly issueTitleInput: Locator;
  readonly saveIssueButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createIssueButton = page.getByLabel("Main sidebar").getByRole("button", { name: /New work item/i });
    this.firstIssueButton = page.getByRole("button", { name: "Create your first work item" });
    this.issueTitleInput = page.getByRole("textbox", { name: "Title" });
    this.saveIssueButton = page.getByRole("button", { name: "Save" });
  }

  async clickCreateIssue() {
    const firstBtn = this.firstIssueButton;
    if (await firstBtn.isVisible().catch(() => false)) {
      await firstBtn.click();
    } else {
      await this.createIssueButton.click();
    }
  }

  async fillTitle(title: string) {
    await this.issueTitleInput.fill(title);
  }

  async saveIssue() {
    await this.saveIssueButton.click();
  }

  async createIssue(title: string) {
    await this.clickCreateIssue();
    await this.fillTitle(title);
    await this.saveIssue();
  }
}
