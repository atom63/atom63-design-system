export function SiteFooter({ title }: { title: string }) {
  return (
    <footer className="border-border border-t">
      <div className="text-muted-foreground mx-auto max-w-5xl px-6 py-8 text-sm">
        {title} · Built with the Atom63 design system
      </div>
    </footer>
  )
}
