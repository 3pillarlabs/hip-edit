import { browser, by, element, ProtractorBrowser, protractor } from 'protractor';
import { By } from 'selenium-webdriver';
import LoginPage from './login.po';

export class AppPage {
  private codeArea: By  = by.id('hippy-1');
  private fullNameField: By = by.xpath('//input[@name="userAlias"]');
  private sessionTokenField: By = by.xpath('//input[@name="sessionToken"]');
  private joinButton: By = by.xpath('//button[@name="joinSession"]');
  private newSessionButton: By = by.id('create-new-sesion');
  private browser : ProtractorBrowser = null;

  constructor(newBrowser : ProtractorBrowser = null) {
    this.browser = newBrowser || browser;
  }

  async navigateTo(path: string = '/') {
    return await this.browser.get(path);
  }

  async getTitle() {
    return await this.browser.getTitle();
  }

  setCode(codeText : string) {
    const hippy = this.browser.element(this.codeArea);
    hippy.clear().then(async () => {
      await hippy.sendKeys(codeText);
      await hippy.sendKeys(protractor.Key.TAB);
    });
  }

  async getCode() {
    const hippy = this.browser.element(this.codeArea).getWebElement();
    return await hippy.getAttribute('value').catch<string>(() => undefined);
  }

  cloneNew() : AppPage {
    return new AppPage(this.openNewBrowserWindow());
  }

  switch() : AppPage {
    this.browser.switchTo();
    return this;
  }

  wait(seconds : number) {
    this.browser.sleep(seconds * 1000);
  }

  private openNewBrowserWindow() : ProtractorBrowser {
    return this.browser.forkNewDriverInstance();
  }

  async joinSession(fullName: string, sessionToken: string) {
    this.browser.element(this.sessionTokenField).sendKeys(sessionToken);
    this.browser.element(this.fullNameField).sendKeys(fullName);
    await this.browser.element(this.joinButton).click();
    try {
      return this.browser.element(this.codeArea);
    } catch (error) {
      return undefined;
    }
  }

  async closeBrowserWindow() {
    await this.browser.close();
  }

  async createNewSession() {
    try {
      this.browser.waitForAngularEnabled(false);
      await this.browser.element(this.newSessionButton).click();
      try {
        return LoginPage.getModel(this.browser);
      } catch (error) {
        return undefined;
      }
    } finally {
      this.browser.waitForAngularEnabled(true);
    }
  }
}
