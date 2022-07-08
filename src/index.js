const fetch = require('node-fetch'),
    fs = require('fs'),
    dedicatedUrl = "https://nadeo-download.cdn.ubi.com/trackmania/TrackmaniaServer";

if (!fs.existsSync('./dediservers.json')) fs.writeFileSync('./dediservers.json', '{}');
let dediserversJson = JSON.parse(fs.readFileSync('./dediservers.json', 'utf8'));

(async () => {
    console.log('Fetching latest dedicated server:', dedicatedUrl+"_Latest.zip");
    let res = await fetch(dedicatedUrl+"_Latest.zip");

    const lastModified = new Date(res.headers.get('last-modified'));

    if (typeof dediserversJson.latest == "object" && (lastModified.getTime() / 1000) == dediserversJson.latest.timestamp) {
        console.log("No new version.");
        process.exit(0);
    }

    let month = lastModified.getMonth() + 1;

    // add a 0 before the month if it is less than 10
    if (month < 10) month = "0" + month;
    else month = month.toString();

    const dateStr = lastModified.getFullYear()+"-"+month+"-"+lastModified.getDate(),
        size = Number(res.headers.get('content-length'));

    console.log("New version found:", dateStr, "("+size+" bytes)");

    let jsonAdd = {
        date: lastModified,
        timestamp: lastModified.getTime() / 1000,
        url: dedicatedUrl+"_Latest.zip",
        versionDate: dateStr,
        size,
        urlValid: res.ok
    }

    dediserversJson.latest = jsonAdd;

    res = await fetch(dedicatedUrl+"_"+dateStr+".zip");

    if (!res.ok) console.error("Error fetching dedicated server version:", res.status, res.statusText);

    jsonAdd = {
        date: lastModified,
        timestamp: lastModified.getTime() / 1000,
        url: dedicatedUrl+"_"+dateStr+".zip",
        versionDate: dateStr,
        size,
        urlValid: res.ok
    }

    console.log(JSON.stringify(jsonAdd, null, 2));

    if (!Array.isArray(dediserversJson.versions)) dediserversJson.versions = [];
    dediserversJson.versions.unshift(jsonAdd);

    fs.writeFileSync('./dediservers.json', JSON.stringify(dediserversJson, null, 4));

})();
