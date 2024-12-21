import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    // Cấu hình SMTP
    const transporter = nodemailer.createTransport({
      service: "Gmail", // Bạn có thể thay bằng "Outlook", "Yahoo", v.v.
      auth: {
        user: process.env.EMAIL_USER, // Email gửi
        pass: process.env.EMAIL_PASSWORD, // Mật khẩu ứng dụng email (App Password)
      },
    });

    // Nội dung email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to, // Địa chỉ email nhận
      subject, // Tiêu đề email
      text, // Nội dung dạng văn bản
      html, // Nội dung dạng HTML
    };

    // Gửi email
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
