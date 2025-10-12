import { NextResponse } from "next/server";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET);

    const [rows] = await pool.query(
      `
      SELECT DISTINCT fileType
      FROM media
      WHERE isDeleted = 0
      ORDER BY createdDate DESC
      `
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET /api/media error:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}