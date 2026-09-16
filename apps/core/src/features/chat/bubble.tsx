import { cn } from "@/lib/utils";

type BubbleProps = {
  role: "user" | "assistant";
  text: string;
};

export function Bubble({ role, text }: BubbleProps) {
  const isBuyer = role === "user";

  return (
    <div
      className={cn(
        "max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed whitespace-pre-line",
        isBuyer
          ? "self-end rounded-br-md border border-border bg-background"
          : "self-start rounded-bl-md bg-secondary text-secondary-foreground",
      )}
    >
      {text}
    </div>
  );
}
