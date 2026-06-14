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

const rootDir = process.cwd();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();


const app = express();





const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map(o => o.trim())
  : [
      "http://localhost:5173",
      "https://deplotfrontarbnb-nm9y.vercel.app",
      "https://arbnb-frontend-dx3hye958-sachinpatel-s-projects.vercel.app"
    ];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes("*")) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
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

    const PORT = process.env.PORT || 3000;

    console.log(`Starting server on port ${PORT}...`);

    app.listen(PORT, () => {
      console.log(`Server running on address http://localhost:${PORT}`);
    });
  } catch (err) {
    console.log("Error while connecting to Mongo:", err);
  }
})();