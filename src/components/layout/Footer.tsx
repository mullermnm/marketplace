export function Footer() {
  return (
    <footer className="border-t border-border mt-12 py-8 text-sm text-muted-foreground">
      <div className="mx-auto max-w-7xl px-4 flex flex-col md:flex-row gap-2 justify-between">
        <p>© {new Date().getFullYear()} DigiMart Marketplace</p>
        <p>Built for the Digital Products Marketplace spec</p>
      </div>
    </footer>
  );
}
