import { z } from "zod";

const TITLE_MAX_LENGTH = 80;

const DESCRIPTION_MAX_LENGTH = 4000;

export const productDetailsSchema = z.object({
  productId: z.uuid(),
  title: z.string().trim().min(1).max(TITLE_MAX_LENGTH),
  description: z.string().trim().min(1).max(DESCRIPTION_MAX_LENGTH),
  listPriceInArs: z.coerce.number().int().positive(),
  floorPriceInArs: z.coerce.number().int().positive(),
});

export type ProductDetails = z.infer<typeof productDetailsSchema>;

export const PRODUCT_DETAILS_ERROR = "Revisá el título, la descripción, el precio y el mínimo.";

export const FLOOR_ABOVE_LIST_ERROR = "El precio mínimo no puede ser mayor que el precio de venta.";

export function readProductDetails(formData: FormData): ProductDetails | null {
  const parsed = productDetailsSchema.safeParse({
    productId: formData.get("productId"),
    title: formData.get("title"),
    description: formData.get("description"),
    listPriceInArs: formData.get("listPriceInArs"),
    floorPriceInArs: formData.get("floorPriceInArs"),
  });

  if (!parsed.success || parsed.data.floorPriceInArs > parsed.data.listPriceInArs) {
    return null;
  }

  return parsed.data;
}
