import { MessageSquareX, CalendarX, AlertTriangle, FolderX } from "lucide-react"

const problems = [
  {
    icon: MessageSquareX,
    title: "Perda de clientes",
    description:
      "Clientes que tentam agendar pelo WhatsApp e não recebem resposta rápida simplesmente vão para o concorrente.",
  },
  {
    icon: CalendarX,
    title: "Confusão de horários",
    description:
      "Dois barbeiros marcados no mesmo horário. Cliente chegando e encontrando outro no lugar. Situação constrangedora e prejuízo garantido.",
  },
  {
    icon: AlertTriangle,
    title: "Cancelamentos sem aviso",
    description:
      "Cliente cancela na última hora ou simplesmente não aparece. Horário vazio, dinheiro perdido, barbeiro ocioso.",
  },
  {
    icon: FolderX,
    title: "Falta de organização",
    description:
      "Sem visibilidade do dia, sem histórico de clientes, sem controle de faturamento. Gestão 100% no feeling — arriscado demais.",
  },
]

const ProblemSection = () => {
  return (
    <section id="problema" className="py-24">
      <div className="section-divider mb-24" />
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="text-gold mb-4 inline-block text-xs font-semibold uppercase tracking-widest">
            O Problema
          </span>
          <h2 className="mb-4 text-4xl font-bold leading-tight md:text-5xl">
            Se você usa WhatsApp ou agenda de papel,{" "}
            <span className="text-gold">você está perdendo dinheiro</span> todos
            os dias.
          </h2>
          <p className="text-lg text-muted-foreground">
            Reconhece alguma dessas situações? Elas são mais comuns do que você
            imagina.
          </p>
        </div>

        {/* Problem cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {problems.map((problem, i) => {
            const Icon = problem.icon
            return (
              <div key={i} className="card-premium group rounded-2xl p-6">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400 transition-colors group-hover:bg-red-500/15">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-lg font-bold">{problem.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {problem.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Emphasis */}
        <div className="border-gold/20 bg-gold/5 mx-auto mt-12 max-w-3xl rounded-2xl border px-8 py-6 text-center">
          <p className="text-base font-semibold text-foreground">
            <span className="text-gold">
              Barbearias que usam sistemas profissionais de agendamento
            </span>{" "}
            reportam aumento médio de 30% no faturamento e redução drástica de
            no-shows.
          </p>
        </div>
      </div>
    </section>
  )
}

export default ProblemSection
