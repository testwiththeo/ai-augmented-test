import { test, expect } from "../fixtures/loggedInPage";
import { ProjectPage } from "../pages/ProjectPage";

test("create a new project", async ({ loggedInPage }) => {
  const projectPage = new ProjectPage(loggedInPage.page);
  const projectName = `Test${Date.now()}`;

  await projectPage.gotoProjects();
  await projectPage.createProject(projectName, "Project created by automated test");

  // Assert: we should see the project name on the page
  await expect(loggedInPage.page.getByText(projectName).first()).toBeVisible({ timeout: 10000 });
});
