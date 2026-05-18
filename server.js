/**
 * production server entrypoint
 * This file serves as the main entrypoint for production deployments (e.g. Heroku, Render, Glitch)
 * that expect a root-level "server.js" to start the Express application.
 */

// Load the production compiled ES module bundle
import('./dist/server.js').catch((error) => {
  console.error("Error launching server:", error);
  process.exit(1);
});

