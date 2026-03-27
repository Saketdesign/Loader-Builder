'use client';
import { AnimatePresence, motion } from 'motion/react';
import type { Transition, Variants } from 'motion/react';
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { cn } from '../../utils/cn';
import { useId } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { usePreventScroll } from './usePreventScroll';

const DialogContext = createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  variants: Variants;
  transition?: Transition;
  ids: {
    dialog: string;
    title: string;
    description: string;
  };
  onAnimationComplete: (definition: string) => void;
  handleTrigger: () => void;
} | null>(null);

const defaultVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    scale: 1,
  },
};

const defaultTransition: Transition = {
  ease: 'easeOut',
  duration: 0.2,
};

// Internal Slot implementation since we couldn't install @radix-ui/react-slot
const Slot = React.forwardRef<HTMLElement, { children: React.ReactNode } & React.HTMLAttributes<HTMLElement>>(
  ({ children, ...props }, ref) => {
    if (React.isValidElement(children)) {
      const child = children as React.ReactElement & { ref?: React.Ref<any> };
      return React.cloneElement(child, {
        ...props,
        ...(child.props as any),
        className: cn(props.className, (child.props as any).className),
        ref: child.ref ? (node: any) => {
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as any).current = node;
          if (typeof child.ref === 'function') child.ref(node);
          else if (child.ref) (child.ref as any).current = node;
        } : ref
      } as any);
    }
    return null;
  }
);

export type DialogProps = {
  children: React.ReactNode;
  variants?: Variants;
  transition?: Transition;
  className?: string;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
};

function Dialog({
  children,
  variants = defaultVariants,
  transition = defaultTransition,
  defaultOpen,
  onOpenChange,
  open,
}: DialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(
    defaultOpen || false
  );
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isOpen = open !== undefined ? open : uncontrolledOpen;

  // prevent scroll when dialog is open on iOS
  usePreventScroll({
    isDisabled: !isOpen,
  });

  const setIsOpen = React.useCallback(
    (value: boolean) => {
      setUncontrolledOpen(value);
      onOpenChange?.(value);
    },
    [onOpenChange]
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    const handleCancel = (e: Event) => {
      e.preventDefault();
      if (isOpen) {
        setIsOpen(false);
      }
    };

    dialog.addEventListener('cancel', handleCancel);
    return () => {
      dialog.removeEventListener('cancel', handleCancel);
      document.body.classList.remove('overflow-hidden');
    };
  }, [dialogRef, isOpen, setIsOpen]);

  useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.showModal();
    }
  }, [isOpen]);

  const handleTrigger = () => {
    setIsOpen(true);
  };

  const onAnimationComplete = (definition: string) => {
    if (definition === 'exit' && !isOpen) {
      dialogRef.current?.close();
    }
  };

  const baseId = useId();
  const ids = {
    dialog: `motion-ui-dialog-${baseId}`,
    title: `motion-ui-dialog-title-${baseId}`,
    description: `motion-ui-dialog-description-${baseId}`,
  };

  return (
    <DialogContext.Provider
      value={{
        isOpen,
        setIsOpen,
        dialogRef,
        variants,
        transition,
        ids,
        onAnimationComplete,
        handleTrigger,
      }}
    >
      {children}
    </DialogContext.Provider>
  );
}

export type DialogTriggerProps = {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ children, className, asChild, ...props }, ref) => {
    const context = useContext(DialogContext);
    if (!context) throw new Error('DialogTrigger must be used within Dialog');

    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        ref={ref as any}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          context.handleTrigger();
          props.onClick?.(e);
        }}
        className={cn(
          !asChild && 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-hidden focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          className
        )}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);
DialogTrigger.displayName = 'DialogTrigger';

export type DialogPortalProps = {
  children: React.ReactNode;
  container?: HTMLElement | null;
};

function DialogPortal({
  children,
  container = typeof window !== 'undefined' ? document.body : null,
}: DialogPortalProps) {
  const [mounted, setMounted] = React.useState(false);
  const [portalContainer, setPortalContainer] =
    React.useState<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
    setPortalContainer(container || document.body);
    return () => setMounted(false);
  }, [container]);

  if (!mounted || !portalContainer) {
    return null;
  }

  return createPortal(children, portalContainer);
}

