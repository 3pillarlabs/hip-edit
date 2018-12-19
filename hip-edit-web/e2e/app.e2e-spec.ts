import { randomBytes } from 'crypto';
import { AppPage } from './app.po';

describe('hip-edit-web user', () => {
  const sessionTokenFn = () => {
    return randomBytes(16).toString('hex');
  }

  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should view correct application title', () => {
    page.navigateTo();
    expect(page.getTitle()).toMatch(/Rarity/i);
  });

  it('should be able to join an existing session', () => {
    page.navigateTo();
    expect(page.joinSession('John Doe', sessionTokenFn())).toBeTruthy();
  });

  it('should see the state of the editor when they join', () => {
    let sessionToken = sessionTokenFn();
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
    let sessionToken = sessionTokenFn();
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

  it('should be able to create new session', async (done) => {
    page.navigateTo();
    let loginPage = await page.createNewSession();
    expect(loginPage).toBeTruthy();
    await loginPage.login('admin', 'password');
    expect(page.getCode()).toBeDefined();
    done();
  });
});
