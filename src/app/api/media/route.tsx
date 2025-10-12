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
      SELECT id, fileName AS title, filePath AS url, fileExtension, fileSize, fileType, altImage, createdDate
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

export async function DELETE(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET);

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing media ID" }, { status: 400 });
    }

    await pool.query(
      `
      UPDATE media
      SET isDeleted = 1
      WHERE id = ?
      `,
      [id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/media error:", error);
    return NextResponse.json(
      { error: "Failed to delete media" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET);

    const { id, altImage } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing media ID" }, { status: 400 });
    }

    await pool.query(
      `
      UPDATE media
      SET altImage = ?
      WHERE id = ?
      `,
      [altImage || "", id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/media error:", error);
    return NextResponse.json(
      { error: "Failed to update alt text" },
      { status: 500 }
    );
  }
}
