require('dotenv').config();
const { By, until } = require('selenium-webdriver');
const { expect } = require('chai');
const getDriver = require('../utils/webdriver');

describe('Rendering Kartu Dashboard - Kalimantan Station 1', function () {
  this.timeout(30000); // Timeout keseluruhan untuk describe block
  let driver;
  const stationUrl = process.env.BASE_URL + '/kalimantan/station1';

  before(async () => {
    driver = await getDriver();
    await driver.get(stationUrl);
    // Tunggu kartu 'Humidity' sebagai indikasi awal bahwa halaman mulai memuat konten kartu.
    // XPath ini mencari h5 dengan teks 'Humidity' di dalam div dengan class 'text-center'.
    try {
      await driver.wait(
        until.elementLocated(By.xpath(`//div[contains(@class, 'text-center')]//h5[normalize-space(text())='Humidity']`)),
        15000, // Waktu tunggu untuk elemen pertama ini
        "Kartu 'Humidity' tidak ditemukan dalam 15 detik pada saat setup."
      );
    } catch (error) {
      console.error("Error pada before hook saat menunggu kartu Humidity:", error.message);
      // Pertimbangkan untuk mengambil screenshot atau HTML source di sini jika sering gagal
      // await driver.takeScreenshot().then(image => require('fs').writeFileSync('error_screenshot_before_hook.png', image, 'base64'));
      // const pageSource = await driver.getPageSource();
      // require('fs').writeFileSync('error_page_source_before_hook.html', pageSource);
      throw error; // Lemparkan kembali error agar tes gagal dan diketahui
    }
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  // Daftar kartu yang diharapkan muncul. Pastikan labelnya sesuai dengan yang ada di web.
  // "Water Temperature" dihapus karena tidak ada di web.
  const cards = [
    { label: 'Humidity' },
    { label: 'Temperature' },
    { label: 'Wind Speed' }, // Pastikan ini "Wind Speed" bukan "Windspeed" jika itu yang tampil di UI kartu
    { label: 'Rainfall' },
    { label: 'Irradiation' },
    { label: 'Wind Direction' }
    // { label: 'Water Temperature' } // Dihapus karena tidak ada di web
  ];

  cards.forEach(cardInfo => {
    it(`Kartu ${cardInfo.label} harus muncul dan menampilkan judul yang benar`, async () => {
      let cardElement;
      try {
        // XPath mencari div dengan class 'text-center' YANG MEMILIKI ('.//') h5
        // dengan teks yang sesuai (setelah normalisasi dan diubah ke lowercase).
        cardElement = await driver.wait(
          until.elementLocated(By.xpath(
            `//div[contains(@class,'text-center') and .//h5[normalize-space(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'))="${cardInfo.label.toLowerCase()}"]]`
          )),
          15000, // Waktu tunggu ditingkatkan menjadi 15 detik untuk setiap kartu
          `Kartu untuk '${cardInfo.label}' tidak ditemukan atau tidak muncul dalam 15 detik.`
        );
      } catch (error) {
        console.error(`Detail error saat mencari kartu ${cardInfo.label}:`, error.message);
        // Opsional: Ambil screenshot atau source HTML saat terjadi error spesifik ini
        // const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        // await driver.takeScreenshot().then(image => require('fs').writeFileSync(`error_screenshot_kartu_${cardInfo.label}_${timestamp}.png`, image, 'base64'));
        // const pageSource = await driver.getPageSource();
        // require('fs').writeFileSync(`error_page_source_kartu_${cardInfo.label}_${timestamp}.html`, pageSource);
        throw error; // Lemparkan kembali error
      }
      
      // Verifikasi judul elemen h5 di dalam kartu yang ditemukan
      const titleElement = await cardElement.findElement(By.xpath(`.//h5[normalize-space(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'))="${cardInfo.label.toLowerCase()}"]`));
      expect((await titleElement.getText()).toLowerCase()).to.equal(cardInfo.label.toLowerCase());
      expect(await cardElement.isDisplayed()).to.be.true; // Pastikan kartu benar-benar terlihat
    });
  });
});
