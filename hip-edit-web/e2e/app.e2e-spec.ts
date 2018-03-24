import { AppPage } from './app.po';

describe('hip-edit-web App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display correct application title', () => {
    page.navigateTo();
    page.getTitle().then((title) => {
      expect(title).toMatch(/Hip\s+Edit/);
    });
  });
});
