import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

// Get for post list
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    try {
      jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    const [rows] = await pool.query(`
      SELECT id, title, author, createdDate
      FROM posts
      WHERE isDeleted = 0
      ORDER BY createdDate DESC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    try {
      jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    const body = await req.json();
    const { title, content, description, categoryID, thumbnail } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "title and content are required" },
        { status: 400 }
      );
    }

    const [result] = await pool.query(
      `INSERT INTO posts 
        (title, createdDate, author, status, isDeleted, content, description, categoryID, thumbnail)
       VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        "Admin",
        "published",
        0,
        content,
        description || "",
        categoryID || 0,
        thumbnail || "",
      ]
    );

    return NextResponse.json({
      status: "success",
      message: "Post created successfully",
      postId: (result as any).insertId,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: "error", error: "Failed to create post" }, { status: 500 });
  }
}
