import express from "express";
import { config } from "dotenv";
import morgan from "morgan";
import { Routes } from "./routes/index";
import { errorMiddleware } from "./middlewares/error";
import { authenticateJWT } from "./middlewares/authenticate-jwt";
import { getCorsOptions } from "./utils/helper";
import pool from './utils/db';
import cors from "cors";

config({
  path: "./.env",
});

const port = process.env.PORT;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cors(getCorsOptions()));

app.use(
  authenticateJWT.unless({
    path: [
      { url: "/", methods: ["GET"] },
      { url: "/api/user/register", methods: ["POST"] },
      { url: "/api/user/login", methods: ["POST"] },
      { url: "/api/user/admin-login", methods: ["POST"] },
      { url: "/api/user/verify-email", methods: ["POST"] },
      { url: "/test-db", methods: ["GET"] },
    ],
  })
);

app.get("/", (_req, res) => {
  res.json({ message: "Welcome." });
});

Routes(app);
app.use(errorMiddleware);

// Test database connection
app.get("/test-db", async (_req, res) => {
  try {
    console.log('Attempting to connect to database...');
    const result = await pool.query('SELECT NOW()');
    console.log('Query successful:', result.rows[0]);
    res.json({ 
      success: true, 
      message: "Database connection successful",
      timestamp: result.rows[0].now 
    });
  } catch (error) {
    console.log("database is not running")
    console.error('Database connection error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      code: (error as any).code,
      errno: (error as any).errno,
      syscall: (error as any).syscall,
      hostname: (error as any).hostname
    });
    res.status(500).json({ 
      success: false, 
      message: "Database connection failed",
      error: error instanceof Error ? error.message : 'Unknown error',
      details: {
        code: (error as any).code,
        errno: (error as any).errno,
        syscall: (error as any).syscall,
        hostname: (error as any).hostname
      }
    });
  }
});

app.listen(port, () => {
  console.log(`Express is working on http://localhost:${port}`);
});

export default app;
