import type { products } from "@tulocal/database/schema/products";

export type ProductCategory = NonNullable<(typeof products.$inferSelect)["category"]>;

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  celulares: "Celulares",
  computacion: "Computación",
  audio: "Audio",
  tv_video: "TV y video",
  fotografia: "Fotografía",
  videojuegos: "Videojuegos",
  electrodomesticos: "Electrodomésticos",
  cocina: "Cocina",
  muebles: "Muebles",
  decoracion: "Decoración",
  iluminacion: "Iluminación",
  jardin: "Jardín",
  herramientas: "Herramientas",
  deportes: "Deportes",
  bicicletas: "Bicicletas",
  ropa: "Ropa",
  calzado: "Calzado",
  accesorios: "Accesorios",
  belleza: "Belleza",
  bebes: "Bebés",
  juguetes: "Juguetes",
  libros: "Libros",
  instrumentos: "Instrumentos musicales",
  vehiculos: "Vehículos y repuestos",
  mascotas: "Mascotas",
  otros: "Otros",
};
