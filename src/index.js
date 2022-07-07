const fetch = require('node-fetch'),
    fs = require('fs'),
    dedicatedUrl = "http://files.v04.maniaplanet.com/server/TrackmaniaServer";
let dediserversJson = JSON.parse(fs.readFileSync('./dediservers.json', 'utf8'));

(async () => {
    console.log('Fetching latest dedicated server:', dedicatedUrl+"_Latest.zip");
    let res = await fetch(dedicatedUrl+"_Latest.zip");

    let lastModified = new Date(res.headers.get('last-modified'));

    if (dediserversJson.length > 0 && (lastModified.getTime() / 1000) == dediserversJson[0].timestamp) {
        console.log("No new version.");
        process.exit(0);
    }

    let month = lastModified.getMonth() + 1;

    // add a 0 before the month if it is less than 10
    if (month < 10) month = "0" + month;
    else month = month.toString();

    let dateStr = lastModified.getFullYear()+"-"+month+"-"+lastModified.getDate();

    console.log("New version found:", dateStr, "("+res.headers.get('content-length')+" bytes)");

    res = await fetch(dedicatedUrl+"_"+dateStr+".zip");

    if (!res.ok) console.error("Error fetching dedicated server version:", res.statusText);

    let jsonAdd = {
        timestamp: lastModified.getTime() / 1000,
        url: dedicatedUrl+"_"+dateStr+".zip",
        date: dateStr,
        urlValid: res.ok
    }

    console.log(JSON.stringify(jsonAdd, null, 2));

    dediserversJson.unshift(jsonAdd);

    fs.writeFileSync('./dediservers.json', JSON.stringify(dediserversJson, null, 4));

})();