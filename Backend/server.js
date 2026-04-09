import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkMiddleware } from '@clerk/express'
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js"; // Cleaned up double import

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

// FIX: Changed 'router' to 'app' and added missing closing parenthesis
app.use("/api/inngest", serve({ 
    client: inngest, 
    functions: functions 
}));

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});