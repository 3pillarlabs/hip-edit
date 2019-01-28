import { randomBytes } from 'crypto';
import { AppPage } from './app.po';
import { ApiClient } from './api-client';

describe('hip-edit-web user', () => {
  const apiClient = new ApiClient({host: 'localhost', port: 9000});
  let page: AppPage;
  let sessionToken: string | void;

  beforeAll(async () => {
    sessionToken = await apiClient.createTopic().catch((error) => fail(error));
  });

  beforeEach(() => {
    page = new AppPage();
  });

  it('should view correct application title', () => {
    page.navigateTo();
    expect(page.getTitle()).toMatch(/Rarity/i);
  });

  it('should be able to join an existing session', () => {
    page.navigateTo();
    expect(page.joinSession('John Doe', sessionToken)).toBeTruthy();
  });

  it('should see the state of the editor when they join', () => {
    page.navigateTo();
    page.joinSession('John Doe', sessionToken);
    let input =
    `public class AppFinderBean implements InitializingBean {

    }`;
    page.setCode(input);
    let newPage = page.cloneNew().switch();
    newPage.navigateTo();
    newPage.joinSession('Jane Doe', sessionToken);
    newPage.wait(2);
    expect(newPage.getCode()).toMatch(input);
    newPage.closeBrowserWindow();
  });

  it('should have editor changes broadcast to connected sessions', () => {
    let inputCode = `class Foo
      end`;
    let newPage = page.cloneNew().switch();
    newPage.navigateTo();
    newPage.joinSession('Jane Doe', sessionToken)
    page.switch().navigateTo();
    page.joinSession('John Doe', sessionToken)
    page.setCode(inputCode);
    newPage.switch().wait(2);
    expect(newPage.getCode()).toMatch(inputCode);
    newPage.closeBrowserWindow();
  });

  it('should be able to create new session', async (done: () => void) => {
    page.navigateTo();
    let loginPage = await page.createNewSession();
    expect(loginPage).toBeTruthy();
    await loginPage.login('admin', 'password');
    expect(page.getCode()).toBeDefined();
    done();
  });
});
