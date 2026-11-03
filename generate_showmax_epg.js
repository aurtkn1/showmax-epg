
const axios = require("axios");

const URL = "https://www.showmax.com.tr/yayin-akisi/";

async function inspectShowmax() {
  try {
    const response = await axios.get(URL, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 30000
    });

    const html = response.data;

    console.log("SHOWMAX TARİH EŞLEŞTİRME TESTİ");

    const dates = [...new Set(
      [...html.matchAll(/\b\d{2}\.\d{2}\.\d{4}\b/g)]
        .map(m => m[0])
    )];

    console.log("\nBULUNAN TARİHLER:");
    dates.forEach((date, i) => {
      console.log(i + 1, date);
    });

    const tabRegex = /<div\b[^>]*class="[^"]*\btab-content\b[^"]*"[^>]*>/gi;
    const tabs = [...html.matchAll(tabRegex)];

    console.log("\nYAYIN BÖLÜMÜ SAYISI:", tabs.length);

    tabs.forEach((tab, i) => {
      const start = tab.index;
      const end = i + 1 < tabs.length
        ? tabs[i + 1].index
        : html.length;

      const section = html.substring(start, end);

      const regex = /<span[^>]*>\s*(\d{1,2}:\d{2})\s*<\/span>\s*<span[^>]*>\s*([\s\S]*?)\s*<\/span>/gi;

      const programs = [...section.matchAll(regex)];

      console.log("\nBÖLÜM", i + 1);
      programs.forEach(p => {
        const name = p[2].replace(/<[^>]*>/g, "").trim();
        console.log(p[1], "-", name);
      });
    });

  } catch (error) {
    console.error("HATA:", error.message);
    process.exitCode = 1;
  }
}

inspectShowmax();
