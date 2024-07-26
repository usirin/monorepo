import {autoKayle, setLogging} from "kayle";
import {chromium} from "playwright";

// enable kayle log output
setLogging(true);

const browser = await chromium.launch({headless: true});
const page = await browser.newPage();

// crawls are continued to the next page automatically fast!
const results = await autoKayle({
	// @ts-ignore
	page,
	browser,
	includeWarnings: true,
	origin: "https://csirin.com",
	waitUntil: "domcontentloaded",
	cb: function callback(result) {
		console.log(result);
	},
});

// console.log({results});
