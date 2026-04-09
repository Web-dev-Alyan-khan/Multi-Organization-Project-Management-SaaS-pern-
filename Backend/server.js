import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkMiddleware } from '@clerk/express'
import { serve } from "inngest/express";
import { inngest } from "./inngest/index.js";
import { functions } from "./inngest/index.js";

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// Basic Health Check Route
app.get('/', (req, res) => {
    res.send('API is running successfully!');
});

// The Inngest serve endpoint
router.use("/api/inngest",serve({client: inngest,functions: functions,})
);

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});