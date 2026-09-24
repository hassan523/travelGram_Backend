import express from "express";
import User from "./routes/User.js";
import Subscriptions from "./routes/Subscriptions.js";
import Realtime from "./routes/Realtime.js";
import Locations from "./routes/Locations.js";
// import Activity from "./routes/Activity.js";
import cors from "cors";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import fileUpload from "express-fileupload";
// DB Connection
import connectMongoDB from "./utils/ConnectDB.js";
import Stripe from "./routes/Stripe.js";
import Activity from "./routes/Activity.js";
import Connections from "./routes/Connections.js";
import Chat from "./routes/Chat.js";
import GlobalRoutes from "./routes/GlobalRoutes.js";
import ChatSocket from "./utils/ChatSocket.js";

// Socket Connection
import { Server } from "socket.io";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
   pingTimeout: 60000,
   cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      credentials: true,
   },
});

dotenv.config();
app.use(express.json());
app.use(
   cors({
      origin: "*",
      credentials: true,
      methods: ["POST", "GET", "PATCH", "DELETE"],
   }),
);

connectMongoDB();
cloudinary.config({
   cloud_name: process.env.CLOUDINARY_Cloud,
   api_secret: process.env.CLOUDINARY_API_SECRET,
   api_key: process.env.CLOUDINARY_API_KEY,
});

app.use(
   fileUpload({
      useTempFiles: true,
      tempFileDir: "/tmp/",
   }),
);

app.use("/api", User);
app.use("/subscribe", Subscriptions);
app.use("/stripe", Stripe);
app.use("/realtime", Realtime);
app.use("/locations", Locations);
app.use("/activity", Activity);
app.use("/connection", Connections);
app.use("/chat", Chat);
app.use("/global", GlobalRoutes);

// Socket
ChatSocket(io);

app.get("/", (req, res) => {
   try {
      res.status(200).json({ heath: "Ok" });
   } catch (error) {
      console.log(error);
   }
});

httpServer.listen(process.env.PORT, () => {
   console.log(`APP Listening To ${process.env.PORT}`);
});
