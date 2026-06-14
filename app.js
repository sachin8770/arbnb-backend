import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import mongoose from "mongoose";
import MongoStore from "connect-mongo";
import cors from "cors";
import cookieParser from "cookie-parser";
import * as controller from "./controllers/errorcontroller.js";
import storeRouter from "./routes/storeRouter.js";
import { hostRouter } from "./routes/hostRouter.js";
import { authrouter } from "./routes/auth.js";
import rootDir from "./utils/pathUtil.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();


const app = express();





app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://deplotfrontarbnb-nm9y.vercel.app"
  ],
  credentials: true
}));

// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));




app.set("view engine", "ejs");
app.set("views", "views");

// Routes
app.use("/", storeRouter);
app.use("/host", hostRouter);
app.use("/auth", authrouter);

// 404 route
app.use(controller._404controller);

app.use((err, req, res, next) => {
  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message,
    errors: err.errors || [],
  });
});


(async () => {
  try {
    console.log("DB_PATH:", process.env.DB_PATH);

    await mongoose.connect(process.env.DB_PATH);

    console.log("Connected to Mongo");

    const PORT = process.env.PORT;
    
    console.log(PORT);

    app.listen(PORT, () => {
      console.log(`Server running on address http://localhost:${PORT}`);
    });
  } catch (err) {
    console.log("Error while connecting to Mongo:", err);
  }
})();