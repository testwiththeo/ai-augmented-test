import { type Page, type Locator, expect } from "@playwright/test";

export class ProjectPage {
  readonly page: Page;
  readonly projectsLink: Locator;
  readonly addProjectButton: Locator;
  readonly projectNameInput: Locator;
  readonly projectIdInput: Locator;
  readonly descriptionInput: Locator;
  readonly createProjectButton: Locator;
  readonly closeSuccessButton: Locator;
  readonly openProjectLink: Locator;
  readonly successDialog: Locator;

  constructor(page: Page) {
    this.page = page;
    this.projectsLink = page
      .getByLabel("Main sidebar")
      .getByRole("link", { name: "Projects" });
    this.addProjectButton = page.getByRole("button", { name: "Add Project" });
    this.projectNameInput = page.getByRole("textbox", { name: "Project name" });
    this.projectIdInput = page.getByRole("textbox", { name: "Project ID" });
    this.descriptionInput = page.getByRole("textbox", { name: "Description" });
    this.createProjectButton = page.getByRole("button", {
      name: "Create project",
    });
    this.closeSuccessButton = page.getByRole("button", { name: "Close" });
    this.successDialog = page.getByRole("dialog");
    this.openProjectLink = this.successDialog.getByRole("link", { name: "Open project" });
  }

  async gotoProjects() {
    await this.projectsLink.click();
  }

  async clickAddProject() {
    await this.addProjectButton.click();
  }

  async fillProjectName(name: string) {
    await this.projectNameInput.fill(name);
    // Explicitly set a unique project ID (max 10 chars)
    // Format: first 2 letters + last 8 digits of timestamp
    const prefix = name.replace(/[0-9]/g, '').substring(0, 2);
    const suffix = name.replace(/^[a-zA-Z]+/, '').replace(/\D/g, '').slice(-8);
    await this.projectIdInput.fill(`${prefix}${suffix}`);
  }

  async fillDescription(description: string) {
    await this.descriptionInput.fill(description);
  }

  async clickCreateProject() {
    await this.createProjectButton.click();
  }

  async closeSuccessDialog() {
    // Close the success/config dialog by pressing Escape
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(500);
  }

  async getProjectIssuesUrl(projectName: string): Promise<string | null> {
    // Find the project card link and return its href
    return await this.page.evaluate((name) => {
      const links = Array.from(document.querySelectorAll('a[href*="/issues"]'));
      for (const link of links) {
        if (link.textContent?.includes(name)) {
          return link.getAttribute('href');
        }
      }
      return null;
    }, projectName);
  }

  async navigateToProject(projectName: string) {
    const url = await this.getProjectIssuesUrl(projectName);
    if (url) {
      await this.page.goto(url);
      await this.page.waitForURL(/\/issues/, { timeout: 10000 });
    }
  }

  async createProject(name: string, description?: string) {
    await this.clickAddProject();
    await this.fillProjectName(name);
    if (description) {
      await this.fillDescription(description);
    }
    await this.clickCreateProject();
    // Wait for success dialog or form to close
    await this.page.waitForSelector('text=Congrats', { timeout: 15000 });
  }
}
