"use client";

import { Camera } from "lucide-react";
import { useState } from "react";
import type { ChangeEvent } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type StoreImagesFieldsProps = {
  name: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
};

function readPreviewUrl(event: ChangeEvent<HTMLInputElement>): string | null {
  const file = event.target.files?.[0];

  if (file === undefined) {
    return null;
  }

  return URL.createObjectURL(file);
}

export function StoreImagesFields({ name, avatarUrl, bannerUrl }: StoreImagesFieldsProps) {
  const [bannerPreview, setBannerPreview] = useState(bannerUrl);
  const [avatarPreview, setAvatarPreview] = useState(avatarUrl);

  return (
    <div className="flex flex-col">
      <label
        htmlFor="banner"
        className="group relative flex aspect-[3/1] cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-secondary text-sm font-medium transition-colors hover:bg-muted focus-within:ring-3 focus-within:ring-ring/50"
      >
        {bannerPreview !== null ? (
          <img src={bannerPreview} alt="" className="absolute inset-0 size-full object-cover" />
        ) : null}
        <span className="relative inline-flex items-center gap-2 rounded-full border border-input bg-background/90 px-4 py-2 text-sm font-medium backdrop-blur transition-colors group-hover:bg-background">
          <Camera className="size-4" aria-hidden="true" />
          {bannerPreview === null ? "Agregar portada" : "Cambiar portada"}
        </span>
        <input
          id="banner"
          name="banner"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => setBannerPreview(readPreviewUrl(event) ?? bannerPreview)}
        />
      </label>
      <label
        htmlFor="avatar"
        className="group -mt-10 ml-4 w-fit cursor-pointer rounded-full focus-within:ring-3 focus-within:ring-ring/50"
      >
        <Avatar className="size-20 border-4 border-background">
          {avatarPreview !== null ? <AvatarImage src={avatarPreview} alt="" /> : null}
          <AvatarFallback className="bg-brand-deep font-heading text-2xl font-semibold text-white">
            {name.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="sr-only">Cambiar foto de perfil</span>
        <input
          id="avatar"
          name="avatar"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => setAvatarPreview(readPreviewUrl(event) ?? avatarPreview)}
        />
      </label>
      <p className="px-4 pt-2 text-sm text-muted-foreground">
        Tocá la portada o la foto para cambiarlas.
      </p>
    </div>
  );
}
