"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@tulocal/ui/components/button";
import { Skeleton } from "@tulocal/ui/components/skeleton";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { use } from "react";

import { PipelineProgress } from "@/components/pipeline-progress";
import { ProductEditor } from "@/components/product-editor";
import { trpc } from "@/utils/trpc";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const query = useQuery({
    ...trpc.product.get.queryOptions({ id }),
    refetchInterval: (q) => (q.state.data?.status === "processing" ? 2000 : false),
  });
  const retry = useMutation(
    trpc.product.runPipeline.mutationOptions({
      onSettled: () =>
        queryClient.invalidateQueries({ queryKey: trpc.product.get.queryKey({ id }) }),
    }),
  );

  const product = query.data;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/dashboard" />}>
          <ArrowLeft data-icon="inline-start" />
          Mis productos
        </Button>
      </div>
      {!product ? (
        <Skeleton className="h-64 w-full" />
      ) : product.status === "ready" ? (
        <ProductEditor key={product.updatedAt.toString()} product={product} />
      ) : (
        <PipelineProgress
          status={product.status}
          stage={product.pipelineStage}
          steps={product.pipelineSteps}
          error={product.pipelineError}
          title={product.title}
          images={product.images}
          onRetry={() => retry.mutate({ id })}
          retrying={retry.isPending}
        />
      )}
    </div>
  );
}
