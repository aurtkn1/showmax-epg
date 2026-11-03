
const axios = require("axios");
const fs = require("fs");

const URL = "https://www.showmax.com.tr/yayin-akisi/";
const CHANNEL_ID = "showmax.tr";

function escapeXML(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function nextDay(date) {
  const [day, month, year] = date.split(".").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day + 1));

  return [
    String(d.getUTCDate()).padStart(2, "0"),
    String(d.getUTCMonth() + 1).padStart(2, "0"),
    d.getUTCFullYear()
  ].join(".");
}

function localTimestamp(date, time) {
  const [day, month, year] = date.split(".").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  return Date.UTC(year, month - 1, day, hour, minute);
}

function xmlTimestamp(timestamp) {
  const d = new Date(timestamp);

  const pad = n => String(n).padStart(2, "0");

  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    "00 +0300"
  );
}

async function generateEPG() {
  console.log("==================================");
  console.log("SHOWMAX OTOMATİK EPG BAŞLADI");
  console.log("==================================");

  const response = await axios.get(URL, {
    timeout: 30000,
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });

  const html = response.data;

  const dates = [...new Set(
    [...html.matchAll(/\b\d{2}\.\d{2}\.\d{4}\b/g)]
      .map(m => m[0])
  )];

  const tabRegex =
    /<div\b[^>]*class="[^"]*\btab-content\b[^"]*"[^>]*>/gi;

  const tabs = [...html.matchAll(tabRegex)];

  console.log("TARİH SAYISI:", dates.length);
  console.log("YAYIN BÖLÜMÜ:", tabs.length);

  if (dates.length === 0 || dates.length !== tabs.length) {
    throw new Error("Tarih ve yayın bölümü eşleşmedi!");
  }

  const programs = [];

  for (let i = 0; i < tabs.length; i++) {
    const start = tabs[i].index;
    const end = i + 1 < tabs.length
      ? tabs[i + 1].index
      : html.length;

    const section = html.substring(start, end);

    const regex =
      /<span[^>]*>\s*(\d{1,2}:\d{2})\s*<\/span>\s*<span[^>]*>\s*([\s\S]*?)\s*<\/span>/gi;

    const matches = [...section.matchAll(regex)];

    if (matches.length === 0) {
      throw new Error(`${dates[i]} tarihinde program bulunamadı!`);
    }

    console.log("\nTARİH:", dates[i]);
    console.log("PROGRAM:", matches.length);

    for (const match of matches) {
      const time = match[1];

      const name = match[2]
        .replace(/<[^>]*>/g, "")
        .replace(/&amp;/g, "&")
        .trim();

      if (!name) continue;

      // 02:00 ve 04:15 ertesi güne aittir.
      const programDate =
        Number(time.split(":")[0]) < 7
          ? nextDay(dates[i])
          : dates[i];

      programs.push({
        date: programDate,
        time,
        name,
        timestamp: localTimestamp(programDate, time)
      });

      console.log(time, "-", name);
    }
  }

  programs.sort((a, b) => a.timestamp - b.timestamp);

  const uniquePrograms = programs.filter((p, i, arr) =>
    i === 0 ||
    p.timestamp !== arr[i - 1].timestamp
  );

  if (uniquePrograms.length < 40) {
    throw new Error("Program sayısı beklenenden az!");
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<tv generator-info-name="Showmax Automatic EPG" generator-info-url="https://www.showmax.com.tr/">
  <channel id="${CHANNEL_ID}">
    <display-name>Showmax HD</display-name>
  </channel>
`;

  for (let i = 0; i < uniquePrograms.length; i++) {
    const program = uniquePrograms[i];

    let stop;

    if (i + 1 < uniquePrograms.length) {
      stop = uniquePrograms[i + 1].timestamp;
    } else {
      const followingDate = nextDay(program.date);
      stop = localTimestamp(followingDate, "07:00");
    }

    if (stop <= program.timestamp) {
      throw new Error("Geçersiz program süresi: " + program.name);
    }

    xml += `  <programme start="${xmlTimestamp(program.timestamp)}" stop="${xmlTimestamp(stop)}" channel="${CHANNEL_ID}">
    <title lang="tr">${escapeXML(program.name)}</title>
  </programme>
`;
  }

  xml += "</tv>\n";

  fs.writeFileSync("showmax.xml", xml, "utf8");

  console.log("\n==================================");
  console.log("SHOWMAX EPG BAŞARIYLA OLUŞTURULDU");
  console.log("TOPLAM PROGRAM:", uniquePrograms.length);
  console.log("DOSYA: showmax.xml");
  console.log("==================================");
}

generateEPG().catch(error => {
  console.error("EPG HATASI:", error.message);
  process.exit(1);
});
