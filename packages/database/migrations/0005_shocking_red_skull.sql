CREATE TYPE "public"."product_category" AS ENUM('celulares', 'computacion', 'audio', 'tv_video', 'fotografia', 'videojuegos', 'electrodomesticos', 'cocina', 'muebles', 'decoracion', 'iluminacion', 'jardin', 'herramientas', 'deportes', 'bicicletas', 'ropa', 'calzado', 'accesorios', 'belleza', 'bebes', 'juguetes', 'libros', 'instrumentos', 'vehiculos', 'mascotas', 'otros');--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "condition" SET DATA TYPE text;--> statement-breakpoint
UPDATE "products" SET "condition" = 'good' WHERE "condition" = 'used';--> statement-breakpoint
DROP TYPE "public"."product_condition";--> statement-breakpoint
CREATE TYPE "public"."product_condition" AS ENUM('new', 'like_new', 'good', 'worn');--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "condition" SET DATA TYPE "public"."product_condition" USING "condition"::"public"."product_condition";--> statement-breakpoint
UPDATE "products" SET "category" = NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "category" SET DATA TYPE "public"."product_category" USING "category"::"public"."product_category";--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "brand" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "model" text;