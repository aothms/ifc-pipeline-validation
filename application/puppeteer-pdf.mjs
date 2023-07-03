import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();

  await page.setViewport({width: 1920, height: 1080});
  await page.goto(process.argv[2], {waitUntil: 'networkidle0'});
  await page.addStyleTag({ content: `.MuiPaper-root { 
      border-radius: 0 !important; 
      box-shadow: none !important;
    }
    .MuiTreeItem-iconContainer {
      display: none !important;
    }`
  });
  await page.pdf({ path: process.argv[3], format: 'A4' });
  await browser.close();
})();
