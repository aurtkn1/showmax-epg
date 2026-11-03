
const axios = require("axios");

const URL = "https://www.showmax.com.tr/yayin-akisi/";

async function inspectShowmax() {
  try {
    const response = await axios.get(URL, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      },
      timeout: 30000
    });

    const html = response.data;

    const tabs = [...html.matchAll(/tab-content/gi)];

    console.log("SHOWMAX YAYIN GÜNLERİ");
    console.log("BULUNAN TAB SAYISI:", tabs.length);

    for (let i = 0; i < tabs.length; i++) {
      const start = tabs[i].index;
      const end = i + 1 < tabs.length
        ? tabs[i + 1].index
        : html.length;

      const section = html.substring(start, end);
      const before = html.substring(Math.max(0, start - 1800), start);

      console.log("\n================================");
      console.log("YAYIN BÖLÜMÜ:", i + 1);
      console.log("================================");

      console.log("BÖLÜM ÖNCESİ:");
      console.log(before.slice(-1000));

      const regex = /<span[^>]*>(\d{1,2}:\d{2})<\/span>\s*<span[^>]*>([\s\S]*?)<\/span>/gi;

      const programs = [...section.matchAll(regex)];

      console.log("PROGRAM SAYISI:", programs.length);

      programs.forEach(program => {
        const name = program[2].replace(/<[^>]*>/g, "").trim();
        console.log(program[1], "-", name);
      });
    }

  } catch (error) {
    console.error("HATA:", error.message);
    process.exitCode = 1;
  }
}

inspectShowmax();
