import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as string) || "general";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Aucun fichier reçu." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Définition du dossier de destination local
    const subfolder =
      type === "video"
        ? "videos"
        : type === "syllabus"
        ? "syllabus"
        : type === "submission" || type === "tp"
        ? "submissions"
        : "documents";
    const uploadDir = path.join(process.cwd(), "public", "uploads", subfolder);

    // Création automatique du dossier s'il n'existe pas
    await mkdir(uploadDir, { recursive: true });

    // Nettoyage du nom de fichier pour éviter les caractères problématiques
    const cleanName = file.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9.-]/g, "_");

    const uniqueFileName = `${Date.now()}_${cleanName}`;
    const destinationPath = path.join(uploadDir, uniqueFileName);

    // Écriture du fichier sur le disque local
    await writeFile(destinationPath, buffer);

    const publicUrl = `/uploads/${subfolder}/${uniqueFileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    });
  } catch (error: any) {
    console.error("Erreur d'upload local:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Échec du téléversement local du fichier.",
      },
      { status: 500 }
    );
  }
}
