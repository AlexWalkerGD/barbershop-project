import { CheckCircle2 } from "lucide-react"

const benefits = [
  {
    title: "Agenda 100% automatizada",
    description:
      "Clientes agendam sozinhos, 24 horas por dia, 7 dias por semana. Você recebe notificação e pronto.",
  },
  {
    title: "Cada barbeiro com sua disponibilidade",
    description:
      "Agenda individual, clientes podem escolher seu barbeiro sem ter confusões.",
  },
  {
    title: "Zero conflitos de horário",
    description:
      "O sistema impede que dois clientes ocupem o mesmo horário com o mesmo barbeiro. Automaticamente.",
  },
  {
    title: "Controle total do negócio",
    description:
      "Veja quem agendou, quem cancelou, quem faltou. Tome decisões com base em dados reais.",
  },
  {
    title: "Interface moderna e intuitiva",
    description:
      "Feita para quem não é expert em tecnologia. Qualquer barbeiro aprende em minutos.",
  },
  {
    title: "Mantenha o controle manual",
    description:
      "Crie agendamentos por conta própria e nunca fique com horários livres.",
  },
]

const BenefitsSection = () => {
  return (
    <section id="beneficios" className="py-24">
      <div className="section-divider mb-24" />
      <div className="container mx-auto px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left: headline */}
          <div>
            <span className="text-gold mb-4 inline-block text-xs font-semibold uppercase tracking-widest">
              Por que o Tempus?
            </span>
            <h2 className="mb-6 text-4xl font-bold leading-tight md:text-5xl">
              Tudo o que você precisa para{" "}
              <span className="text-gradient-gold">
                profissionalizar sua barbearia
              </span>
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
              O Tempus não é só uma agenda online. É um sistema completo de
              gestão que coloca sua barbearia em outro nível.
            </p>

            <a
              href="/signature"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gold glow-gold-sm inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold text-primary-foreground transition-all duration-300 hover:scale-[1.02] hover:opacity-90"
            >
              Começar agora
            </a>
          </div>

          {/* Right: benefits list */}
          <div className="grid gap-4 sm:grid-cols-2">
            {benefits.map((benefit, i) => (
              <div key={i} className="card-premium rounded-xl p-5">
                <div className="mb-3 flex items-start gap-3">
                  <CheckCircle2 className="text-gold mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <h3 className="mb-1 text-sm font-bold">{benefit.title}</h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default BenefitsSection
