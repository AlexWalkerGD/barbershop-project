import { ArrowRight, Scissors } from "lucide-react"

const CTASection = () => {
  return (
    <section className="py-32">
      <div className="section-divider mb-32" />
      <div className="container mx-auto px-6">
        {/* Main CTA card */}
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-primary bg-card p-12 text-center">
          {/* Background glow */}
          <div className="pointer-events-none absolute inset-0">
            <div className="bg-gold/8 absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full blur-[80px]" />
          </div>

          <div className="relative">
            <div className="mb-6 flex justify-center">
              <div className="bg-gold flex h-14 w-14 items-center justify-center rounded-2xl text-primary-foreground">
                <Scissors className="h-7 w-7" />
              </div>
            </div>

            <h2 className="mb-4 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              Pare de perder clientes{" "}
              <span className="text-gradient-gold">por desorganização.</span>
            </h2>

            <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Junte-se a barbearias que já transformaram sua gestão com o
              Tempus. Comece hoje, sem cartão de crédito necessário.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <a
                href="/signature"
                rel="noopener noreferrer"
                className="bg-gold glow-gold group inline-flex items-center gap-2 rounded-xl px-10 py-4 text-lg font-bold text-primary-foreground transition-all duration-300 hover:scale-[1.02] hover:opacity-90"
              >
                Começar Agora
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </a>
            </div>

            <p className="mt-6 text-xs text-muted-foreground">
              Configuração em minutos • Suporte dedicado • Cancele quando quiser
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 border-t border-border pt-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="bg-gold flex h-7 w-7 items-center justify-center rounded-lg text-primary-foreground">
                <Scissors className="h-3.5 w-3.5" />
              </div>
              <span className="font-syne text-lg font-bold">Tempus</span>
            </div>
            <p className="text-xs text-muted-foreground">
              © 2025 Tempus. Todos os direitos reservados.
            </p>
            <a
              href="/signature"
              rel="noopener noreferrer"
              className="text-gold text-xs hover:underline"
            >
              Acessar o sistema →
            </a>
          </div>
        </div>
      </footer>
    </section>
  )
}

export default CTASection
