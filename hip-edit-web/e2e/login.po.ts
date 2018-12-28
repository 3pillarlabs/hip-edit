import { browser, by, element, ProtractorBrowser, protractor } from 'protractor';
import { By } from 'selenium-webdriver';

export default class LoginPage {
  private userName: By  = by.xpath('//input[@name="userName"]');
  private password: By = by.xpath('//input[@name="password"]');
  private loginButton: By = by.xpath('//button');
  private browser: ProtractorBrowser;

  constructor(browser: ProtractorBrowser) {
    this.browser = browser;
  }

  async isValid(): Promise<boolean> {
    let element = this.browser.element(this.userName).getWebElement();
    return await element.isDisplayed().catch<boolean>((_e) => false);
  }

  async login(userName: string, password: string) {
    try {
      this.browser.ignoreSynchronization = true;
      await this.browser.element(this.userName).sendKeys(userName);
      await this.browser.element(this.password).sendKeys(password);
      await this.browser.element(this.loginButton).click();
    } finally {
      this.browser.ignoreSynchronization = false;
    }
  }

  static getModel(browser: ProtractorBrowser): LoginPage {
    let page = new LoginPage(browser);
    if (page.isValid()) {
      return page;
    }
    throw new Error("Invalid Login Page");
  }
}
