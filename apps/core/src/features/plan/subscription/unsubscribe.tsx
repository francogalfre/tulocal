"use client";

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
import { cancelSubscription } from "@/features/plan/subscription/cancel";

type UnsubscribeProps = {
  planName: string;
};

export function Unsubscribe({ planName }: UnsubscribeProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={<Button size="xl" variant="ghost" className="text-destructive" />}
      >
        Cancelar {planName}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Cancelar {planName}?</AlertDialogTitle>
          <AlertDialogDescription>
            No te cobramos más. Seguís con {planName} hasta el final del mes que ya pagaste y
            después pasás a Gratis. Tus productos quedan publicados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Seguir con {planName}</AlertDialogCancel>
          <form action={cancelSubscription}>
            <AlertDialogAction type="submit" variant="destructive">
              Cancelar
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
