import {
  Calendar,
  Users,
  Clock,
  CreditCard,
  Bell,
  BarChart3,
} from "lucide-react"
import dashboardMockup from "@/public/BannerHome.png"
import Image from "next/image"

const features = [
  {
    icon: Calendar,
    title: "Dashboard inteligente",
    description:
      "Visão completa do dia, semana e mês. Todos os agendamentos em um único lugar.",
  },
  {
    icon: Users,
    title: "Controle por barbeiro",
    description:
      "Cada profissional tem sua própria agenda, disponibilidade e serviços.",
  },
  {
    icon: Clock,
    title: "Disponibilidade personalizada",
    description:
      "Configure horários de trabalho, intervalos e folgas por barbeiro de forma fácil.",
  },
  {
    icon: CreditCard,
    title: "Assinaturas integradas",
    description:
      "Sistema de planos e assinaturas para clientes fiéis. Receita recorrente e previsível.",
  },
  {
    icon: Bell,
    title: "Lembretes automáticos",
    description:
      "Clientes recebem confirmação e lembrete automaticamente. Menos faltas, mais dinheiro.",
  },
  {
    icon: BarChart3,
    title: "Relatórios e métricas",
    description:
      "Acompanhe faturamento, serviços mais vendidos e desempenho de cada barbeiro.",
  },
]

const SolutionSection = () => {
  return (
    <section id="solucao" className="bg-surface-1/40 py-24">
      <div className="section-divider mb-24" />
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="text-gold mb-4 inline-block text-xs font-semibold uppercase tracking-widest">
            A Solução
          </span>
          <h2 className="mb-4 text-4xl font-bold leading-tight md:text-5xl">
            Tudo que sua barbearia precisa{" "}
            <span className="text-gradient-gold">em um sistema só</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            O Tempus foi construído pensando exclusivamente no dia a dia de
            barbearias. Simples de usar, poderoso para crescer.
          </p>
        </div>

        {/* Feature grid */}
        <div className="mb-20 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <div key={i} className="card-premium group rounded-2xl p-6">
                <div className="text-gold group-hover:bg-gold/20 mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-500/10 transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-base font-bold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Screenshot with floating labels */}
        <div className="mx-auto max-w-5xl">
          <div className="relative">
            {/* Floating badge left */}
            <div className="absolute -left-4 top-1/4 z-10 hidden rounded-xl border border-primary bg-card p-3 shadow-xl lg:block">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                <span className="text-xs font-semibold text-foreground">
                  12 agendamentos hoje
                </span>
              </div>
            </div>

            {/* Floating badge right */}
            <div className="absolute -right-4 bottom-1/4 z-10 hidden rounded-xl border border-primary bg-card p-3 shadow-xl lg:block">
              <div className="text-xs text-muted-foreground">
                Faturamento do mês
              </div>
              <div className="text-gold text-lg font-bold">R$ 8.420</div>
            </div>

            <div className="glow-gold overflow-hidden rounded-2xl border border-border">
              <Image
                src={dashboardMockup}
                alt="Interface do Tempus – Controle total da barbearia"
                className="w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SolutionSection
