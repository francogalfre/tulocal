import { tool } from "ai";
import { z } from "zod";

export const shownPhotosOutputSchema = z.object({
  photoUrls: z.array(z.string()),
});

export const showPhotos = tool({
  description:
    "Muestra fotos del producto dentro del chat. Usala cuando el comprador pida ver fotos, detalles o el estado, o cuando mostrar la imagen ayude a tu respuesta. source 'real' son las fotos originales que sacó el dueño, las mejores para mostrar marcas de uso y detalles; 'listing' son las fotos de la publicación. No describas lo que se ve sin haber usado inspectPhotos.",
  inputSchema: z.object({
    source: z
      .enum(["real", "listing"])
      .describe("'real' para detalles y estado, 'listing' para una vista general."),
  }),
  contextSchema: z.object({
    realPhotoUrls: z.array(z.url()),
    listingPhotoUrls: z.array(z.url()),
  }),
  execute: async ({ source }, { context }) => {
    const photoUrls = source === "real" ? context.realPhotoUrls : context.listingPhotoUrls;

    return { photoUrls };
  },
});
