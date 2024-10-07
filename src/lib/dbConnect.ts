import mongoose from "mongoose";

type ConnctionObject = {
    isConnceted?: number;
}

const connection: ConnctionObject = {};

export default async function dbConnect(): Promise<void> {
    // Check if we have a connection to the database or if it's currently connecting
    if (connection.isConnceted) {
        console.log('Database is already connected');
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || "", {});

        connection.isConnceted = db.connections[0].readyState;

        console.log('Database connected successfully');

    } catch (error) {
        console.error('Database connection failed:', error);

        // Graceful exit in case of a connection error
        process.exit(1);
    }
}