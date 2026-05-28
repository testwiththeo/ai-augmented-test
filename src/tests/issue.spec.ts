import { test, expect } from "../fixtures/loggedInPage";
import { ProjectPage } from "../pages/ProjectPage";
import { IssuePage } from "../pages/IssuePage";

test("create an issue in a project", async ({ loggedInPage }) => {
  const projectPage = new ProjectPage(loggedInPage.page);
  const issuePage = new IssuePage(loggedInPage.page);
  const projectName = `QA${Date.now()}`;

  // Step 1: Create a project via UI
  await projectPage.gotoProjects();
  await projectPage.createProject(projectName, "Project for issue testing");

  // Step 2: Close the success dialog
  await projectPage.closeSuccessDialog();

  // Step 3: Navigate directly to the project's issues page
  await projectPage.navigateToProject(projectName);

  // Step 4: Create an issue
  const issueTitle = `Bug-${Date.now()}`;
  await issuePage.createIssue(issueTitle, "Test issue description");

  // Assert: issue appears on the page
  await expect(loggedInPage.page.getByText(issueTitle).first()).toBeVisible();
});
