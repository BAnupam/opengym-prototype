import {
  type ReactNode,
  useEffect,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import styles from "./Dialog.module.css";

/**
 * Shared accessible Dialog primitive.
 *
 * Renders via portal, traps focus when open, closes on Escape,
 * and restores focus to the trigger element on close.
 */
interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  triggerRef: { current: HTMLElement | null };
}

let portalContainer: HTMLElement | null = null;

function getPortalContainer(): HTMLElement {
  if (!portalContainer) {
    portalContainer = document.createElement("div");
    portalContainer.id = "dialog-portal";
    portalContainer.className = styles.portal;
    document.body.appendChild(portalContainer);
  }
  return portalContainer;
}

/** Reset portal container — for test cleanup only. */
export function resetDialogPortal(): void {
  if (portalContainer) {
    if (portalContainer.parentNode) {
      portalContainer.parentNode.removeChild(portalContainer);
    }
    portalContainer = null;
  }
}

export function Dialog({
  open,
  onClose,
  title,
  children,
  triggerRef,
}: DialogProps): React.ReactElement | null {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      previousFocus.current = triggerRef.current ?? (document.activeElement as HTMLElement | null);
      // Move focus into dialog after render
      requestAnimationFrame(() => {
        dialogRef.current?.focus();
      });
    }
  }, [open, triggerRef]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        trapFocus(e, dialogRef.current);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      previousFocus.current?.focus();
    }
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.content}>{children}</div>
        <button className={styles.closeButton} onClick={onClose} type="button">
          Close
        </button>
      </div>
    </div>,
    getPortalContainer(),
  );
}

function trapFocus(e: KeyboardEvent, container: HTMLElement): void {
  const focusable = container.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  );
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}
