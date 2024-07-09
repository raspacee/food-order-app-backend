import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import myUserRoute from "./routes/MyUserRoutes";

mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string).then(() => {
  console.log("Database connected");
});

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.get("/health", (req: Request, res: Response) => {
  return res.send({ message: "Health Ok" });
});

app.use("/api/my/user", myUserRoute);

app.listen(7000, () => {
  console.log("Server started on port 7000");
});
