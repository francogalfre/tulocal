"use client";

import { CircleCheck, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { removeProduct } from "@/features/product/remove";
import { markProductSold } from "@/features/product/sell";

type ProductActionsProps = {
  productId: string;
  isSold: boolean;
};

export function ProductActions({ productId, isSold }: ProductActionsProps) {
  return (
    <div className="flex flex-col gap-3">
      <Button
        size="xl"
        variant="outline"
        render={<Link href={`/product/${productId}/edit`} />}
        nativeButton={false}
      >
        <Pencil data-icon="inline-start" />
        Editar publicación
      </Button>
      {isSold ? null : (
        <form action={markProductSold}>
          <input type="hidden" name="productId" value={productId} />
          <Button type="submit" size="xl" variant="outline" className="w-full">
            <CircleCheck data-icon="inline-start" />
            Marcar como vendido
          </Button>
        </form>
      )}
      <AlertDialog>
        <AlertDialogTrigger
          render={<Button size="xl" variant="ghost" className="text-destructive" />}
        >
          <Trash2 data-icon="inline-start" />
          Eliminar
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta publicación?</AlertDialogTitle>
            <AlertDialogDescription>
              Desaparece de tu tienda y no se puede recuperar. Las conversaciones con compradores
              también se borran.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <form action={removeProduct}>
              <input type="hidden" name="productId" value={productId} />
              <AlertDialogAction type="submit" variant="destructive">
                Eliminar
              </AlertDialogAction>
            </form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
