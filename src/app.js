import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import http from 'http';
import { Server } from 'socket.io';
const app = express()

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())

// Create an HTTP server
const server = http.createServer(app);

// Set up Socket.io
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Adjust according to your frontend
        methods: ["GET", "POST"],
        credentials: true,
    },
});
// Middleware to attach io to the request object
app.use((req, res, next) => {
    req.io = io;
    next();
});

// routes
import userRouter from './routes/user.routes.js'
import videoRouter from './routes/video.routes.js'
import playlistRouter from "./routes/playlist.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import healthcheckRouter from "./routes/healthcheck.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"

// routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)


app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/dashboard", dashboardRouter)


export { app, server }