import { put } from "@vercel/blob";
import { Hono } from "hono";

import { auth } from "../services";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
const MAX_BYTES = 15 * 1024 * 1024;

/**
 * Multipart upload of original product photos. Goes through our server (not a
 * client token) so the session cookie works cross-origin in local dev.
 */
export const uploadRoute = new Hono().post("/", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "No autorizado" }, 401);

  const form = await c.req.formData();
  const files = form.getAll("files").filter((entry): entry is File => entry instanceof File);
  if (files.length === 0) return c.json({ error: "No llegaron archivos" }, 400);
  if (files.length > 8) return c.json({ error: "Máximo 8 fotos" }, 400);

  const urls: string[] = [];
  try {
    for (const file of files) {
      if (!ALLOWED.has(file.type))
        return c.json({ error: `Formato no soportado: ${file.type}` }, 400);
      if (file.size > MAX_BYTES) return c.json({ error: `${file.name} supera los 15 MB` }, 400);
      const extension = file.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
      const blob = await put(
        `uploads/${session.user.id}/${crypto.randomUUID()}.${extension}`,
        file,
        {
          access: "public",
          contentType: file.type,
        },
      );
      urls.push(blob.url);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error subiendo las fotos";
    return c.json(
      {
        error: message.includes("BLOB_READ_WRITE_TOKEN")
          ? "Falta configurar el almacenamiento de imágenes (BLOB_READ_WRITE_TOKEN)"
          : message,
      },
      500,
    );
  }
  return c.json({ urls });
});
