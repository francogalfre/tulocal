"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@tulocal/ui/components/badge";
import { Button } from "@tulocal/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@tulocal/ui/components/dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@tulocal/ui/components/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tulocal/ui/components/table";
import { MessageCircle } from "lucide-react";
import { useState } from "react";

import { formatARS, formatDate } from "@/lib/format";
import { trpc } from "@/utils/trpc";

const STATUS: Record<
  "open" | "deal" | "closed",
  { label: string; variant: "secondary" | "default" | "outline" }
> = {
  open: { label: "Negociando", variant: "secondary" },
  deal: { label: "Trato cerrado", variant: "default" },
  closed: { label: "Cerrada", variant: "outline" },
};

function Transcript({ id }: { id: string }) {
  const { data } = useQuery(trpc.conversation.get.queryOptions({ id }));
  if (!data) return <p className="text-xs text-muted-foreground">Cargando…</p>;
  return (
    <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto text-sm">
      {data.messages.map((message) => {
        const text = (message.parts as { type: string; text?: string }[])
          .filter((part) => part.type === "text")
          .map((part) => part.text)
          .join("\n");
        if (!text) return null;
        return (
          <div
            key={message.id}
            className={`max-w-[85%] px-3 py-2 whitespace-pre-wrap ${
              message.role === "user"
                ? "self-start bg-muted"
                : "self-end bg-primary text-primary-foreground"
            }`}
          >
            {text}
          </div>
        );
      })}
      {data.status === "deal" && data.whatsappUrl && (
        <Button
          className="self-end"
          nativeButton={false}
          render={<a href={data.whatsappUrl} target="_blank" rel="noreferrer" />}
        >
          <MessageCircle data-icon="inline-start" />
          Ver en WhatsApp
        </Button>
      )}
    </div>
  );
}

export function LeadsList({ productId }: { productId: string }) {
  const { data, isPending } = useQuery(trpc.conversation.listByProduct.queryOptions({ productId }));
  const [open, setOpen] = useState<string | null>(null);

  if (isPending) return <p className="text-sm text-muted-foreground">Cargando…</p>;
  if (!data || data.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Todavía no hay conversaciones</EmptyTitle>
          <EmptyDescription>
            Compartí el link o el QR y los compradores van a aparecer acá.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Estado</TableHead>
            <TableHead>Última oferta</TableHead>
            <TableHead>Acordado</TableHead>
            <TableHead>Último mensaje</TableHead>
            <TableHead>Actualizado</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <Badge variant={STATUS[row.status].variant}>{STATUS[row.status].label}</Badge>
              </TableCell>
              <TableCell>{formatARS(row.lastOffer)}</TableCell>
              <TableCell>{formatARS(row.agreedPrice)}</TableCell>
              <TableCell className="max-w-60 truncate text-muted-foreground">
                {row.lastMessage}
              </TableCell>
              <TableCell className="text-muted-foreground">{formatDate(row.updatedAt)}</TableCell>
              <TableCell>
                <Button size="xs" variant="outline" onClick={() => setOpen(row.id)}>
                  Ver
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={open !== null} onOpenChange={(value) => !value && setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conversación</DialogTitle>
            <DialogDescription>
              Lo que habló el comprador con tu vendedor virtual.
            </DialogDescription>
          </DialogHeader>
          {open && <Transcript id={open} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
