const fs = require("fs/promises");
const { Builder, By } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const compareImages = require("resemblejs/compareImages");

const HOST = "http://localhost:4567";

describe("Responsive Testimonial Slider Layout", function () {
  let driver;

  beforeEach(async () => {
    const options = new chrome.Options();
    if (options.headless) {
      options.addArguments("--headless");
    }
    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();
    await driver.get(HOST);
  });

  afterEach(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  describe("Responsive tests", () => {
    it("should match all three sections at width 1200px and height 540px with the template", async () => {
      await driver.manage().window().setRect({ width: 1200, height: 540 });
      await driver.get(HOST);
      await compareSectionWithTemplate(driver, "main", "main-1200x540", 10);
    });

    it("should match two sections at width 1000px and height 540px with the template", async () => {
      await driver.manage().window().setRect({ width: 1000, height: 540 });
      await driver.get(HOST);
      await compareSectionWithTemplate(driver, "main", "main-1000x540", 10);
    });

    it("should match two sections at width 700px and height 540px with the template", async () => {
      await driver.manage().window().setRect({ width: 700, height: 540 });
      await driver.get(HOST);
      await compareSectionWithTemplate(driver, "main", "main-700x540", 12);
    });
  });

  describe("sidebar section layout at 1200x540", () => {
    it("should match the layout of the left sidebar section at width 1200px and height 540px with the template", async () => {
      await driver.manage().window().setRect({ width: 1200, height: 540 });
      await driver.get(HOST);
      await compareSectionWithTemplate(
        driver,
        "left-sidebar",
        "left-sidebar-1200x540",
        3
      );
    });
  });

  describe("posts section layout at 1200x540", () => {
    it("Mid posts section", async () => {
      await driver.manage().window().setRect({ width: 1200, height: 540 });
      await driver.get(HOST);
      await compareSectionWithTemplate(
        driver,
        "all-posts",
        "mid-section-1200x540",
        8
      );
    });
  });

  describe("right-sidebar section layout at 1200x540", () => {
    it("right-sidebar section", async () => {
      await driver.manage().window().setRect({ width: 1200, height: 540 });
      await driver.get(HOST);
      await compareSectionWithTemplate(
        driver,
        "right-sidebar",
        "right-sidebar-1200x540",
        3
      );
    });
  });

  describe("Blog Post Card", () => {
    let posts, navItem, leftSidebar, rightSidebar;

    beforeEach(async () => {
      posts = await driver.findElements(By.css(".post"));
      navItem = await driver.findElement(By.css(".nav-item"));
      leftSidebar = await driver.findElement(By.css(".left-sidebar"));
      rightSidebar = await driver.findElement(By.css(".right-sidebar"));
    });

    it("should have all styles correctly applied to post", async () => {
      for (const post of posts) {
        const backgroundColor = await post.getCssValue("background-color");
        const padding = await post.getCssValue("padding");
        const marginBottom = await post.getCssValue("margin-bottom");
        const border = await post.getCssValue("border");
        const itemColor = await navItem.getCssValue("color");
        const itemTextDecoration = await navItem.getCssValue("text-decoration");

        expect(border).toBe("1px solid rgb(221, 221, 221)");
        expect(marginBottom).toBe("20px");
        expect(padding).toBe("15px");
        expect(backgroundColor).toBe("rgba(255, 255, 255, 1)");
        expect(itemColor).toBe("rgba(76, 175, 80, 1)");
        expect(itemTextDecoration).toContain("none");
      }
      const leftSidebarBackgroundColor = await leftSidebar.getCssValue(
        "background-color"
      );
      const rightSidebarBackgroundColor = await rightSidebar.getCssValue(
        "background-color"
      );
      expect(leftSidebarBackgroundColor).toBe("rgba(248, 248, 248, 1)");
      expect(rightSidebarBackgroundColor).toBe("rgba(248, 248, 248, 1)");

      const leftSidebarPadding = await leftSidebar.getCssValue("padding");
      const rightSidebarPadding = await rightSidebar.getCssValue("padding");
      expect(leftSidebarPadding).toBe("15px");
      expect(rightSidebarPadding).toBe("15px");
    });
  });
});

const compareSectionWithTemplate = async (
  driver,
  sectionClass,
  stateName,
  epsilon
) => {
  const sectionElement = await driver.findElement(By.className(sectionClass));
  const sectionImage = await sectionElement.takeScreenshot();

  const actualImageBase64 = "data:image/png;base64," + sectionImage;
  const templateImageBase64 = await fs.readFile(
    `./test/fixtures/actual-${stateName}.png`
  );

  const { misMatchPercentage, getBuffer } = await compareImages(
    actualImageBase64,
    templateImageBase64
  );

  await fs.writeFile(`diff-${stateName}.png`, getBuffer(), "base64");

  expect(parseFloat(misMatchPercentage)).toBeLessThan(epsilon || 1);
};
