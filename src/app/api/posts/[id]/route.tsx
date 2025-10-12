import { NextResponse } from "next/server";
import db from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

// GET: Edit Post
export async function GET(req: Request, context: { params: { id: string } }) {
  const params = await context.params;
  const id = params.id;

  try {
    const [rows] = await db.query("SELECT * FROM posts WHERE id = ?", [id]);
    if (Array.isArray(rows) && rows.length > 0) {
      return NextResponse.json(rows[0]);
    } else {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// PUT: Edit Post
export async function PUT(req: Request, context: { params: { id: string } }) {
  const params = await context.params;
  const id = params.id;

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    try {
      jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, content, categoryID, thumbnail, status } = body;

    await db.query(
      `UPDATE posts 
       SET title=?, description=?, content=?, categoryID=?, thumbnail=?, status=? 
       WHERE id=?`,
      [title, description, content, categoryID, thumbnail, status, id]
    );

    return NextResponse.json({ message: "Post updated successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error updating post" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    try {
      jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    const postId = params.id;

    const [result] = await db.query(
      `UPDATE posts SET isDeleted = 1 WHERE id = ?`,
      [postId]
    );

    return NextResponse.json({ status: "success", message: "Post deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
