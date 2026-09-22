import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const embla = vi.hoisted(() => {
  const state = { canScrollPrev: false, canScrollNext: false };
  const listeners = new Map<string, Set<(api: unknown) => void>>();
  const api = {
    canScrollPrev: vi.fn(() => state.canScrollPrev),
    canScrollNext: vi.fn(() => state.canScrollNext),
    scrollPrev: vi.fn(),
    scrollNext: vi.fn(),
    on: vi.fn((event: string, callback: (api: unknown) => void) => {
      const callbacks = listeners.get(event) ?? new Set();
      callbacks.add(callback);
      listeners.set(event, callbacks);
      return api;
    }),
    off: vi.fn((event: string, callback: (api: unknown) => void) => {
      listeners.get(event)?.delete(callback);
      return api;
    }),
  };
  const carouselRef = vi.fn();
  const useEmblaCarousel = vi.fn(() => [carouselRef, api]);

  return {
    api,
    carouselRef,
    state,
    useEmblaCarousel,
    emit(event: string) {
      for (const callback of listeners.get(event) ?? []) callback(api);
    },
    reset() {
      state.canScrollPrev = false;
      state.canScrollNext = false;
      listeners.clear();
      for (const value of Object.values(api)) {
        if (typeof value === "function" && "mockClear" in value)
          value.mockClear();
      }
      carouselRef.mockClear();
      useEmblaCarousel.mockClear();
    },
  };
});

vi.mock("embla-carousel-react", () => ({ default: embla.useEmblaCarousel }));

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./carousel";

// embla-carousel reads window.matchMedia on mount for its breakpoint options,
// which jsdom doesn't implement — stub a static (no-op listener) media query.
beforeAll(() => {
  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});

beforeEach(() => {
  embla.reset();
});

function Fixture() {
  return (
    <Carousel>
      <CarouselContent>
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>Slide 2</CarouselItem>
        <CarouselItem>Slide 3</CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}

describe("Carousel", () => {
  it("renders the region + all items", () => {
    const { container, getByText } = render(<Fixture />);
    const root = container.querySelector(".a63-Carousel");
    expect(root).not.toBeNull();
    expect(root).toHaveAttribute("data-slot", "carousel");
    expect(root).toHaveAttribute("data-orientation", "horizontal");
    expect(getByText("Slide 1")).toBeInTheDocument();
    expect(getByText("Slide 2")).toBeInTheDocument();
    expect(getByText("Slide 3")).toBeInTheDocument();
    expect(
      container.querySelectorAll('[data-slot="carousel-item"]'),
    ).toHaveLength(3);
  });

  it("renders labelled button controls and reflects Embla disabled state", () => {
    const { getByRole } = render(<Fixture />);
    const previous = getByRole("button", { name: "Previous slide" });
    const next = getByRole("button", { name: "Next slide" });

    expect(previous).toBeDisabled();
    expect(next).toBeDisabled();

    act(() => {
      embla.state.canScrollNext = true;
      embla.emit("select");
    });

    expect(previous).toBeDisabled();
    expect(next).toBeEnabled();
    fireEvent.click(next);
    expect(embla.api.scrollNext).toHaveBeenCalledOnce();
  });

  it("reflects the vertical orientation", () => {
    const { container } = render(
      <Carousel orientation="vertical">
        <CarouselContent>
          <CarouselItem>A</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    expect(container.querySelector(".a63-Carousel")).toHaveAttribute(
      "data-orientation",
      "vertical",
    );
    expect(container.querySelector(".a63-Carousel-track")).toHaveAttribute(
      "data-orientation",
      "vertical",
    );
    expect(embla.useEmblaCarousel).toHaveBeenCalledWith(
      { axis: "y" },
      undefined,
    );
  });

  it("exposes the Embla API and handles ArrowLeft/ArrowRight keyboard navigation", async () => {
    const setApi = vi.fn();
    const { container } = render(
      <Carousel setApi={setApi}>
        <CarouselContent>
          <CarouselItem>Slide 1</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    const root = container.querySelector(".a63-Carousel") as HTMLElement;

    await waitFor(() => expect(setApi).toHaveBeenCalledWith(embla.api));

    expect(fireEvent.keyDown(root, { key: "ArrowLeft" })).toBe(false);
    expect(fireEvent.keyDown(root, { key: "ArrowRight" })).toBe(false);
    expect(embla.api.scrollPrev).toHaveBeenCalledOnce();
    expect(embla.api.scrollNext).toHaveBeenCalledOnce();
  });

  it("does not render the cursor overlay by default", () => {
    const { container } = render(<Fixture />);
    const root = container.querySelector(".a63-Carousel");
    expect(root).not.toHaveClass("a63-Carousel--cursor-indicator");
    expect(container.querySelector('[data-slot="carousel-cursor"]')).toBeNull();
  });

  it("shows a pointer-following cursor overlay when cursorIndicator is set", () => {
    const { container } = render(
      <Carousel cursorIndicator>
        <CarouselContent>
          <CarouselItem>Slide 1</CarouselItem>
          <CarouselItem>Slide 2</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    const root = container.querySelector(".a63-Carousel") as HTMLElement;
    expect(root).toHaveClass("a63-Carousel--cursor-indicator");
    // No overlay until the pointer enters.
    expect(container.querySelector('[data-slot="carousel-cursor"]')).toBeNull();

    fireEvent.pointerMove(root, { clientX: 200, clientY: 50 });
    const cursor = container.querySelector('[data-slot="carousel-cursor"]');
    expect(cursor).not.toBeNull();
    // Right half of the viewport → next affordance.
    expect(cursor).toHaveAttribute("data-side", "next");
  });

  it("navigates on cursor click but suppresses the click synthesized after a drag", () => {
    embla.state.canScrollNext = true;
    const { container } = render(
      <Carousel cursorIndicator opts={{ loop: true }}>
        <CarouselContent>
          <CarouselItem>Slide 1</CarouselItem>
          <CarouselItem>Slide 2</CarouselItem>
          <CarouselItem>Slide 3</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    const root = container.querySelector(".a63-Carousel") as HTMLElement;
    // Establish "next" side before click (right half).
    Object.defineProperty(root, "getBoundingClientRect", {
      value: () => ({
        left: 0,
        top: 0,
        width: 400,
        height: 100,
        right: 400,
        bottom: 100,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
    });
    fireEvent.pointerMove(root, { clientX: 300, clientY: 50 });
    expect(
      container.querySelector('[data-slot="carousel-cursor"]'),
    ).toHaveAttribute("data-side", "next");

    // A move beyond the six-pixel threshold marks this interaction as an Embla drag.
    fireEvent.pointerDown(root, { clientX: 300, clientY: 50 });
    fireEvent.pointerMove(root, { clientX: 310, clientY: 50 });
    fireEvent.click(root, { clientX: 300, clientY: 50 });
    expect(embla.api.scrollNext).not.toHaveBeenCalled();

    fireEvent.pointerDown(root, { clientX: 300, clientY: 50 });
    fireEvent.click(root, { clientX: 300, clientY: 50 });
    expect(embla.api.scrollNext).toHaveBeenCalledOnce();
  });
});
