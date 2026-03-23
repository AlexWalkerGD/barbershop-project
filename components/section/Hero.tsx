import { ArrowRight, Play } from "lucide-react"
import Image from "next/image"
import dashboardMockup from "@/public/BannerScreen.png"

const Hero = () => {
  return (
    <section className="relative min-h-screen overflow-hidden pt-16">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="bg-gold/5 absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full blur-[120px]" />
        <div className="bg-gold/3 absolute bottom-0 left-0 h-[400px] w-[600px] rounded-full blur-[100px]" />
      </div>

      <div className="container relative mx-auto px-6 pb-16 pt-20">
        {/* Badge */}
        <div className="mb-8 flex justify-center">
          <span className="border-gold/30 bg-gold/10 text-gold inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest">
            <span className="bg-gold h-1.5 w-1.5 animate-pulse rounded-full" />
            Sistema de Agendamento para Barbearias
          </span>
        </div>

        {/* Headline */}
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-5xl font-bold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl">
            Transforme sua barbearia em um{" "}
            <span className="text-gradient-gold">negócio organizado</span> e
            previsível.
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Sistema completo de agendamento online com controle por barbeiro,
            horários automáticos e assinaturas integradas. Chega de confusão no
            WhatsApp.
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="/signature"
              rel="noopener noreferrer"
              className="bg-gold glow-gold group inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-bold text-primary-foreground transition-all duration-300 hover:scale-[1.02] hover:opacity-90"
            >
              Assinar Agora
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>

            <a
              href="#solucao"
              className="hover:border-gold/40 hover:bg-surface-1 inline-flex items-center gap-2 rounded-xl border border-border px-8 py-4 text-base font-medium text-foreground transition-all duration-300"
            >
              <div className="border-gold/50 flex h-6 w-6 items-center justify-center rounded-full border">
                <Play className="fill-gold text-gold h-3 w-3" />
              </div>
              Ver como funciona
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-14 flex max-w-2xl flex-wrap justify-center gap-x-12 gap-y-4">
          {[
            { value: "100%", label: "Agenda automatizada" },
            { value: "0", label: "Conflitos de horário" },
            { value: "24/7", label: "Disponível online" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-gold text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Mockup */}
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="glow-gold relative rounded-2xl border border-border p-1">
            <div className="from-gold/10 pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b to-transparent" />
            {/* Browser chrome */}
            <div className="bg-surface-2 flex items-center gap-1.5 rounded-t-xl px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-500/70" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
              <div className="h-3 w-3 rounded-full bg-green-500/70" />
              <div className="bg-surface-3 mx-4 flex-1 rounded-md px-3 py-1 text-xs text-muted-foreground">
                tempus.today/
              </div>
            </div>
            <Image
              src={dashboardMockup}
              alt="Dashboard Tempus – Sistema de Agendamento para Barbearias"
              className="w-full rounded-b-xl object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
