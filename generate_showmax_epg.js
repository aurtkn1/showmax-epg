
const axios = require("axios");

const API_URL =
  "https://api.gleams.dev/api/customers/inline-modules?key=gl_5S5955D3NN7YGWH3&h=www.showmax.com.tr&path=%2Fyayin-akisi";

async function testShowmaxAPI() {
  console.log("==================================");
  console.log("SHOWMAX EPG - API TESTİ");
  console.log("==================================");

  try {
    const response = await axios.get(API_URL, {
      timeout: 30000,
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json, text/plain, */*"
      }
    });

    console.log("HTTP DURUM:", response.status);
    console.log("İÇERİK TÜRÜ:", response.headers["content-type"]);
    console.log("----------------------------------");
    console.log("API VERİSİ:");

    if (typeof response.data === "object") {
      console.log(JSON.stringify(response.data, null, 2));
    } else {
      console.log(response.data);
    }

    console.log("----------------------------------");
    console.log("API TESTİ BAŞARILI");

  } catch (error) {
    console.error("API HATASI:");

    if (error.response) {
      console.error("HTTP DURUM:", error.response.status);
      console.error("YANIT:", error.response.data);
    } else {
      console.error(error.message);
    }

    process.exitCode = 1;
  }
}

testShowmaxAPI();
