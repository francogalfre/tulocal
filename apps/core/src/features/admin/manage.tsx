"use client";

import { useActionState } from "react";

import { tulocalIcons } from "@/components/icons";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteStore,
  grantPro,
  reactivateStore,
  revokePlan,
  suspendStore,
  updateAdminStore,
} from "@/features/admin/actions";
import type { UpdateAdminStoreState } from "@/features/admin/actions";

const INITIAL_EDIT_STATE: UpdateAdminStoreState = { error: null };

type AdminManageProps = {
  storeId: string;
  name: string;
  description: string;
  isSuspended: boolean;
  isPaid: boolean;
};

export function AdminManage({ storeId, name, description, isSuspended, isPaid }: AdminManageProps) {
  const [editState, editAction, isEditing] = useActionState(updateAdminStore, INITIAL_EDIT_STATE);

  return (
    <div className="flex flex-wrap gap-3">
      <Dialog>
        <DialogTrigger render={<Button variant="outline" size="lg" />}>
          <tulocalIcons.pencil data-icon="inline-start" />
          Editar
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar tienda</DialogTitle>
            <DialogDescription>Cambiá el nombre y la descripción.</DialogDescription>
          </DialogHeader>
          <form action={editAction} className="flex flex-col gap-4">
            <input type="hidden" name="storeId" value={storeId} />
            <Field>
              <FieldLabel htmlFor="name">Nombre</FieldLabel>
              <Input id="name" name="name" defaultValue={name} required />
            </Field>
            <Field>
              <FieldLabel htmlFor="description">Descripción</FieldLabel>
              <Textarea id="description" name="description" rows={4} defaultValue={description} />
            </Field>
            {editState.error !== null ? (
              <p className="text-sm text-destructive">{editState.error}</p>
            ) : null}
            <DialogFooter>
              <Button type="submit" disabled={isEditing}>
                {isEditing ? <Spinner data-icon="inline-start" /> : null}
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {isPaid ? (
        <form action={revokePlan}>
          <input type="hidden" name="storeId" value={storeId} />
          <Button type="submit" variant="outline" size="lg">
            <tulocalIcons.close data-icon="inline-start" />
            Quitar plan
          </Button>
        </form>
      ) : (
        <form action={grantPro}>
          <input type="hidden" name="storeId" value={storeId} />
          <Button type="submit" variant="outline" size="lg">
            <tulocalIcons.star data-icon="inline-start" />
            Dar plan Pro
          </Button>
        </form>
      )}

      {isSuspended ? (
        <form action={reactivateStore}>
          <input type="hidden" name="storeId" value={storeId} />
          <Button type="submit" variant="outline" size="lg">
            <tulocalIcons.check data-icon="inline-start" />
            Reactivar
          </Button>
        </form>
      ) : (
        <form action={suspendStore}>
          <input type="hidden" name="storeId" value={storeId} />
          <Button type="submit" variant="outline" size="lg">
            <tulocalIcons.lock data-icon="inline-start" />
            Suspender
          </Button>
        </form>
      )}

      <AlertDialog>
        <AlertDialogTrigger render={<Button variant="destructive" size="lg" />}>
          <tulocalIcons.trash data-icon="inline-start" />
          Eliminar
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar {name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Se borra la tienda y todos sus productos para siempre. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <form action={deleteStore}>
              <input type="hidden" name="storeId" value={storeId} />
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
