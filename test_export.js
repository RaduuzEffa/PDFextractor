const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const pdfData = "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n184\n%%EOF";
    fs.writeFileSync('dummy.pdf', pdfData);

    const browser = await puppeteer.launch({headless: "new"});
    const page = await browser.newPage();
    page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()));
    
    // We will start a small static server
    const express = require('express');
    const app = express();
    app.use(express.static(__dirname));
    const server = app.listen(9091, async () => {
        try {
            await page.goto('http://localhost:9091/index.html', {waitUntil: 'networkidle0'});
            const fileInput = await page.$('#pdf-upload');
            await fileInput.uploadFile('dummy.pdf');
            await page.waitForTimeout(2000); // wait for load
            await page.click('#export-btn');
            await page.waitForTimeout(2000); // wait for export to finish
        } catch(e) {
            console.log('TEST ERROR:', e);
        } finally {
            await browser.close();
            server.close();
        }
    });
})();
