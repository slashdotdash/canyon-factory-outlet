var cheerio = require('cheerio');
var notifier = require('node-notifier');
var request = require('request-promise');

//URL parameters
var CANYON_URL = "https://www.canyon.com/en-gb/factory-outlet/ajax/articles.html?category=road&type=html";

var TIMEOUT_INTERVAL = 3600 * 1000 // 1 hour;

//Bike search params
var SERIES = "Ultimate CF SL";
var SIZES = "S";
var SEARCH_TEXT = "ULTIMATE CF SL DISC";

function normalizeText(value) { return value.replace(/\s\s+/g, " ");}
function parseAndSearchBikesFromFactoryOutlet(body) {
    var result = [];
    var $ = cheerio.load(body);
    $('article[data-series="' + SERIES + '"][data-size="|' + SIZES + '|"]').each(function (i, elem) {
        $el = $(elem);

        var text = $el.find($('.product-title')).text();
        if (text.indexOf(SEARCH_TEXT) === -1) return;
        var price = $el.find($('.price-retail')).text();
        result.push({
            'title': 'Hello, there is a new bike for you',
            'product': normalizeText(text),
            'message':  normalizeText(text) + " - " + normalizeText(price)
        });
    });
    return result;
}

async function main() {
    console.log("Requesting " + CANYON_URL);
    var body = await request.get({'url':CANYON_URL});
    //var body = await request.get({'url':CANYON_URL,'proxy':PROXY_URL});

    var bikes = parseAndSearchBikesFromFactoryOutlet(body);

    if (bikes.length === 0) {
      console.log('No bikes found.');
    } else {
      // notify each bike found
      for (var i = 0; i < bikes.length; i++) {
        console.log('Found ' + bikes[i].product);
        notifier.notify(bikes[i]);
      }
    }

    return 0;
}

//initial call
main();

//set to make repeated call
setInterval(main, TIMEOUT_INTERVAL);
