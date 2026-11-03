
const axios = require("axios");

const URL = "https://www.showmax.com.tr/yayin-akisi/";

async function testShowmax() {
  console.log("==================================");
  console.log("SHOWMAX WEB SAYFASI TESTİ");
  console.log("==================================");

  try {
    const response = await axios.get(URL, {
      timeout: 30000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml"
      }
    });

    const html = response.data;

    console.log("HTTP DURUM:", response.status);
    console.log("HTML UZUNLUĞU:", html.length);
    console.log("SAYFA BAŞLIĞI:");

    const title = html.match(/<title[^>]*>(.*?)<\/title>/is);
    console.log(title ? title[1] : "Bulunamadı");

    console.log("----------------------------------");
    console.log("YAYIN AKIŞI VERİLERİ:");

    const matches = html.match(/.{0,100}(?:Gelin Evi|Gelsin Hayat Bildiği Gibi|Aşk Laftan Anlamaz|Fatih Harbiye|Yeni Gelin|Siyah Kalp|Rüya Gibi).{0,150}/gis);

    if (matches) {
      matches.slice(0, 30).forEach(item => console.log(item));
      console.log("TOPLAM EŞLEŞME:", matches.length);
    } else {
      console.log("Program isimleri HTML içinde bulunamadı.");
    }

    console.log("----------------------------------");
    console.log("WEB SAYFASI TESTİ BAŞARILI");

  } catch (error) {
    console.error("HATA:", error.message);
    process.exitCode = 1;
  }
}

testShowmax();
