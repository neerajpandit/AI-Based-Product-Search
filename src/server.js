import app from "./app.js";
import sequelize from "./config/db.js";
import { runSeeders } from "./seeders/seeder.js";
import "./models/index.js";
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

let server;

// Start Server
const startServer = async () => {
  try {
    console.log("🔄 Starting application...");

    // ✅ DB Connect
    await sequelize.authenticate();
    console.log(" Database connected");

    // Sync Models
    // await sequelize.sync({ alter: true });
    await sequelize.sync();
    console.log("Database synced");

    //  Run Seeders (only in dev)
    if (NODE_ENV !== "production") {
      await runSeeders();
    }

    server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} [${NODE_ENV}]`);
    });

    server.on("error", (err) => {
      console.error("❌ Server Error:", err.message);
    });
  } catch (error) {
    console.error("❌ Startup failed:", error.message);
    process.exit(1);
  }
};


const shutdown = async (signal) => {
  console.log(`⚠️ ${signal} received. Shutting down...`);

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) return reject(err);
          console.log("💤 Server closed");
          resolve();
        });
      });
    }

    await sequelize.close();
    console.log("✅ DB connection closed");
  } catch (err) {
    console.error("❌ Shutdown error:", err.message);
  } finally {
    process.exit(0);
  }
};


const FORCE_TIMEOUT = 10000; // 10 sec
const safeShutdown = (signal) => {
  shutdown(signal);

  setTimeout(() => {
    console.error("❌ Force shutdown (timeout)");
    process.exit(1);
  }, FORCE_TIMEOUT);
};


process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  safeShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
  safeShutdown("unhandledRejection");
});

process.on("SIGINT", safeShutdown);
process.on("SIGTERM", safeShutdown);


startServer();
