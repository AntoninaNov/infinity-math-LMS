let io;

module.exports = {
    // Initializes and stores the Socket.IO instance
    init: httpServer => {
        io = require("socket.io")(httpServer, {
            cors: {
                origin: "*", // Adjust this to match the client's origin in production
                methods: ["GET", "POST"],
            },
        });
        return io;
    },
    // Retrieves the Socket.IO instance
    getIO: () => {
        if (!io) {
            throw new Error("Socket.io not initialized!");
        }
        return io;
    },
};

