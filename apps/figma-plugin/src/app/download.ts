/** Saves a text file from the plugin UI; Figma plugin iframes allow Blob downloads. */
export function downloadFile(name: string, text: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/css' }))
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
