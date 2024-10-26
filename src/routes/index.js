import UserRouter from "./UserRouter.js";
import ProductRouter from "./ProductRouter.js";
import CartRouter from "./CartRouter.js";
import OrderRouter from "./OrderRouter.js";

const routes = (app) => {
  app.use("/api/user", UserRouter);
  app.use("/api/product", ProductRouter);
  app.use("/api/cart", CartRouter);
  app.use("/api/order", OrderRouter);
};

export default routes;
