const { chromium } = require("playwright");

const launch = chromium.launch.bind(chromium);
chromium.launch = (options = {}) =>
  launch({
    ...options,
    executablePath:
      process.env.DPA_BROWSER_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
  });

require("./capture-docs.cjs");
