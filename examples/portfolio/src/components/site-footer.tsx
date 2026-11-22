import { portfolio } from '../portfolio.config'

export function SiteFooter() {
  const { email, links, name } = portfolio.person
  return (
    <footer className="border-border border-t print:hidden">
      <div className="text-muted-foreground mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm">
        <p>
          {name} · {portfolio.title} · Built with the Atom63 design system
        </p>
        <ul className="flex flex-wrap items-center gap-4">
          <li>
            <a className="hover:text-foreground transition-colors" href={`mailto:${email}`}>
              Email
            </a>
          </li>
          {links.map(link => (
            <li key={link.href}>
              <a
                className="hover:text-foreground transition-colors"
                href={link.href}
                rel="noreferrer"
                target="_blank"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}
