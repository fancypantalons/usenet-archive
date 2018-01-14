let urlBuilder = (tid) => `https://groups.google.com/d/msg/${tid}`;
let urls = []; 

const puppeteer = require('puppeteer')
const fs = require('fs')

async function run(results) {
  var browser = await puppeteer.launch({ 
    headless: true,
    args: [ '--disable-timeouts-for-profiling' ]
  });

  async function processPage(url) {
    const page = await browser.newPage();

    await page.goto(url);
    await page.addScriptTag({url: 'https://code.jquery.com/jquery-3.2.1.min.js'});
    await page.waitForFunction('$(".F0XO1GC-nb-Y").find("[dir=\'ltr\']").length > 0');
    await page.waitForFunction('$(".F0XO1GC-nb-Y").find("._username").text().length > 0');

    await page.exposeFunction('escape', async () => {
      page.keyboard.press('Escape');
    });

    await page.exposeFunction('log', async (message) => {
      console.log(message);
    });

    var messages = await page.evaluate(async () => {
      function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }

      var res = []

      await sleep(5000);

      var messages = $(".F0XO1GC-nb-Y");
      var texts = messages.find("[dir='ltr']").filter("div");

      for (let msg of messages.get()) {
        // Open the message menu
        $(msg).find(".F0XO1GC-k-b").first().click();

        await sleep(100);

        // Find the link button
        $(":contains('Link')").filter("span").click();

        await sleep(100);

        // Grab the URL
        var msgurl = $(".F0XO1GC-Cc-b").filter("input").val().replace(
          "https://groups.google.com/d/", 
          "https://groups.google.com/forum/message/raw?"
        ).replace("msg/", "msg=");

        await sleep(100);

        // Now close the thing
        window.escape();       

        var text;

        await $.get(msgurl, (data) => text = data);

        res.push({
          'username': $(msg).find("._username").text(),
          'date': $(msg).find(".F0XO1GC-nb-Q").text(),
          'url': msgurl,
          'text': text
        });

        window.log("Message: " + res.length);
      };

      return JSON.stringify({
        'group': $(".F0XO1GC-mb-x").find("a").first().text(),
        'count': res.length,
        'subject': $(".F0XO1GC-mb-Y").text(),
        'messages': res
      }, null, 4);
    });

    await page.close();

    return messages;
  }

  let startFrom = "https://groups.google.com/d/msg/comp.os.linux.setup/uBVzzLhW66M/IZzHPpjCcBoJ";
  let found = false;

  for (let url of urls) {
    if ((startFrom !== null) && (startFrom !== url) && ! found) {
      console.log("Skipping URL: " + url);

      continue;
    } else {
      found = true;
    }

    let parts = url.split("/");
    let id = parts[parts.length - 1];

    console.log("Loading URL: " + url);

    let thread = JSON.parse(await processPage(url));

    results.count += thread.count;
    results.threads.push(thread);

    fs.writeFileSync("messages.json", JSON.stringify(results, null, 4));
  }

  browser.close();
}

fs.readFile("messages/threads.json", { "encoding": "utf8" }, (err, data) => {
  let months = JSON.parse(data);

  for (let month of months) {
    for (let thread of month.threads) {
      urls.push(urlBuilder(thread));
    }
  }

  fs.readFile("messages.json", { "encoding": "utf8" }, (err, data) => run(JSON.parse(data)));
});

//run()

/*
messages: .F0XO1GC-nb-Y
  user: _username -> span
  date: .F0XO1GC-nb-Q
  $("[dir='ltr']").filter("div")
*/
