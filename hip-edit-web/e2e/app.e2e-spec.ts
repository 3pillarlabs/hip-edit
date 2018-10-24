import { AppPage } from './app.po';

describe('hip-edit-web user', () => {
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
    expect(page.joinSession('John Doe', 'ed59e0d5-c9df-4d08-9345-d35ab2bd83e3')).toBeTruthy();
  });

  it('should have editor changes broadcast to connected sessions', () => {
    let inputCode = `class Foo
      end`;
    let newPage = page.cloneNew().switch();
    newPage.navigateTo();
    page.switch().navigateTo();
    page.setCode(inputCode);
    newPage.switch().wait(2);
    expect(newPage.getCode()).toMatch(inputCode);
  });
});
