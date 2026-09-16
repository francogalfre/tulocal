import { z } from "zod";

import { productCategory, productCondition } from "@tulocal/database/schema/products";

const TITLE_MAX_LENGTH = 80;

const DESCRIPTION_MAX_LENGTH = 4000;

const LABEL_MAX_LENGTH = 80;

const optionalLabelSchema = z
  .string()
  .trim()
  .max(LABEL_MAX_LENGTH)
  .transform((label) => (label === "" ? null : label));

export const productDetailsSchema = z.object({
  productId: z.uuid(),
  title: z.string().trim().min(1).max(TITLE_MAX_LENGTH),
  description: z.string().trim().min(1).max(DESCRIPTION_MAX_LENGTH),
  category: z.enum(productCategory.enumValues),
  condition: z.enum(productCondition.enumValues),
  brand: optionalLabelSchema,
  model: optionalLabelSchema,
  listPriceInArs: z.coerce.number().int().positive(),
  floorPriceInArs: z.coerce.number().int().positive(),
});

export type ProductDetails = z.infer<typeof productDetailsSchema>;

export const PRODUCT_DETAILS_ERROR =
  "Revisá el título, la descripción, la categoría, el estado, el precio y el mínimo.";

export const FLOOR_ABOVE_LIST_ERROR = "El precio mínimo no puede ser mayor que el precio de venta.";

export function readProductDetails(formData: FormData): ProductDetails | null {
  const parsed = productDetailsSchema.safeParse({
    productId: formData.get("productId"),
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    condition: formData.get("condition"),
    brand: formData.get("brand"),
    model: formData.get("model"),
    listPriceInArs: formData.get("listPriceInArs"),
    floorPriceInArs: formData.get("floorPriceInArs"),
  });

  if (!parsed.success || parsed.data.floorPriceInArs > parsed.data.listPriceInArs) {
    return null;
  }

  return parsed.data;
}
