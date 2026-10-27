import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EmailService {
  #transporter = null;

  #getTransporter() {
    if (!this.#transporter) {
      const host = process.env.SMTP_HOST;
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASS;

      if (host && user && pass) {
        this.#transporter = nodemailer.createTransport({
          host,
          port: parseInt(process.env.SMTP_PORT || "587", 10),
          secure: process.env.SMTP_SECURE === "true",
          auth: {
            user,
            pass,
          },
        });
      }
    }
    return this.#transporter;
  }

  async sendOtpEmail({ to, name = "Valued Customer", otp, purpose }) {
    const subject =
      purpose === "EMAIL_VERIFICATION"
        ? "Verify Your Email Address — House of Hackney"
        : "Reset Your Password — House of Hackney";

    const textContent = `Hello ${name}, your security verification code for House of Hackney is: ${otp}. This code expires in 10 minutes.`;

    let htmlContent;
    try {
      const templatePath = path.resolve(__dirname, "../../../templates/email/otp.ejs");
      htmlContent = await ejs.renderFile(templatePath, {
        subject,
        appName: "House of Hackney",
        name,
        otp,
        expiryMinutes: 10,
        year: new Date().getFullYear(),
      });
    } catch (err) {
      console.warn("⚠️ Failed to render EJS OTP template, falling back to inline HTML:", err.message);
      htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 30px; background: #f5f5f5;">
          <div style="max-width: 600px; background: #fff; margin: 0 auto; padding: 30px; border-radius: 12px;">
            <h2>House of Hackney Verification Code</h2>
            <p>Hello <strong>${name}</strong>,</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; padding: 20px; background: #eee; text-align: center;">${otp}</div>
            <p>Expires in 10 minutes.</p>
          </div>
        </div>
      `;
    }

    console.log(`\n==================================================\n🔐 EMAIL DISPATCH (${purpose})\nTo: ${to}\nOTP Code: ${otp}\n==================================================\n`);

    const transporter = this.#getTransporter();

    if (transporter) {
      try {
        const fromAddress = process.env.EMAIL_FROM || `House of Hackney <${process.env.SMTP_USER}>`;
        const info = await transporter.sendMail({
          from: fromAddress,
          to,
          subject,
          text: textContent,
          html: htmlContent,
        });
        console.log("✅ EJS OTP Email successfully delivered via Gmail SMTP! Message ID:", info.messageId);
        return true;
      } catch (error) {
        console.error("❌ Failed to send email via SMTP:", error.message);
        return false;
      }
    }

    return true;
  }

  async sendWelcomeEmail({ to, name = "Customer" }) {
    const subject = "Welcome to House of Hackney";
    let htmlContent;

    try {
      const templatePath = path.resolve(__dirname, "../../../templates/email/welcome.ejs");
      htmlContent = await ejs.renderFile(templatePath, {
        appName: "House of Hackney",
        name,
        websiteUrl: process.env.WEBSITE_URL || "https://houseofhackney.com",
        year: new Date().getFullYear(),
      });
    } catch (err) {
      console.warn("⚠️ Failed to render EJS Welcome template:", err.message);
      return false;
    }

    const transporter = this.#getTransporter();
    if (transporter) {
      try {
        const fromAddress = process.env.EMAIL_FROM || `House of Hackney <${process.env.SMTP_USER}>`;
        await transporter.sendMail({
          from: fromAddress,
          to,
          subject,
          html: htmlContent,
        });
        console.log("✅ EJS Welcome Email sent successfully!");
        return true;
      } catch (error) {
        console.error("❌ Failed to send welcome email:", error.message);
        return false;
      }
    }
    return true;
  }

  async sendOrderConfirmationEmail({ to, name, order }) {
    if (!to) {
      console.warn("⚠️ Cannot send order confirmation email: recipient email missing.");
      return { success: false, error: "Recipient email is required" };
    }

    const orderNum = order?.orderNumber || "Commission";
    const recipientName = name || order?.shippingAddress?.fullName || order?.user?.name || "Valued Patron";
    const subject = `Order Confirmation — ${orderNum} | House of Hackney`;

    let htmlContent;
    try {
      const templatePath = path.resolve(__dirname, "../../../templates/email/order-confirmation.ejs");
      htmlContent = await ejs.renderFile(templatePath, {
        appName: "House of Hackney",
        name: recipientName,
        order: order || {},
        year: new Date().getFullYear(),
      });
    } catch (err) {
      console.warn("⚠️ Failed to render EJS Order Confirmation template:", err.message);
      // Fallback clean luxury HTML
      const curr = (order?.currency === "INR" || !order?.currency) ? "₹" : "£";
      const totalVal = order?.grandTotal || order?.totalAmount || order?.total || 0;
      htmlContent = `
        <div style="font-family: Georgia, serif; padding: 40px; background: #f7f5f0; color: #171713;">
          <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 35px; border-radius: 12px; border: 1px solid #e0d9cd;">
            <div style="text-align: center; border-bottom: 2px solid #c5a968; padding-bottom: 20px; margin-bottom: 24px;">
              <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px;">HOUSE OF HACKNEY</h1>
              <p style="margin: 4px 0 0; color: #888; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase;">LONDON</p>
            </div>
            <h2 style="font-size: 20px; font-weight: normal; margin-bottom: 10px;">Commission Confirmed</h2>
            <p>Dear ${recipientName},</p>
            <p>Thank you for your patronage. Your order <strong>${orderNum}</strong> has been registered with our English atelier.</p>
            <p><strong>Total Paid:</strong> ${curr}${Number(totalVal).toLocaleString("en-IN")}</p>
            <p>Payment Method: ${order?.paymentMethod || "Razorpay"}</p>
            <p style="margin-top: 30px; font-size: 12px; color: #777;">House of Hackney &bull; Certified B-Corporation</p>
          </div>
        </div>
      `;
    }

    const textContent = `Dear ${recipientName},\n\nThank you for your commission with House of Hackney.\nOrder Reference: ${orderNum}\nTotal Paid: ${order?.grandTotal || order?.totalAmount || order?.total || 0} ${order?.currency || "INR"}\nStatus: Confirmed\n\nHouse of Hackney, London.`;

    const transporter = this.#getTransporter();
    if (transporter) {
      try {
        const fromAddress = process.env.EMAIL_FROM || `House of Hackney <${process.env.SMTP_USER}>`;
        const info = await transporter.sendMail({
          from: fromAddress,
          to,
          subject,
          text: textContent,
          html: htmlContent,
        });
        console.log(`✅ Order confirmation email successfully delivered to ${to}! Message ID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
      } catch (error) {
        console.error("❌ Failed to send order confirmation email via SMTP:", error.message);
        return { success: false, error: error.message };
      }
    } else {
      console.warn("⚠️ SMTP Transporter is not configured. Email logged to console.");
      return { success: false, error: "SMTP transporter not configured" };
    }
  }
}

export default new EmailService();

