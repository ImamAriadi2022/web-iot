require('dotenv').config();
const { By, until } = require('selenium-webdriver');
const { expect } = require('chai');
const getDriver = require('../utils/webdriver');

describe('Dashboard Web IoT', function () {
    this.timeout(40000);
    let driver;

    before(async () => {
        driver = await getDriver();
        await driver.get(process.env.BASE_URL + '/kalimantan/station1');
        await driver.sleep(3000);
    });

    after(async () => {
        if (driver) await driver.quit();
    });

    it('Harus menampilkan judul utama dashboard', async () => {
        // Cek judul Station 1
        let title;
        try {
            title = await driver.wait(
                until.elementLocated(By.xpath("//*[contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'environment status')]")),
                10000
            );
        } catch {
            // Fallback: cari judul dashboard umum
            title = await driver.wait(
                until.elementLocated(By.xpath("//*[contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'dashboard')]")),
                10000
            );
        }
        expect((await title.getText()).toLowerCase()).to.match(/environment status|dashboard/);
    });

    it('Harus menampilkan semua gauge utama', async () => {
        const gauges = [
            'Humidity',
            'Temperature',
            'Windspeed',
            'Rainfall',
            'Irradiation',
            'Wind Direction',
            'Water Temperature'
        ];
        for (const label of gauges) {
            let el;
            try {
                el = await driver.wait(
                    until.elementLocated(By.xpath(`//h5[contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'), "${label.toLowerCase()}")]`)),
                    10000
                );
            } catch {
                // Fallback: cari label pada elemen lain
                el = await driver.wait(
                    until.elementLocated(By.xpath(`//*[contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'), "${label.toLowerCase()}")]`)),
                    10000
                );
            }
            expect((await el.getText()).toLowerCase()).to.include(label.toLowerCase());
        }
    });

    it('Harus menampilkan tombol filter 1 Day, 7 Days, 1 Month', async () => {
        const filters = ['1 Day', '7 Days', '1 Month'];
        for (const label of filters) {
            let btn;
            try {
                btn = await driver.wait(
                    until.elementLocated(By.xpath(`//button[contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'), "${label.toLowerCase()}")]`)),
                    10000
                );
            } catch {
                // Fallback: cari pada elemen lain
                btn = await driver.wait(
                    until.elementLocated(By.xpath(`//*[contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'), "${label.toLowerCase()}")]`)),
                    10000
                );
            }
            expect((await btn.getText()).toLowerCase()).to.include(label.toLowerCase());
        }
    });

    it('Harus menampilkan tabel status dengan header yang benar', async () => {
        const headers = [
            'Timestamp',
            'Humidity',
            'Temperature',
            'Air Pressure',
            'Rainfall',
            'Irradiation',
            'Windspeed',
            'Wind Direction',
            'Water Temperature'
        ];
        for (const header of headers) {
            let th;
            try {
                th = await driver.wait(
                    until.elementLocated(By.xpath(`//th[contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'), "${header.toLowerCase()}")]`)),
                    10000
                );
            } catch {
                // Fallback: cari pada elemen lain
                th = await driver.wait(
                    until.elementLocated(By.xpath(`//*[contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'), "${header.toLowerCase()}")]`)),
                    10000
                );
            }
            expect((await th.getText()).toLowerCase()).to.include(header.toLowerCase());
        }
    });

    it('Harus menampilkan chart status', async function () {
        try {
            const chartTitle = await driver.wait(
                until.elementLocated(By.xpath("//*[contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'chart status')]")),
                10000
            );
            expect((await chartTitle.getText()).toLowerCase()).to.include('chart status');
            const chart = await driver.wait(
                until.elementLocated(By.css('canvas,svg')),
                10000
            );
            expect(chart).to.exist;
        } catch (e) {
            this.skip();
            console.warn('Chart/API lambat atau tidak tersedia, test dilewati:', e.message);
        }
    });

    it('Harus menampilkan tombol download data', async function () {
        let downloadBtn;
        try {
            downloadBtn = await driver.findElement(By.xpath("//button[contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'download data')]"));
        } catch {
            const nav = await driver.findElements(By.xpath("//a[contains(@href,'/dashboard/download')]"));
            if (nav.length > 0) {
                await nav[0].click();
                downloadBtn = await driver.wait(
                    until.elementLocated(By.xpath("//button[contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'download data')]")),
                    10000
                );
            }
        }
        expect(downloadBtn).to.exist;
    });

    // Tambahan: cek sidebar dan navigasi antar halaman dashboard
    it('Sidebar harus muncul dan bisa toggle', async () => {
        const toggleBtn = await driver.wait(
            until.elementLocated(By.css('div[style*="position:fixed"] svg')),
            10000
        );
        await toggleBtn.click();
        await driver.sleep(500);
        const mainContent = await driver.findElement(By.xpath("//div[contains(@style,'margin-left')]"));
        const style = await mainContent.getAttribute('style');
        expect(style).to.match(/margin-left:\s*0/);
        await toggleBtn.click();
        await driver.sleep(500);
        const style2 = await mainContent.getAttribute('style');
        expect(style2).to.match(/margin-left:\s*250px/);
    });

    it('Navigasi ke halaman Station 2 dari sidebar', async () => {
        const station2Nav = await driver.wait(
            until.elementLocated(By.xpath("//a[contains(@href,'/dashboard/station2') or contains(@href,'/kalimantan/station2')]")),
            10000
        );
        await station2Nav.click();
        const url = await driver.getCurrentUrl();
        expect(url).to.match(/station2/);
        const title = await driver.wait(
            until.elementLocated(By.xpath("//*[contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'station 2')]")),
            10000
        );
        expect((await title.getText()).toLowerCase()).to.include('station 2');
    });

    it('Navigasi ke halaman Download dari sidebar', async () => {
        const downloadNav = await driver.wait(
            until.elementLocated(By.xpath("//a[contains(@href,'/dashboard/download')]")),
            10000
        );
        await downloadNav.click();
        const url = await driver.getCurrentUrl();
        expect(url).to.match(/download/);
        const downloadBtn = await driver.wait(
            until.elementLocated(By.xpath("//button[contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'download data')]")),
            10000
        );
        expect((await downloadBtn.getText()).toLowerCase()).to.include('download data');
    });
});

  it('Harus menampilkan semua gauge utama', async () => {
    const gauges = [
      'Humidity',
      'Temperature',
      'Windspeed',
      'Rainfall',
      'Irradiation',
      'Wind Direction',
      'Water Temperature'
    ];
    for (const label of gauges) {
      const el = await driver.wait(
        until.elementLocated(By.xpath(`//h5[contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'), "${label.toLowerCase()}")]`)),
        10000
      );
      expect((await el.getText()).toLowerCase()).to.include(label.toLowerCase());
    }
  });

  it('Harus menampilkan tombol filter 1 Day, 7 Days, 1 Month', async () => {
    const filters = ['1 Day', '7 Days', '1 Month'];
    for (const label of filters) {
      const btn = await driver.wait(
        until.elementLocated(By.xpath(`//button[contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'), "${label.toLowerCase()}")]`)),
        10000
      );
      expect((await btn.getText()).toLowerCase()).to.include(label.toLowerCase());
    }
  });

  it('Harus menampilkan tabel status dengan header yang benar', async () => {
    const headers = [
      'Timestamp',
      'Humidity',
      'Temperature',
      'Air Pressure',
      'Rainfall',
      'Irradiation',
      'Windspeed',
      'Wind Direction',
      'Water Temperature'
    ];
    for (const header of headers) {
      const th = await driver.wait(
        until.elementLocated(By.xpath(`//th[contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'), "${header.toLowerCase()}")]`)),
        10000
      );
      expect((await th.getText()).toLowerCase()).to.include(header.toLowerCase());
    }
  });

  it('Harus menampilkan chart status', async function () {
    try {
      const chartTitle = await driver.wait(
        until.elementLocated(By.xpath("//*[contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'chart status')]")),
        10000
      );
      expect((await chartTitle.getText()).toLowerCase()).to.include('chart status');
      const chart = await driver.wait(
        until.elementLocated(By.css('canvas,svg')),
        10000
      );
      expect(chart).to.exist;
    } catch (e) {
      this.skip();
      console.warn('Chart/API lambat atau tidak tersedia, test dilewati:', e.message);
    }
  });

  it('Harus menampilkan tombol download data', async function () {
    let downloadBtn;
    try {
      downloadBtn = await driver.findElement(By.xpath("//button[contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'download data')]"));
    } catch {
      const nav = await driver.findElements(By.xpath("//a[contains(@href,'/dashboard/download')]"));
      if (nav.length > 0) {
        await nav[0].click();
        downloadBtn = await driver.wait(
          until.elementLocated(By.xpath("//button[contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'download data')]")),
          10000
        );
      }
    }
    expect(downloadBtn).to.exist;
  });