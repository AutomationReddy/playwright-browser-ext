const { chromium } = require("playwright");
const path = require("path");
const assert = require("node:assert");

const extensionPath = path.resolve(__dirname, "../../extensions");
process.env.PW_CHROMIUM_ATTACH_TO_OTHER = "1";

exports.mochaHooks = {
  async beforeEach() {
    this.browser = await chromium.launchPersistentContext("", {
      headless: false,
      executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`, "--start-maximized"],
      devtools: true,
      viewport: null,
      no_viewport: true,
    });

    //Fetching devtools panel as a page
    this.devtools = this.browser.pages().find((page) => page.url().includes("devtools://devtools/bundled/devtools_app.html"));
    assert(this.devtools);
    this.page = this.browser.pages().find((page) => page.url().includes("about:blank"));
    assert(this.page);
    await this.page.goto("https://browserstack.com", { waitUntil: "domcontentloaded" });

    await new Promise(function (resolve) {
      setTimeout(resolve, 1000);
    });

    // Dock devtools to bottom and select a11y toolkit panel
    await this.devtools.getByRole("button", { name: "Customize and control DevTools" }).click();
    await this.devtools.getByRole("button", { name: "Dock to bottom" }).click();

    await this.devtools.getByRole("tab", { name: "Accessibility Toolkit" }).click();

    //Closing the extension auto opened page
    const extensionPage = this.browser.pages().find((page) => page.url().includes("accessibility"));
    assert(extensionPage);
    await extensionPage.close();

    //Fetching a11y tool kit as a frame
    this.a11yPanel = await this.devtools.frameLocator('iframe[src*="index.html"]');
  },

  async afterEach() {
    if (this.currentTest.state !== "passed") {
      const screenshot_file_dir = __dirname + "/../../reports/screenshots/" + this.currentTest.parent.title.replaceAll(" ", "");
      const screenshot_file_name = new Date().toJSON() + ".png";
      const screenshot_file_path = screenshot_file_dir + "/" + screenshot_file_name;
      await new Promise(function (resolve) {
        setTimeout(resolve, 1500);
      });
      await this.a11yPanel.locator("html").screenshot({ path: screenshot_file_path });
    }
    await this.browser.close();
  },
};
