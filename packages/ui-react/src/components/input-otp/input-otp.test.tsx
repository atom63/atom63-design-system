import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "./input-otp";

describe("InputOTP", () => {
  // `input-otp` syncs the caret by scheduling the same callback three times —
  // at 0ms, 10ms and 50ms — and its effect returns no cleanup, so all three
  // outlive the component. Measured: three timers after render, still three
  // after unmount.
  //
  // Left alone they fire after the test file is done and jsdom has been torn
  // down, and the callback ends in a `setState`. React reaches for `window` to
  // work out the update's priority, finds it gone, and throws — outside any
  // test's call stack, so Vitest can only record it as an unhandled error and
  // fail the run while reporting every test as passed. It needs the machine to
  // be busy enough that the gap between files outlasts 50ms, which is why it
  // only ever showed up under a loaded parallel run.
  //
  // Draining them here, while the environment is still standing, is the whole
  // fix. See the last test in this file, which pins the leak itself.
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("renders the container + hidden input with the given maxLength", () => {
    const { container } = render(
      <InputOTP pushPasswordManagerStrategy="none" maxLength={4}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
      </InputOTP>,
    );
    expect(container.querySelector('[data-slot="input-otp"]')).not.toBeNull();
    const input = container.querySelector("input");
    expect(input).not.toBeNull();
    expect(input).toHaveAttribute("maxlength", "4");
  });

  it("renders one styled slot per InputOTPSlot", () => {
    const { container } = render(
      <InputOTP pushPasswordManagerStrategy="none" maxLength={6}>
        <InputOTPGroup>
          {Array.from({ length: 6 }, (_, i) => (
            <InputOTPSlot index={i} key={i} />
          ))}
        </InputOTPGroup>
      </InputOTP>,
    );
    expect(container.querySelectorAll(".a63-InputOTP-slot")).toHaveLength(6);
    expect(container.querySelector(".a63-InputOTP-group")).not.toBeNull();
  });

  it("reflects the controlled value into the slots", () => {
    const { container } = render(
      <InputOTP
        pushPasswordManagerStrategy="none"
        maxLength={4}
        onChange={() => {}}
        value="12"
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
      </InputOTP>,
    );
    const slots = container.querySelectorAll(".a63-InputOTP-slot");
    expect(slots[0]?.textContent).toBe("1");
    expect(slots[1]?.textContent).toBe("2");
  });

  it("forwards containerClassName + disabled", () => {
    const { container } = render(
      <InputOTP
        pushPasswordManagerStrategy="none"
        containerClassName="custom-x"
        disabled
        maxLength={2}
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
        </InputOTPGroup>
      </InputOTP>,
    );
    expect(
      container.querySelector(".a63-InputOTP")?.classList.contains("custom-x"),
    ).toBe(true);
    expect(container.querySelector("input")).toBeDisabled();
  });

  it('renders the separator with role="separator" and an icon', () => {
    const { container } = render(<InputOTPSeparator />);
    const sep = container.querySelector('[data-slot="input-otp-separator"]');
    expect(sep).not.toBeNull();
    expect(sep).toHaveAttribute("role", "separator");
    // The separator's glyph is decorative; assert that it rendered.
    expect(sep?.firstElementChild).not.toBeNull();
  });

  it("forwards invalid state to the hidden input that drives visible slot styling", () => {
    const { container } = render(
      <InputOTP aria-invalid maxLength={2} pushPasswordManagerStrategy="none">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
        </InputOTPGroup>
      </InputOTP>,
    );
    expect(container.querySelector(".a63-InputOTP-input")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("accepts a full pasted code and reports completion", () => {
    const onChange = vi.fn();
    const onComplete = vi.fn();
    const { container } = render(
      <InputOTP
        maxLength={4}
        onChange={onChange}
        onComplete={onComplete}
        pasteTransformer={(value) => value.replaceAll("-", "")}
        pushPasswordManagerStrategy="none"
      >
        <InputOTPGroup>
          {Array.from({ length: 4 }, (_, index) => (
            <InputOTPSlot index={index} key={index} />
          ))}
        </InputOTPGroup>
      </InputOTP>,
    );
    const input = container.querySelector("input") as HTMLInputElement;

    fireEvent.paste(input, {
      clipboardData: { getData: () => "12-34" },
    });

    expect(onChange).toHaveBeenLastCalledWith("1234");
    expect(onComplete).toHaveBeenCalledWith("1234");
    expect(
      Array.from(container.querySelectorAll(".a63-InputOTP-slot")),
    ).toHaveLength(4);
    expect(
      container.querySelectorAll(".a63-InputOTP-slot")[3],
    ).toHaveTextContent("4");
  });

  it("supports deletion and exposes mobile one-time-code input hints", () => {
    const onChange = vi.fn();
    const { container } = render(
      <InputOTP
        defaultValue="1234"
        maxLength={4}
        onChange={onChange}
        pushPasswordManagerStrategy="none"
      >
        <InputOTPGroup>
          {Array.from({ length: 4 }, (_, index) => (
            <InputOTPSlot index={index} key={index} />
          ))}
        </InputOTPGroup>
      </InputOTP>,
    );
    const input = container.querySelector("input") as HTMLInputElement;

    expect(input).toHaveAttribute("inputmode", "numeric");
    expect(input).toHaveAttribute("autocomplete", "one-time-code");
    fireEvent.change(input, { target: { value: "123" } });
    expect(onChange).toHaveBeenLastCalledWith("123");
    expect(
      container.querySelectorAll(".a63-InputOTP-slot")[3],
    ).toHaveTextContent("");
  });

  it("leaves no timers behind once it is unmounted and drained", () => {
    const { unmount } = render(
      <InputOTP maxLength={2} pushPasswordManagerStrategy="none">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
        </InputOTPGroup>
      </InputOTP>,
    );

    // Unmounting is not enough on its own — the timers belong to `input-otp`,
    // not to the effect's (absent) cleanup, so they survive it. This asserts
    // that rather than assuming it: if a future version of the library starts
    // clearing them, this goes red and the workaround above can go.
    unmount();
    expect(vi.getTimerCount()).toBeGreaterThan(0);

    // Running them now is what keeps them from running later, after jsdom is
    // gone.
    vi.runOnlyPendingTimers();
    expect(vi.getTimerCount()).toBe(0);
  });
});
