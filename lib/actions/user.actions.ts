import { connectToDatabase } from "@/database/mongoose";

export type NewsEmailUser = {
    id: string;
    email: string;
    name: string;
};

export const getAllUserForNewsEmail = async (): Promise<NewsEmailUser[]> => {
    try {
        const mongoose = await connectToDatabase()
        const db = mongoose.connection.db;
        if(!db) throw new Error('MongoDB connection not connected');

        const users = await db.collection<{
            _id?: { toString: () => string };
            id?: string;
            email?: string;
            name?: string;
            country?: string;
        }>('user').find(
            { email: { $exists: true, $type: "string", $ne: "" } },
            { projection: { _id:1, id:1, email:1, name:1 , country:1} })
            .toArray();

            return users.flatMap((user) => {
                if (typeof user.email !== 'string' || user.email.trim() === '') return [];
                if (typeof user.name !== 'string' || user.name.trim() === '') return [];
                return [
                    {
                        id: user.id || user._id?.toString() || '',
                        email: user.email,
                        name: user.name,
                    },
                ];
            });
    } catch (e) {
        console.error('Error fetching users for news email', e);
        return [];
    }
}
