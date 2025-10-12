import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const fileType = formData.get("fileType") as string;
    const uploadPath = formData.get("uploadPath") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const allowedExtensions = [
      ".jpg", ".jpeg", ".png", ".webp", ".gif",
      ".mp4", ".mov", ".avi", ".mkv",
      ".pdf", ".xls", ".xlsx", ".csv", ".doc", ".docx", ".txt", ".zip"
    ];

    const fileExtension = path.extname(file.name).toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: `File type ${fileExtension} not allowed` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = `${Date.now()}-${file.name}`;
    const uploadDir = path.join(process.cwd(), "public", uploadPath);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);

    const fileSize = file.size;
    const fileUrl = `${uploadPath}/${fileName}`;
    const altImage = formData.get("alt")?.toString() || null;

    await db.execute(
      `INSERT INTO media (fileName, filePath, fileExtension, fileSize, fileType, altImage, isDeleted, createdDate)
       VALUES (?, ?, ?, ?, ?, ?, 0, NOW())`,
      [fileName, fileUrl, fileExtension, fileSize, fileType, altImage]
    );

    return NextResponse.json({
      success: true,
      message: "File uploaded and saved to database",
      fileName,
      fileType,
      url: fileUrl,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Upload failed", details: String(err) },
      { status: 500 }
    );
  }
}
