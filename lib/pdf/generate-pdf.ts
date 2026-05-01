import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { generateDossierHTML, DossierTemplateData, DossierDocument } from './dossier-template';

// Converts a PDF URL to a base64 PNG by screenshotting it in a headless Chrome page.
// Returns null if the conversion fails (caller shows a placeholder instead).
async function convertPdfToImage(
  browser: Awaited<ReturnType<typeof puppeteer.launch>>,
  url: string
): Promise<string | null> {
  let pdfPage: Awaited<ReturnType<(typeof browser)['newPage']>> | null = null;
  try {
    pdfPage = await browser.newPage();
    await pdfPage.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.5 });
    await pdfPage.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
    // Brief pause so Chrome's PDF viewer finishes rendering
    await new Promise((r) => setTimeout(r, 800));
    const screenshot = await pdfPage.screenshot({ type: 'png', fullPage: false });
    return `data:image/png;base64,${Buffer.from(screenshot as Uint8Array).toString('base64')}`;
  } catch {
    return null;
  } finally {
    if (pdfPage) await pdfPage.close().catch(() => {});
  }
}

export async function generateDossierPDF(data: DossierTemplateData): Promise<Buffer> {
  const isDev = process.env.NODE_ENV === 'development';

  let executablePath: string;
  let launchArgs: string[];

  if (isDev) {
    const { default: puppeteerFull } = await import('puppeteer');
    executablePath = puppeteerFull.executablePath();
    launchArgs = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'];
  } else {
    executablePath = await chromium.executablePath();
    launchArgs = [...chromium.args, '--disable-web-security', '--allow-running-insecure-content'];
  }

  const browser = await puppeteer.launch({
    args: launchArgs,
    defaultViewport: { width: 794, height: 1123, deviceScaleFactor: 2 },
    executablePath,
    headless: true,
  });

  try {
    // Pre-process PDF documents: convert first page to a PNG data URL so it
    // can be embedded inline in the HTML template (Puppeteer can't render <img> pointing
    // to a PDF, but can screenshot its own PDF viewer).
    const processedDocuments: DossierDocument[] = await Promise.all(
      data.documents.map(async (doc) => {
        if (doc.mime_type === 'application/pdf' && doc.url && doc.statut === 'verifie') {
          const dataUrl = await convertPdfToImage(browser, doc.url);
          return { ...doc, data_url: dataUrl ?? undefined };
        }
        return doc;
      })
    );

    const processedData: DossierTemplateData = { ...data, documents: processedDocuments };

    const page = await browser.newPage();
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
    await page.setExtraHTTPHeaders({ Accept: 'image/*,application/pdf,*/*' });

    const html = generateDossierHTML(processedData);
    await page.setContent(html, { waitUntil: ['networkidle0', 'load'], timeout: 30000 });
    await page.evaluateHandle('document.fonts.ready');

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
