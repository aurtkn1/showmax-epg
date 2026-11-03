
const axios = require("axios");

const URL = "https://www.showmax.com.tr/yayin-akisi/";

async function inspectShowmax() {
  try {
    const response = await axios.get(URL, {
      timeout: 30000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
      }
    });

    const html = response.data;

    console.log("SHOWMAX HTML DETAYLI İNCELEME");
    console.log("HTML UZUNLUĞU:", html.length);

    const regex = /<span[^>]*class="[^"]*text-xl[^"]*"[^>]*>[\s\S]*?<\/span>/gi;
    const matches = [...html.matchAll(regex)];

    console.log("PROGRAM SAYISI:", matches.length);

    matches.slice(0, 5).forEach((match, index) => {
      const start = Math.max(0, match.index - 1200);
      const end = Math.min(html.length, match.index + 1500);

      console.log("\n========== PROGRAM", index + 1, "==========");
      console.log(html.substring(start, end));
    });

    console.log("\n========== TARİH VE SAAT İPUÇLARI ==========");

    const keywords = ["2026-", "date", "time", "07:00", "09:00", "11:30"];

    keywords.forEach(keyword => {
      const index = html.indexOf(keyword);

      if (index !== -1) {
        console.log("\nİPUCU:", keyword);
        console.log(html.substring(Math.max(0, index - 300), index + 500));
      }
    });

  } catch (error) {
    console.error("HATA:", error.message);
    process.exitCode = 1;
  }
}

inspectShowmax();
