import PDFDocument from 'pdfkit';
import sharp from 'sharp';
import { putBuffer } from './storage.service.js';

const streamToBuffer = (doc) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

export const generateProductionPdf = async ({ order, item, assetBuffer }) => {
  const variant = item.variantSnapshot || {};
  const widthMm = variant.printArea?.widthMm || 210;
  const heightMm = variant.printArea?.heightMm || 297;
  const widthPt = widthMm * 2.83465;
  const heightPt = heightMm * 2.83465;

  const printImage = await sharp(assetBuffer)
    .resize({
      width: Math.round((widthMm / 25.4) * 300),
      height: Math.round((heightMm / 25.4) * 300),
      fit: 'cover'
    })
    .jpeg({ quality: 95 })
    .toBuffer();

  const doc = new PDFDocument({ size: [widthPt, heightPt], margin: 0 });
  doc.image(printImage, 0, 0, { width: widthPt, height: heightPt });
  doc.info.Title = `${order.orderNo}-${item.sku || item._id}`;
  doc.end();

  const pdf = await streamToBuffer(doc);
  return putBuffer({
    key: `production/${order.orderNo}/${item._id}.pdf`,
    buffer: pdf,
    contentType: 'application/pdf'
  });
};
