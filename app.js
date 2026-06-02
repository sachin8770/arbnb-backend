const path = require("path");
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo").default;
const cors = require("cors");
const cookieParser = require("cookie-parser");
const controller = require("./controllers/errorcontroller");
const storeRouter = require("./routes/storeRouter");
const { hostRouter } = require("./routes/hostRouter");
const { authrouter } = require("./routes/auth");
const rootDir = require("./utils/pathUtil");

const DB_PATH =
  "mongodb+srv://root:sachin123@completecoding.phc1b3b.mongodb.net/airbnb?appName=completecoding";

const app = express();
const PORT = 3000;

// CORS setup
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

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
    await mongoose.connect(DB_PATH);
    console.log("Connected to Mongo");

    app.listen(PORT, () => {
      console.log(`Server running on address http://localhost:${PORT}`);
    });
  } catch (err) {
    console.log("Error while connecting to Mongo:", err);
  }
})();