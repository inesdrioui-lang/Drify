import { generateDossierHTML, DossierTemplateData } from './dossier-template';

export async function generateDossierPDF(data: DossierTemplateData): Promise<Buffer> {
  const html = generateDossierHTML(data);

  // En production Vercel, on utilise @sparticuz/chromium + puppeteer-core
  // En dev local, puppeteer standard peut être utilisé si installé
  const isVercel = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME;

  let browser: import('puppeteer-core').Browser;

  if (isVercel) {
    const chromium = (await import('@sparticuz/chromium')).default;
    const puppeteer = await import('puppeteer-core');
    const executablePath = await chromium.executablePath();
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath,
      headless: true,
    });
  } else {
    // Dev local : utilise puppeteer-core avec le Chrome système ou Chromium local
    const puppeteer = await import('puppeteer-core');
    const executablePath =
      process.env.PUPPETEER_EXECUTABLE_PATH ||
      // macOS Chrome par défaut
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

    browser = await puppeteer.launch({
      headless: true,
      executablePath,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--font-render-hinting=none',
      ],
    });
  }

  try {
    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: ['networkidle0', 'load'],
      timeout: 30000,
    });

    await page.evaluateHandle('document.fonts.ready');

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      preferCSSPageSize: false,
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
