import dotenv from 'dotenv';
// Load .env (fallback to .env.local if you prefer)
dotenv.config();

import mongoose from 'mongoose';

async function run() {
    try {
        console.log('Attempting to connect to the database...');
        console.log('MONGODB_URI present:', Boolean(process.env.MONGODB_URI));
        // Connect directly using mongoose to avoid TS import-extension issues
        if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI not set');
        await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
        console.log('✅ Database connection successful');
        // close connection
        try {
            await mongoose.disconnect();
            console.log('Disconnected from database');
        } catch (e) {
            console.warn('Could not disconnect cleanly:', e);
        }
        process.exit(0);
    } catch (err) {
        console.error('❌ Database connection failed');
        console.error(err);
        process.exit(1);
    }
}

run();