export type DialogContentProps = {
  children: React.ReactNode;
  className?: string;
  container?: HTMLElement;
} & React.ComponentPropsWithoutRef<typeof motion.dialog>;

const DialogContent = React.forwardRef<HTMLDialogElement, DialogContentProps>(
  ({ children, className, container, ...props }, ref) => {
    const context = useContext(DialogContext);
    if (!context) throw new Error('DialogContent must be used within Dialog');
    const {
      isOpen,
      setIsOpen,
      dialogRef,
      variants,
      transition,
      ids,
      onAnimationComplete,
    } = context;

    const content = (
      <AnimatePresence mode='wait'>
        {isOpen && (
          <motion.dialog
            key={ids.dialog}
            ref={(node) => {
              if (typeof ref === 'function') ref(node);
              else if (ref) ref.current = node;
              (dialogRef as any).current = node;
            }}
            id={ids.dialog}
            aria-labelledby={ids.title}
            aria-describedby={ids.description}
            aria-modal='true'
            role='dialog'
            onClick={(e) => {
              if (e.target === dialogRef.current) {
                setIsOpen(false);
              }
              props.onClick?.(e as any);
            }}
            initial='initial'
            animate='animate'
            exit='exit'
            variants={variants}
            transition={transition}
            onAnimationComplete={onAnimationComplete}
            className={cn(
              'fixed inset-0 m-auto h-fit w-fit rounded-lg border border-zinc-200 p-0 shadow-lg dark:border dark:border-zinc-700',
              'backdrop:bg-black/50 backdrop:backdrop-blur-xs',
              'open:flex open:flex-col',
              className
            )}
            {...props}
          >
            <div className='w-full'>{children}</div>
          </motion.dialog>
        )}
      </AnimatePresence>
    );

    return <DialogPortal container={container}>{content}</DialogPortal>;
  }
);
DialogContent.displayName = 'DialogContent';

export type DialogHeaderProps = {
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col space-y-1.5', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
DialogHeader.displayName = 'DialogHeader';

export type DialogTitleProps = {
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLHeadingElement>;

const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ children, className, ...props }, ref) => {
    const context = useContext(DialogContext);
    if (!context) throw new Error('DialogTitle must be used within Dialog');

    return (
      <h2
        ref={ref}
        id={context.ids.title}
        className={cn('text-base font-medium', className)}
        {...props}
      >
        {children}
      </h2>
    );
  }
);
DialogTitle.displayName = 'DialogTitle';

export type DialogDescriptionProps = {
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLParagraphElement>;

const DialogDescription = React.forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  ({ children, className, ...props }, ref) => {
    const context = useContext(DialogContext);
    if (!context) throw new Error('DialogDescription must be used within Dialog');

    return (
      <p
        ref={ref}
        id={context.ids.description}
        className={cn('text-base text-zinc-500', className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);
DialogDescription.displayName = 'DialogDescription';

export type DialogCloseProps = {
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  asChild?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const DialogClose = React.forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ className, children, disabled, asChild, ...props }, ref) => {
    const context = useContext(DialogContext);
    if (!context) throw new Error('DialogClose must be used within Dialog');

    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        ref={ref as any}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          context.setIsOpen(false);
          props.onClick?.(e);
        }}
        type='button'
        aria-label='Close dialog'
        className={cn(
          !asChild && 'absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:outline-hidden focus:ring-zinc-500 focus:ring-offset-2 disabled:pointer-events-none',
          className
        )}
        disabled={disabled}
        {...props}
      >
        {children || <X className='h-4 w-4' />}
        <span className='sr-only'>Close</span>
      </Comp>
    );
  }
);
DialogClose.displayName = 'DialogClose';

// Compound component pattern
Dialog.Trigger = DialogTrigger;
Dialog.Portal = DialogPortal;
Dialog.Content = DialogContent;
Dialog.Header = DialogHeader;
Dialog.Title = DialogTitle;
Dialog.Description = DialogDescription;
Dialog.Close = DialogClose;

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
};
