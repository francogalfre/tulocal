"use client";

import { useMutation } from "@tanstack/react-query";
import { Button } from "@tulocal/ui/components/button";
import { Label } from "@tulocal/ui/components/label";
import { Textarea } from "@tulocal/ui/components/textarea";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ImageDropzone } from "@/components/image-dropzone";
import { resizeImage } from "@/lib/image-resize";
import { getServerUrl } from "@/lib/server-url";
import { trpc } from "@/utils/trpc";

async function uploadFiles(files: File[]) {
  const form = new FormData();
  for (const file of files) form.append("files", await resizeImage(file), file.name);
  const response = await fetch(`${getServerUrl()}/upload`, {
    method: "POST",
    body: form,
    credentials: "include",
  });
  const json = (await response.json()) as { urls?: string[]; error?: string };
  if (!response.ok || !json.urls) throw new Error(json.error ?? "No se pudieron subir las fotos");
  return json.urls;
}

export default function NewProductPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [hint, setHint] = useState("");
  const [stage, setStage] = useState<"idle" | "uploading" | "creating">("idle");

  const create = useMutation(trpc.product.create.mutationOptions());
  const runPipeline = useMutation(trpc.product.runPipeline.mutationOptions());

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (files.length === 0) {
      toast.error("Agregá al menos una foto");
      return;
    }
    try {
      setStage("uploading");
      const originalUrls = await uploadFiles(files);
      setStage("creating");
      const { id } = await create.mutateAsync({ originalUrls, hint: hint || undefined });
      // Fire and forget: the dashboard polls the product row for progress.
      runPipeline.mutate({ id });
      router.push(`/dashboard/products/${id}`);
    } catch (error) {
      setStage("idle");
      toast.error(error instanceof Error ? error.message : "Algo salió mal");
    }
  }

  const busy = stage !== "idle";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/dashboard" />}>
          <ArrowLeft data-icon="inline-start" />
          Volver
        </Button>
      </div>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nuevo producto</h1>
        <p className="text-sm text-muted-foreground">
          Subí las fotos y la IA arma todo: imágenes, título, descripción, estado y precios.
        </p>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <ImageDropzone files={files} onChange={setFiles} disabled={busy} />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="hint">Algo que la IA no pueda ver (opcional)</Label>
          <Textarea
            id="hint"
            value={hint}
            onChange={(event) => setHint(event.target.value)}
            placeholder="Ej: 128 GB, batería al 89%, viene con cargador original."
            rows={2}
            disabled={busy}
            maxLength={300}
          />
        </div>
        <Button type="submit" size="lg" disabled={busy || files.length === 0}>
          {stage === "uploading"
            ? "Subiendo fotos…"
            : stage === "creating"
              ? "Creando producto…"
              : "Generar publicación"}
        </Button>
      </form>
    </div>
  );
}
