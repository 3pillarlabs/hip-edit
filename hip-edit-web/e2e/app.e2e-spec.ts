import { AppPage } from './app.po';

describe('hip-edit-web App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display correct application title', () => {
    page.navigateTo();
    expect(page.getTitle()).toMatch(/Hip\s+Edit/);
  });

  it('should broadcast text to connected sessions', () => {
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
