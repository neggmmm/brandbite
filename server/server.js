import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT;
const DB_URI = process.env.DB_URI;
mongoose.connect(DB_URI).then(() => console.log("DB CONNECTED"));
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
