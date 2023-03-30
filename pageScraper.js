// const fs = require('fs');
// const { stringify } = require('querystring');

// const scraperObject = {
//   url: "https://www2.zoetis.ca/",
//   async scraper(browser) {
//     const visitedUrls = new Set();

//     async function generateObject(url){
// 		const urls = await scrapePage(url);
// 		const subObjects = [];
// 		for(const subUrl of urls){
// 			const subObject = await generateObject(subUrl);
// 			subObjects.push(subObject);
// 		}

// 		return {
// 			[url]: subObjects
// 		}
// 	}

//     const scrapePage = async (link) => {
//       if (visitedUrls.has(link)) return [];
//       else visitedUrls.add(link);
//       const newPage = await browser.newPage();
// 	  console.log('Visiting link: ' + link);
//       await newPage.goto(link, { waitUntil: "networkidle2" });
// 	  console.log("Link visited");

// 	  let newUrls = [];
//       newUrls = await newPage.$$eval("a", (links) => {
//         // Extract the links from the data
//         links = links.map((a) => a.href.split('?')[0].split('#')[0]).filter(link => {
// 			return (
// 				(link.includes("www.zoetis.ca/") || link.includes("www2.zoetis.ca")) &&
// 				!link.includes("content") &&
// 				!link.includes("global-assets") &&
// 				!link.includes(".pdf") &&
// 				!link.includes(".zip") &&
// 				!link.includes(".mp4") &&
// 				!link.includes(".jpg")
// 			);
// 		}).filter((value, index, array) => array.indexOf(value) === index);;
// 		return links;
//       });

//       await newPage.close();
//       return newUrls;
//     };

//     const obj = await generateObject(this.url);
// 	fs.writeFile("object.json", JSON.stringify(obj), function(err) {
// 		console.log(obj);
// 	})
//   },
// };

// module.exports = scraperObject;

// ABove is no good cause dfs and not bfs

const fs = require("fs");

const scraperObject = {
	url: "https://www2.zoetis.ca/",
	async scraper(browser) {
		const visitedUrls = {};

		async function generateObject(url) {
			const queue = [url]; // Initialize queue with the root URL
			const obj = {};

			while (queue.length > 0) {
				const currentUrl = queue.shift();

				if (visitedUrls[currentUrl]) continue;
				visitedUrls[currentUrl] = currentUrl;

				if (
					!currentUrl.includes(".zoetis.ca/") ||
					currentUrl.includes("learn") ||
					currentUrl.includes("content") ||
					currentUrl.includes("global-assets") ||
					currentUrl.includes(".pdf") ||
					currentUrl.includes(".zip") ||
					currentUrl.includes(".mp4") ||
					currentUrl.includes(".jpg")
				) {
					continue;
				}

				console.log("Visiting link: " + currentUrl);
				const urls = await scrapePage(currentUrl);
				console.log("Link visited");

				const subObjects = [];
				for (const subUrl of urls) {
					if (!visitedUrls[subUrl]) {
						queue.push(subUrl);
					}
				}

				console.log("Current Url: " + currentUrl);
				const splitUrls = currentUrl.split("://")[1].split("/");
				console.log("Split Url:");
				console.log(splitUrls);

				let currentObj = obj;
				// Create nested objects for each part of the link
				for (let i = 0; i < splitUrls.length; i++) {
					const linkPart = "/" + splitUrls[i];
					if (!currentObj[linkPart]) {
						currentObj[linkPart] = {};
					}
					currentObj = currentObj[linkPart];
				}
				currentObj["urls"] = urls;
				console.log(obj);
			}

			return obj;
		}

		const scrapePage = async (link) => {
			const newPage = await browser.newPage();
			await newPage.goto(link, { waitUntil: "networkidle2", timeout: 0 });
			let newUrls = [];
			newUrls = await newPage.$$eval("a", (links) => {
				// Extract the links from the data
				links = links
					.map((a) => a.href.split("?")[0].split("#")[0])
					.filter((value, index, array) => array.indexOf(value) === index);
				return links;
			});

			await newPage.close();
			return newUrls;
		};

		const obj = await generateObject(this.url);
		console.log(JSON.parse(JSON.stringify(obj)));
		fs.writeFile("data.json", JSON.stringify(obj), function (err) {
			console.log(obj);
		});
	},
};

module.exports = scraperObject;
