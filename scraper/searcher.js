let startYear = 1993;
let endYear = 2011;

let searchUrlBuilder = function(year, month) {
  let start = new Date(year, month, 0);
  let end = new Date(year, (month + 1) % 12, 1);

  return `https://groups.google.com/forum/#!search/before$3A${end.getFullYear()}$2F${end.getMonth() + 1}$2F${end.getDate()}$20after$3A${start.getFullYear()}$2F${start.getMonth() + 1}$2F${start.getDate()}$20%22brett$20kosinski%22%7Csort:relevance`;
}

const puppeteer = require('puppeteer')
const fs = require('fs')

async function run() {
  var browser = await puppeteer.launch({ 
    headless: false,
    args: [ '--disable-timeouts-for-profiling' ]
  });

  async function processPage(url) {
    const page = await browser.newPage();

    await page.goto(url);

    await page.evaluate(() => {
      document.isPageReady = function() {
        let items = document.querySelectorAll("[role='listitem']");

        if (items.length > 0) {
          return true;
        }

        let e = document.querySelector(".F0XO1GC-Y-j");

        if ((e !== null) && (e.textContent === "No results found")) {
          return true;
        }

        return false;
      }
    });

    await page.waitForFunction('document.isPageReady()');

    await page.exposeFunction('log', async (message) => {
      console.log(message);
    });

    let threads = await page.evaluate(async () => {
      function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }

      function *urls() {
        let ids = {};

        outer: while (1) {
          let items = document.querySelectorAll("[role='listitem']");
          let found = false;

          for (let i = 0; i < items.length; i++) {
            let item = items.item(i);
            let url = item.querySelector("a").getAttribute("href");
            let [, tid] = url.split("sort:relevance/");

            if (ids[tid] !== undefined) {
              continue;
            }

            yield tid;

            item.scrollIntoView();
            found = true;
            ids[tid] = true;
            
            break;
          }

          if (! found) {
            break;
          }
        }
      }

      let res = [];

      for (let tid of urls()) {
        log(tid);
        res.push(tid);
        await sleep(500);
      }

      return JSON.stringify(res, null, 4);
    });

    await page.close();

    return threads;
  }

  let results = [];

  for (let year = startYear; year <= endYear; year++) {
    for (let month = 0; month <= 11; month++) {
      results.push({
        "month": `${year}-${month < 9 ? `0${month + 1}` : month + 1}-01`,
        "threads": JSON.parse(await processPage(searchUrlBuilder(year, month)))
      });
    }
  }

  fs.writeFile("messages/threads.json", JSON.stringify(results, null, 4), function(err) {
    if (err) {
      return console.log(err);
    }

    console.log("Done");
  });

  /*
  for (let url of urls) {
    var parts = url.split("/");
    var id = parts[parts.length - 1];

    console.log("Loading URL: " + url);

    fs.writeFile("messages/" + id + ".json", await processPage(url), function(err) {
      if (err) {
        return console.log(err);
      }

      console.log("Done");
    });
  }
  */

  browser.close();
}

run();
