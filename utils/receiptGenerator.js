const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

module.exports = function generateReceiptPDF(receipt) {
  const filePath = path.join(__dirname, `../pdf/${receipt.receiptNumber}.pdf`);

  // 80mm receipt ≈ 226 points width
  const doc = new PDFDocument({
    size: [226, 1000], // height grows automatically
    margins: { top: 10, left: 10, right: 10, bottom: 10 },
  });

  doc.pipe(fs.createWriteStream(filePath));

  const center = { align: "center" };

  /* =====================
     STORE HEADER
  ===================== */
  doc.font("Courier-Bold").fontSize(12).text(receipt.businessName, center);

  doc
    .font("Courier")
    .fontSize(8)
    .text(receipt.businessAddress, center)
    .text(receipt.businessPhone, center)
    .moveDown(0.5);

  divider(doc);

  /* =====================
     RECEIPT INFO
  ===================== */
  doc
    .fontSize(8)
    .text(`Receipt: ${receipt.receiptNumber}`)
    .text(`Order: ${receipt.orderId}`)
    .text(
      `Date: ${
        receipt.createdAt?.toLocaleString() || new Date().toLocaleString()
      }`
    )
    .text(`Payment: ${receipt.paymentMethod}`);

  divider(doc);

  /* =====================
     CUSTOMER
  ===================== */
  doc
    .text(`Customer: ${receipt.customerName}`)
    .text(receipt.customerEmail || "");

  divider(doc);

  /* =====================
   ITEMS (REAL POS STYLE)
===================== */
  doc.font("Courier-Bold").fontSize(8).text("ITEMS");
  divider(doc);

  // Column widths (MUST add up to <= 206)
  const COL_ITEM = 90;
  const COL_QTY = 25;
  const COL_PRICE = 40;
  const COL_TOTAL = 40;
  const START_X = 10;

  receipt.items.forEach((item) => {
    const y = doc.y;

    // Item name
    doc.text(item.productName, START_X, y, {
      width: COL_ITEM,
      lineBreak: false,
      ellipsis: true,
    });

    // Qty
    doc.text(String(item.quantity), START_X + COL_ITEM, y, {
      width: COL_QTY,
      align: "center",
      lineBreak: false,
    });

    // Unit price
    doc.text(formatMoney(item.unitPrice), START_X + COL_ITEM + COL_QTY, y, {
      width: COL_PRICE,
      align: "right",
      lineBreak: false,
    });

    // Total
    doc.text(
      formatMoney(item.totalPrice),
      START_X + COL_ITEM + COL_QTY + COL_PRICE,
      y,
      {
        width: COL_TOTAL,
        align: "right",
        lineBreak: false,
      }
    );

    doc.moveDown(1.2);
  });

  // divider(doc);

  /* =====================
     TOTALS
  ===================== */
  totalRow(doc, "Subtotal", receipt.subtotal);
  totalRow(doc, "Tax", receipt.tax);
  totalRow(doc, "Discount", receipt.discount);

  // divider(doc);

  doc.font("Courier-Bold").text("TOTAL", 10, doc.y, { lineBreak: false });

  doc.text(formatMoney(receipt.totalAmount), 136, doc.y, {
    width: 60,
    align: "right",
    lineBreak: false,
  });

  doc
    .moveDown(0.5)
    .font("Courier")
    .fontSize(8)
    .text("Thank you for your purchase!", center)
    .text("No refund after payment", center);

  doc.end();

  return filePath;
};

function divider(doc) {
  doc.text("----------------------------------------");
}

function row(doc, label, amount, isDiscount = false) {
  const value = isDiscount ? `-${formatMoney(amount)}` : formatMoney(amount);

  doc.text(`${label}:`.padEnd(15) + value.padStart(12));
}

function formatMoney(amount) {
  return `₦${Number(amount).toLocaleString()}`;
}

function totalRow(doc, label, amount) {
  const y = doc.y;

  doc.text(label, 10, y, { lineBreak: false });
  doc.text(formatMoney(amount), 126, y, {
    width: 80,
    align: "right",
    lineBreak: false,
  });

  doc.moveDown(1);
}
