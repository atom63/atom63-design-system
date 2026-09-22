import { afterEach, describe, expect, it, vi } from "vitest";
import {
  capColorForContrast,
  colorCacheKey,
  extractColorFromImage,
  extractColorFromLoadedImage,
  getCachedColor,
  loadAndExtractColor,
  TINT_MAX_LUMINANCE,
} from "./extract-color";

function imageWithDimensions(
  src: string,
  width = 100,
  height = 80,
): HTMLImageElement {
  return {
    currentSrc: src,
    src,
    naturalWidth: width,
    naturalHeight: height,
  } as HTMLImageElement;
}

function mockCanvas(pixels = new Uint8ClampedArray([12, 34, 56, 255])) {
  const context = {
    drawImage: vi.fn(),
    getImageData: vi.fn(() => ({ data: pixels })),
  };
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    context as unknown as CanvasRenderingContext2D,
  );
  return context;
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function srgbToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(rgb: string): number {
  const [r, g, b] = rgb.split(" ").map(Number) as [number, number, number];
  return (
    0.2126 * srgbToLinear(r) +
    0.7152 * srgbToLinear(g) +
    0.0722 * srgbToLinear(b)
  );
}

function hue(rgb: string): number {
  const [r, g, b] = rgb.split(" ").map(Number) as [number, number, number];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return 0;
  const d = max - min;
  if (max === r) return (((g - b) / d + (g < b ? 6 : 0)) / 6) * 360;
  if (max === g) return (((b - r) / d + 2) / 6) * 360;
  return (((r - g) / d + 4) / 6) * 360;
}

describe("capColorForContrast", () => {
  /**
   * The contract the tinted card overlay depends on. Clamping HSL *lightness*
   * instead passes this for blue and fails it for yellow: at L=0.13 a saturated
   * yellow resolves to rgb(63 65 1), roughly 4x the luminance of an equally
   * "light" blue — which is what put white copy under AA on bright cards.
   */
  it.each([
    ["yellow", 255, 255, 0],
    ["cyan", 0, 255, 255],
    ["magenta", 255, 0, 255],
    ["red", 255, 0, 0],
    ["blue", 0, 0, 255],
    ["green", 0, 255, 0],
    ["white", 255, 255, 255],
    ["mid grey", 128, 128, 128],
    ["olive", 98, 101, 1],
  ])("caps %s to the luminance ceiling", (_name, r, g, b) => {
    const capped = capColorForContrast(r, g, b);
    expect(luminance(capped)).toBeLessThanOrEqual(TINT_MAX_LUMINANCE * 1.02);
  });

  it("keeps hue while darkening, so a yellow reads as deep gold not grey", () => {
    const capped = capColorForContrast(255, 255, 0);
    expect(hue(capped)).toBeGreaterThan(45);
    expect(hue(capped)).toBeLessThan(75);
  });

  it("keeps a blue blue", () => {
    const [r, g, b] = capColorForContrast(4, 60, 98).split(" ").map(Number) as [
      number,
      number,
      number,
    ];
    expect(b).toBeGreaterThan(r);
    expect(b).toBeGreaterThan(g);
  });

  it("leaves colors already under the ceiling untouched", () => {
    expect(capColorForContrast(8, 10, 12)).toBe("8 10 12");
  });

  it("maps pure black to black", () => {
    expect(capColorForContrast(0, 0, 0)).toBe("0 0 0");
  });
});

describe("color extraction cache and sampling", () => {
  it("keeps cache keys compatible across the public cache helpers", () => {
    const url = "https://example.test/cache-key.jpg";
    mockCanvas();

    expect(colorCacheKey(url, "top")).toBe(`${url}::top`);
    expect(getCachedColor(url, "top")).toBeNull();

    const extracted = extractColorFromLoadedImage(imageWithDimensions(url), {
      sampleRegion: "top",
    });

    expect(extracted).toMatchObject({
      css: "12 34 56",
      raw: { r: 12, g: 34, b: 56 },
    });
    expect(getCachedColor(url, "top")).toBe(extracted);
    expect(getCachedColor(url, "bottom")).toBeNull();
  });

  it.each([
    ["top", 0, 40, 4],
    ["bottom", 40, 40, 4],
  ] as const)(
    "samples the %s half of the source image",
    (sampleRegion, srcY, srcH, drawH) => {
      const context = mockCanvas();
      const image = imageWithDimensions(
        `https://example.test/${sampleRegion}.jpg`,
      );

      extractColorFromImage(image, { maxSize: 10, sampleRegion });

      expect(context.drawImage).toHaveBeenCalledWith(
        image,
        0,
        srcY,
        100,
        srcH,
        0,
        0,
        10,
        drawH,
      );
      expect(context.getImageData).toHaveBeenCalledWith(0, 0, 10, drawH);
    },
  );

  it("surfaces a tainted-canvas/CORS read failure for direct extraction", () => {
    const context = mockCanvas();
    context.getImageData.mockImplementation(() => {
      throw new DOMException("The canvas has been tainted", "SecurityError");
    });

    expect(() =>
      extractColorFromImage(
        imageWithDimensions("https://cross-origin.test/image.jpg"),
      ),
    ).toThrow("The canvas has been tainted");
  });
});

describe("loadAndExtractColor", () => {
  class MockImage {
    static instances: MockImage[] = [];

    crossOrigin = "";
    naturalHeight = 80;
    naturalWidth = 100;
    onerror: (() => void) | null = null;
    onload: (() => void) | null = null;
    src = "";

    constructor() {
      MockImage.instances.push(this);
    }
  }

  function installImageMock() {
    MockImage.instances = [];
    vi.stubGlobal("Image", MockImage);
  }

  it("shares pending work, caches success by URL and region, and sets CORS before loading", async () => {
    installImageMock();
    mockCanvas(new Uint8ClampedArray([90, 40, 10, 255]));
    const url = "https://example.test/pending.jpg";

    const first = loadAndExtractColor(url, { sampleRegion: "bottom" });
    const second = loadAndExtractColor(url, { sampleRegion: "bottom" });

    expect(second).toBe(first);
    expect(MockImage.instances).toHaveLength(1);
    expect(MockImage.instances[0]?.crossOrigin).toBe("anonymous");
    expect(MockImage.instances[0]?.src).toBe(url);

    MockImage.instances[0]?.onload?.();
    const result = await first;

    expect(result.css).toBe("90 40 10");
    expect(getCachedColor(url, "bottom")).toBe(result);
    await expect(
      loadAndExtractColor(url, { sampleRegion: "bottom" }),
    ).resolves.toBe(result);
    expect(MockImage.instances).toHaveLength(1);
  });

  it("reports load errors and clears pending work so a retry can start", async () => {
    installImageMock();
    const url = "https://example.test/missing.jpg";
    const first = loadAndExtractColor(url, { crossOrigin: "use-credentials" });

    expect(MockImage.instances[0]?.crossOrigin).toBe("use-credentials");
    MockImage.instances[0]?.onerror?.();
    await expect(first).rejects.toThrow(`Failed to load: ${url}`);

    const retry = loadAndExtractColor(url);
    expect(MockImage.instances).toHaveLength(2);
    MockImage.instances[1]?.onerror?.();
    await expect(retry).rejects.toThrow(`Failed to load: ${url}`);
  });
});
