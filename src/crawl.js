const puppeteer = require("puppeteer");
const readline = require("readline");
const fs = require("fs");
const FinalSchools = [];
async function processLineByLine() {
  const fileStream = fs.createReadStream("test.txt");
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    await initialize(line);
  }
}
processLineByLine();
let initialize = async (url) => {
  puppeteer
    .launch({ headless: false })
    .then(async (browser) => {
      const page = await browser.newPage();
      const School = {
        url: "",
        phone: null,
      };
      await page.goto("https://google.com.br", { waitUntil: "load" });
      await page.type("input.gLFyf.gsfi", url);
      await page.keyboard.press("Enter");
      await page.waitForNavigation();
      const site = await page.evaluate(
        () =>
          document.getElementsByTagName("cite")[0].parentElement.parentElement
            .href
      );
      School.url = site;
      console.log(site);
      const richPopup = await page.$x(
        '//h2[contains(text(), "Resultados complementares")]'
      );
      if (richPopup !== "") {
        try {
          const Phone = await page.evaluate(() => {
            const testing = document.querySelector("span[role='link']");
            if (testing === null) {
              return false;
            } else {
              return testing.innerText;
            }
          });
          School.phone = Phone;
        } catch (error) {
          throw error;
        }
      }
      FinalSchools.push(School);
      await browser.close();
    })
    .then(() => {
      fs.writeFileSync(
        "schools_info.json",
        JSON.stringify(FinalSchools),
        "utf-8"
      );
      console.log(FinalSchools);
    })
    .catch((err) => console.error("Error in inicializing", err));
};
