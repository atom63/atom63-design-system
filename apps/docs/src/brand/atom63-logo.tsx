import type { SVGProps } from 'react'

export interface Atom63LogoProps extends Omit<
  SVGProps<SVGSVGElement>,
  'children' | 'height' | 'width'
> {
  height?: number
  title?: string
}

export function Atom63Logo({
  className,
  height = 32,
  title = 'ATOM63 logo',
  ...props
}: Atom63LogoProps) {
  const width = Math.round((height * 40) / 48)
  const svgClassName = className ? `inline-block ${className}` : 'inline-block'

  return (
    <svg
      className={svgClassName}
      fill="none"
      height={height}
      viewBox="0 0 40 48"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>{title}</title>
      <path
        d="M32 21.33C30.9 21.33 30 20.44 30 19.33V17.33C28.44 15.77 27.56 14.9 26 13.33H10V10C10 8.9 10.9 8 12 8H26C28.34 5.66 29.66 4.34 32 2V0H14L10 4V6C10 7.1 9.1 8 8 8H6C3.66 10.34 2.34 11.66 0 14V26.67H8C9.1 26.67 10 27.56 10 28.67V30.67C11.56 32.23 12.44 33.1 14 34.67H30V38C30 39.1 29.1 40 28 40H14C11.66 42.34 10.34 43.66 8 46V48H26L30 44V42C30 40.9 30.9 40 32 40H34C36.34 37.66 37.66 36.34 40 34V21.33H32ZM30 26.67H12C10.89 26.67 10 25.77 10 24.67V21.33H28C29.1 21.33 30 22.23 30 23.33V26.67Z"
        fill="currentColor"
      />
    </svg>
  )
}
