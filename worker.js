const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const fs = require("fs");

const connectDB = require("./db");
connectDB();

const { Worker } = require("bullmq");
const paymentQueue = require("./Queues/paymentQueue");
const amountChecker = require("./utils/AmountChecker");
const generateReceiptPDF = require("./utils/receiptGenerator");
const sendEmail = require("./utils/Email");

const Receipt = require("./models/receiptModel");
const uploadReceipt = require("./utils/Cloudinary");
const Order = require("./models/orderModel");

const worker = new Worker(
  "payment-queue",
  async (job) => {
    const {
      id,
      businessId,
      userId,
      customerName,
      customerEmail,
      customerPhone,
      items,
      subtotal,
      tax,
      totalAmount,
      discount,
      paymentMethod,
      orderNumber,
    } = job.data;

    const total = amountChecker(totalAmount);

    const receipt = await Receipt.create({
      orderId: id,
      businessId,
      userId,
      totalAmount: total,
      customerName,
      customerEmail,
      customerPhone,
      items,
      subtotal,
      tax,
      discount,
      paymentMethod,
    });

    try {
      const { receiptNumber } = receipt;
      const pdfPath = await generateReceiptPDF(receipt);

      const { public_id, signature, secure_url } = await uploadReceipt(
        pdfPath,
        receiptNumber
      );

      const result = await sendEmail({
        to: customerEmail,
        receiptNumber,
        receipt,
        pdfPath,
      });

      fs.unlinkSync(pdfPath);
      const isAccepted = result.accepted.length >= 1;
      await Order.findOneAndUpdate(
        { orderNumber },
        {
          cloudPublicId: public_id,
          cloudUrl: secure_url,
          receiptGenerated: true,
          receiptEmailSent: isAccepted,
        }
      );
    } catch (error) {
      console.log(error);
    }
  },
  {
    connection: paymentQueue.opts.connection,
  }
);

worker.on("completed", (job) => {
  console.log(`🎉 Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed`, err);
});
