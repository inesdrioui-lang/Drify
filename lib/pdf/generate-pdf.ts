import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { generateDossierHTML, DossierTemplateData } from './dossier-template';

export async function generateDossierPDF(data: DossierTemplateData): Promise<Buffer> {
  const isDev = process.env.NODE_ENV === 'development';

  let executablePath: string;
  let launchArgs: string[];

  if (isDev) {
    // En local, utilise le Chrome bundlé par puppeteer (mac_arm / mac_x64)
    const { default: puppeteerFull } = await import('puppeteer');
    executablePath = puppeteerFull.executablePath();
    launchArgs = [];
  } else {
    executablePath = await chromium.executablePath();
    launchArgs = chromium.args;
  }

  const browser = await puppeteer.launch({
    args: launchArgs,
    defaultViewport: { width: 794, height: 1123, deviceScaleFactor: 2 },
    executablePath,
    headless: true,
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });

  const html = generateDossierHTML(data);
  await page.setContent(html, { waitUntil: ['networkidle0', 'load'], timeout: 30000 });
  await page.evaluateHandle('document.fonts.ready');

  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  });

  await browser.close();
  return Buffer.from(pdf);
}
