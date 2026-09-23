export function getImageDimensions(
  aspectRatio?: string,
  defaultWidth = 1200
): { width: number; height: number } {
  const ratioMap = {
    '1/1': { width: defaultWidth, height: defaultWidth },
    '4/3': { width: defaultWidth, height: Math.round(defaultWidth * 0.75) },
    '3/4': { width: defaultWidth, height: Math.round(defaultWidth * 1.33) },
    '16/9': { width: defaultWidth, height: Math.round(defaultWidth * 0.5625) },
    '9/16': { width: defaultWidth, height: Math.round(defaultWidth * 1.78) },
  }

  return ratioMap[aspectRatio as keyof typeof ratioMap] ?? ratioMap['16/9']
}

export function loadImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      const width = img.naturalWidth
      const height = img.naturalHeight
      if (width > 0 && height > 0) {
        resolve({ width, height })
        return
      }
      reject(new Error('Image has no intrinsic dimensions'))
    }

    img.onerror = () => {
      reject(new Error(`Failed to load image dimensions for ${src}`))
    }

    img.src = src
  })
}

export async function getRealImageDimensions(
  src: string,
  aspectRatio?: string
): Promise<{ width: number; height: number }> {
  try {
    return await loadImageDimensions(src)
  } catch {
    return getImageDimensions(aspectRatio)
  }
}
