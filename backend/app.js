const express = require("express");
const dotenv = require("dotenv").config();
const mongoose = require("mongoose");
const errorHandler = require("./middleware/errorMiddleware");
const keyRoutes = require("./routes/keyRoutes");
const postRoutes = require("./routes/postRoutes");
const userRoutes = require("./routes/userRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const commentRoutes = require("./routes/commentRoutes");
const projectRoutes = require("./routes/projectRoutes");

function createApp() {
  const app = express();

  if (process.env.NODE_ENV !== "test") {
    mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/api/keys", keyRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/posts", postRoutes);
  app.use("/api/bookings", bookingRoutes);
  app.use("/api/comments", commentRoutes);
  app.use("/api/projects", projectRoutes);

  app.use(errorHandler);

  return app;
}

module.exports = createApp;
