"use server";

import { connectToDatabase } from "@/database/mongoose";
import Watchlist from "@/database/models/watchlist.model";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";

type UserRecord = { _id?: unknown; id?: string; email?: string };

const getUserIdByEmail = async (email: string): Promise<string | null> => {
  const mongoose = await connectToDatabase();
  const db = mongoose.connection.db;
  if (!db) throw new Error("MongoDB connection not found");

  // Better Auth stores users in the "user" collection
  const user = await db.collection("user").findOne<UserRecord>({ email });
  if (!user) return null;

  return (user.id as string) || String(user._id || "") || null;
};

export async function getWatchlistSymbolsByEmail(email: string): Promise<string[]> {
  if (!email) return [];

  try {
    const userId = await getUserIdByEmail(email);
    if (!userId) return [];

    const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();
    return items.map((i) => String(i.symbol));
  } catch (err) {
    console.error('getWatchlistSymbolsByEmail error:', err);
    return [];
  }
}

export async function getWatchlistByEmail(email: string) {
  if (!email) return [];

  try {
    const userId = await getUserIdByEmail(email);
    if (!userId) return [];

    const items = await Watchlist.find({ userId })
      .select({ symbol: 1, company: 1, addedAt: 1 })
      .sort({ addedAt: -1 })
      .lean();

    return items.map((item) => ({
      symbol: String(item.symbol),
      company: String(item.company),
      addedAt: item.addedAt as Date,
    }));
  } catch (err) {
    console.error("getWatchlistByEmail error:", err);
    return [];
  }
}

export async function addToWatchlist(params: {
  symbol: string;
  company: string;
}) {
  const { symbol, company } = params;
  const session = await auth.api.getSession({ headers: await headers() });
  const email = session?.user?.email ?? "";
  if (!email) return { success: false, error: "Missing user session." };
  if (!symbol) return { success: false, error: "Missing symbol." };

  try {
    const userId = await getUserIdByEmail(email);
    if (!userId) return { success: false, error: "User not found." };

    await Watchlist.findOneAndUpdate(
      { userId, symbol: symbol.toUpperCase() },
      {
        $set: { company: company.trim() || symbol.toUpperCase() },
        $setOnInsert: { addedAt: new Date() },
      },
      { upsert: true }
    );

    return { success: true };
  } catch (err) {
    console.error("addToWatchlist error:", err);
    return { success: false, error: "Failed to add to watchlist." };
  }
}
