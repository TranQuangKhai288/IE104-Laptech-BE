import express from "express";
import http from "http";
import dotenv from "dotenv";
import mongoose from "mongoose";
import routes from "./routes/index.js";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
// import Product from "./models/product.js"; // Đảm bảo import đúng file model của bạn

dotenv.config();

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5001;

// Middleware setup
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));
app.use(bodyParser.json());
app.use(cookieParser());

// Setup routes
routes(app);

// Connect to MongoDB
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGO_DB)
  .then(() => {
    console.log("Connected to MongoDB successfully!");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// async function updateProducts() {
//   try {
//     // Cập nhật tất cả sản phẩm hiện tại theo schema mới
//     const result = await Product.updateMany(
//       {}, // Điều kiện tìm kiếm (ở đây là tìm tất cả sản phẩm)
//       {
//         $set: {
//           sale_percentage: 0, // Gán giá trị mặc định nếu trường này chưa có
//           isFeatured: false, // Gán giá trị mặc định nếu trường này chưa có
//         },
//       }
//     );

//     console.log(`Đã cập nhật ${result.modifiedCount} sản phẩm.`);
//   } catch (error) {
//     console.error("Lỗi khi cập nhật sản phẩm:", error);
//   }
// }

// // Gọi hàm cập nhật
// updateProducts();

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
