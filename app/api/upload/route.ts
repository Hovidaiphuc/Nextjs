import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

// POST /api/upload — Upload image (base64 → /public/uploads/)
export async function POST(req: Request) {
  try {
    const session = await getServerSession() as any;
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { image } = body; // base64 data URL

    if (!image || typeof image !== "string") {
      return NextResponse.json({ error: "No image data provided" }, { status: 400 });
    }

    // Extract base64 part
    const matches = image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json({ error: "Invalid image format" }, { status: 400 });
    }

    const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
    const base64Data = matches[2];
    const uuid = crypto.randomUUID();
    const filename = `${uuid}.webp`;
    const filepath = `public/uploads/${filename}`;

    // Ensure uploads directory exists
    const fs = await import("fs/promises");
    await fs.mkdir("public/uploads", { recursive: true });

    const buffer = Buffer.from(base64Data, "base64");

    // Compress if > 2MB
    let finalBuffer = buffer;
    if (buffer.length > 2 * 1024 * 1024) {
      // Simple resize: in production use sharp. For now just save as-is
      console.warn("Image > 2MB, saving without compression");
    }

    await fs.writeFile(filepath, finalBuffer);

    const url = `/uploads/${filename}`;
    return NextResponse.json({ url, filename }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
