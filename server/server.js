const http = require("http");
const connectDB = require("./src/config/db");
const app = require("./app"); 
const { initSocket } = require("./src/services/socketService");

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Connect to DB and start server
connectDB()
  .then(() => {
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect DB:", err);
    process.exit(1);
  });
