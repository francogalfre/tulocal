import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cn } from "@tulocal/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg border border-transparent bg-clip-padding font-medium whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-[color-mix(in_oklab,var(--primary),var(--ink)_12%)]",
        outline: "border-border bg-transparent text-foreground hover:bg-paper-2",
        ghost: "text-foreground hover:bg-paper-2",
        link: "h-auto px-0 text-pasto-deep underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 gap-2 px-4 text-base",
        sm: "h-9 gap-1.5 px-3 text-sm [&_svg:not([class*='size-'])]:size-4",
        lg: "h-12 gap-2 px-5 text-base",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
