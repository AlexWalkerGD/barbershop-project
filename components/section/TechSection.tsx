const techStack = [
  {
    name: "Next.js",
    icon: "▲",
    description:
      "Framework React de alta performance para aplicações web modernas",
  },
  {
    name: "Prisma",
    icon: "◆",
    description: "ORM type-safe para gerenciamento de banco de dados robusto",
  },
  {
    name: "PostgreSQL",
    icon: "🐘",
    description:
      "Banco de dados relacional enterprise-grade para dados seguros",
  },
  {
    name: "Auth Segura",
    icon: "🔐",
    description: "Sistema de autenticação com criptografia e tokens seguros",
  },
  {
    name: "Pagamentos",
    icon: "💳",
    description: "Integração com gateways de pagamento para assinaturas",
  },
  {
    name: "Cloud Deploy",
    icon: "☁️",
    description:
      "Infraestrutura escalável com uptime garantido e backups automáticos",
  },
]

const TechSection = () => {
  return (
    <section className="bg-surface-1/40 py-24">
      <div className="section-divider mb-24" />
      <div className="container mx-auto px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="text-gold mb-4 inline-block text-xs font-semibold uppercase tracking-widest">
            Tecnologia de ponta
          </span>
          <h2 className="mb-4 text-4xl font-bold leading-tight md:text-5xl">
            Construído com as melhores tecnologias do mercado
          </h2>
          <p className="text-lg text-muted-foreground">
            Não é um site simples. É uma plataforma robusta, segura e escalável
            — pronta para crescer com sua barbearia.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {techStack.map((tech, i) => (
            <div key={i} className="card-premium rounded-2xl p-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="text-2xl">{tech.icon}</span>
                <h3 className="text-base font-bold">{tech.name}</h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {tech.description}
              </p>
            </div>
          ))}
        </div>

        {/* Trust bar */}
        <div className="bg-surface-1 mx-auto mt-12 grid max-w-3xl grid-cols-3 gap-6 rounded-2xl border border-border p-6">
          {[
            { value: "99.9%", label: "Uptime garantido" },
            { value: "SSL", label: "Criptografia total" },
            { value: "LGPD", label: "Conformidade com dados" },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className="text-gold text-xl font-bold">{item.value}</div>
              <div className="text-xs text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TechSection
