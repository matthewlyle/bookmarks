"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion } from "motion/react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const overlayTransition = { duration: 0.15 };
const contentTransition = { type: "spring" as const, stiffness: 550, damping: 35 };

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-[60] bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

interface DialogContentProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    "title"
  > {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
}

const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(
  (
    {
      className,
      open,
      onOpenChange,
      title,
      children,
      onOpenAutoFocus,
      ...props
    },
    ref
  ) => {
    const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);
    React.useEffect(() => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mq.matches);
      const handler = () => setPrefersReducedMotion(mq.matches);
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }, []);

    function handleClose() {
      onOpenChange(false);
    }

    const contentVariants = prefersReducedMotion
      ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
      : {
          initial: { opacity: 0, scale: 0.95, y: 40 },
          animate: { opacity: 1, scale: 1, y: 0 },
        };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogPortal forceMount>
          {open && (
            <>
              <DialogPrimitive.Overlay asChild forceMount>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={overlayTransition}
                  className="fixed inset-0 z-[60] bg-black/80"
                />
              </DialogPrimitive.Overlay>
              <DialogPrimitive.Content
                  ref={ref}
                  asChild
                  forceMount
                  aria-describedby={undefined}
                  onOpenAutoFocus={onOpenAutoFocus}
                  onPointerDownOutside={(e) => {
                    e.preventDefault();
                    handleClose();
                  }}
                  onEscapeKeyDown={handleClose}
                  {...props}
                >
                  <motion.div
                    initial={contentVariants.initial}
                    animate={contentVariants.animate}
                    transition={contentTransition}
                    className={cn(
                      "fixed left-[50%] top-[50%] z-[60] grid w-full max-w-[min(28rem,100%-2rem)] max-h-[calc(100vh-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto bg-background p-0 shadow-[var(--shadow-dialog)] gap-0",
                      className
                    )}
                  >
                    <div className="flex items-center justify-between border-b border-border px-4 py-3">
                      <DialogPrimitive.Title className="text-sm font-medium" style={{ fontFamily: "var(--font-heading)" }}>
                        {title}
                      </DialogPrimitive.Title>
                      <DialogClose asChild>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.99 }}
                          className="p-1 text-foreground hover:text-foreground transition-colors duration-200 ease hover:bg-muted"
                          aria-label="Close dialog"
                        >
                          <X className="h-4 w-4" />
                        </motion.button>
                      </DialogClose>
                    </div>
                    <div className="p-4">{children}</div>
                  </motion.div>
                </DialogPrimitive.Content>
              </>
            )}
        </DialogPortal>
      </Dialog>
    );
  }
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("font-semibold leading-none", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

const DialogContentPrimitive = DialogPrimitive.Content;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogContentPrimitive,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
