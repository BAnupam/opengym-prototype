import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Dialog, resetDialogPortal } from "./Dialog";
import React from "react";

describe("Dialog primitive (CMP-9)", () => {
  let triggerRef: { current: HTMLButtonElement | null };
  let triggerEl: HTMLButtonElement;

  beforeEach(() => {
    triggerRef = React.createRef<HTMLButtonElement>();
    // Create a mock trigger element
    triggerEl = document.createElement("button");
    triggerEl.textContent = "Open Dialog";
    document.body.appendChild(triggerEl);
    triggerRef.current = triggerEl;
  });

  afterEach(() => {
    // Clean up trigger element to prevent test pollution
    if (triggerEl && triggerEl.parentNode) {
      triggerEl.parentNode.removeChild(triggerEl);
    }
    // Reset portal container (clears module-level reference)
    resetDialogPortal();
  });

  it("renders when open is true", () => {
    render(
      <Dialog
        open={true}
        onClose={() => {}}
        title="Test Dialog"
        triggerRef={triggerRef}
      >
        <p>Dialog content</p>
      </Dialog>,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Test Dialog")).toBeInTheDocument();
    expect(screen.getByText("Dialog content")).toBeInTheDocument();
  });

  it("does not render when open is false", () => {
    const { container } = render(
      <Dialog
        open={false}
        onClose={() => {}}
        title="Test Dialog"
        triggerRef={triggerRef}
      >
        <p>Dialog content</p>
      </Dialog>,
    );

    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it("closes on Escape key", async () => {
    const onClose = vi.fn();

    render(
      <Dialog
        open={true}
        onClose={onClose}
        title="Test Dialog"
        triggerRef={triggerRef}
      >
        <p>Dialog content</p>
      </Dialog>,
    );

    fireEvent.keyDown(document.documentElement, { key: "Escape" });

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("closes when close button is clicked", async () => {
    const onClose = vi.fn();

    render(
      <Dialog
        open={true}
        onClose={onClose}
        title="Test Dialog"
        triggerRef={triggerRef}
      >
        <p>Dialog content</p>
      </Dialog>,
    );

    const closeBtn = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("closes when overlay is clicked", async () => {
    const onClose = vi.fn();

    render(
      <Dialog
        open={true}
        onClose={onClose}
        title="Test Dialog"
        triggerRef={triggerRef}
      >
        <p>Dialog content</p>
      </Dialog>,
    );

    // Click on the overlay (the transparent background)
    const overlay = document.querySelector('[role="presentation"]');
    if (overlay) {
      fireEvent.click(overlay);
    }

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("traps focus when Tab is pressed", async () => {
    render(
      <Dialog
        open={true}
        onClose={() => {}}
        title="Focus Trap Dialog"
        triggerRef={triggerRef}
      >
        <input data-testid="dialog-input" />
      </Dialog>,
    );

    const input = screen.getByTestId("dialog-input");
    const closeBtn = screen.getByRole("button", { name: "Close" });

    // Focus the close button (last focusable element in the dialog)
    closeBtn.focus();
    expect(document.activeElement).toBe(closeBtn);

    // Tab from last element cycles back to first (trap focus prevents default and wraps)
    fireEvent.keyDown(closeBtn, { key: "Tab" });
    expect(document.activeElement).toBe(input);
  });
});