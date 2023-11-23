import { Browser } from "puppeteer";
import { accountTikTok } from "./contants";
import { delay } from 'rxjs/operators';
const { Keyboard } = require('puppeteer')
import { of } from 'rxjs';
import axios from 'axios';
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

(async () => {
  const accessToken = 'TDS9JCOyVmdlNnI6IiclZXZzJCLiMDMuVWe1dmb5VHZiojIyV2c1Jye';
  const fields = 'tiktok_follow';
  const type1 = 'TIKTOK_FOLLOW_CACHE';
  const cookie = 'PHPSESSID=7c24c89f87e9e57a71123f2d523ee3cc';
  const useragent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36';
  const browser: Browser = await puppeteer.use(StealthPlugin()).launch({
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--enable-webgl',
      '--window-size=1000,1000'
    ]
  });
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US'
  })
  await page.setJavaScriptEnabled(true);

while(true) {

  for (let i = 0; i < accountTikTok.length; i++) {
    try {
      const auth = await axios.get(`https://traodoisub.com/api/?fields=tiktok_run&id=${accountTikTok[i].username}&access_token=${accessToken}`);

      const datNick = await axios.post('https://traodoisub.com/scr/tiktok_datnick.php', { iddat: auth.data.data.id }, {
        headers: {
          cookie: cookie,
          'User-Agent': useragent,
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      })
      if (datNick.data === 1) {
        console.log('Dặt tài khoản chạy | ' + auth.data.data.uniqueID);
      }
    } catch (error) {
      console.log('Đã cấu hình tài khoản này rồi!')
    }
    await page.goto('https://www.tiktok.com/');
    const cookies: any = accountTikTok[i].cookie.split('; ');
    for (const cookie of cookies) {
      const [name, value] = cookie.split('=');
      await page.setCookie({ name, value });
    }
    await of(null).pipe(delay(20000)).toPromise();
    let count = 0;
    let handle = true
    while (handle) {
      let NV = await axios.get(`https://traodoisub.com/api/?fields=${fields}&access_token=${accessToken}`);
      while (NV.data.countdown || !NV.data) {
        console.log('Waiting for valid data...' + NV.data?.countdown);
        try {
          const updateNV: any = await axios.get(`https://traodoisub.com/api/?fields=${fields}&access_token=${accessToken}`);
          NV.data = updateNV.data;
        } catch (error) {
          console.error('Error in inner loop:', error.message)

        }
      }
      for (const e of NV.data.data) {
        try {
          await of(null).pipe(delay(100)).toPromise();
          await page.goto(e.link);
          await of(null).pipe(delay(2000)).toPromise();
          const btnSubscribe = await page.waitForSelector('[data-e2e="follow-button"]');
          await of(null).pipe(delay(100)).toPromise();
          if (btnSubscribe) {
            await btnSubscribe.click();
            count++
            const cache = await axios.get(`https://traodoisub.com/api/coin/?type=${type1}&id=${e.id}&access_token=${accessToken}`);
            console.log(cache.data)
            if (cache.data.cache > 8) {
              const NX: any = await axios.get(`https://traodoisub.com/api/coin/?type=TIKTOK_FOLLOW&id=TIKTOK_FOLLOW_API&access_token=${accessToken}`
              );
              console.log("đã nhận: ", NX.data)
              handle = false;
              console.log('Dã tạm dừng chạy USERNAME tài khoản này | ' + accountTikTok[i].username)
              break;

            }
          }

        } catch (error) {
          console.log(error)
        }

      }
    }
  }
}

})();
console.log(`🦊 Running`);
