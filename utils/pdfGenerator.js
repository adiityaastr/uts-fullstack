const puppeteer = require('puppeteer');

async function generatePDFStream(employees, res) {
  const htmlRows = employees.map((e, i) => `
    <tr>
      <td>${i + 1}</td><td>${e.employee_code || ''}</td><td>${e.full_name || ''}</td>
      <td>${e.division || ''}</td><td>${e.position || ''}</td>
      <td>${e.employment_status || ''}</td><td>${e.email || ''}</td><td>${e.phone_number || ''}</td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    body{font-family:Arial,sans-serif;font-size:11px;margin:10px}
    h2{text-align:center;margin-bottom:5px}
    table{width:100%;border-collapse:collapse}
    th,td{border:1px solid #ddd;padding:6px;text-align:left}
    th{background:#0d6efd;color:white}
    tr:nth-child(even){background:#f9f9f9}
  </style></head><body>
    <h2>Laporan Data Karyawan - PT Digital Nusantara</h2>
    <p>Total: ${employees.length} karyawan | Tanggal: ${new Date().toLocaleDateString('id-ID')}</p>
    <table><thead><tr><th>#</th><th>Kode</th><th>Nama</th><th>Divisi</th><th>Jabatan</th><th>Status</th><th>Email</th><th>No HP</th></tr></thead>
    <tbody>${htmlRows}</tbody></table>
  </body></html>`;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
    });

    // Write headers and binary data directly
    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,
      'Content-Disposition': 'attachment; filename=employees_report.pdf',
      'Cache-Control': 'no-cache',
    });
    res.end(pdfBuffer);
  } finally {
    await browser.close();
  }
}

module.exports = { generatePDFStream };
