import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sheet({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  children: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog.Root>
  );
}

export function SheetContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-bg/70" />
      <Dialog.Content
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-[min(100%,22rem)] overflow-y-auto border-l border-border bg-surface p-5 shadow-2xl",
          className,
        )}
      >
        <Dialog.Title className="sr-only">Menu</Dialog.Title>
        <Dialog.Close className="absolute top-4 right-4 grid size-11 place-items-center rounded-[12px] text-muted hover:text-fg">
          <X className="size-5" />
        </Dialog.Close>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
}
