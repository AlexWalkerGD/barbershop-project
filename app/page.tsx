/* eslint-disable @typescript-eslint/no-explicit-any */
import Header from "@/components/header"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Hero from "@/components/section/Hero"
import ProblemSection from "@/components/section/ProblemSection"
import SolutionSection from "@/components/section/SolutionSection"
import BenefitsSection from "@/components/section/BenefitsSection"
import TechSection from "@/components/section/TechSection"
import CTASection from "@/components/section/CTASection"

export const dynamic = "force-dynamic"

const Home = async () => {
  const session = await getServerSession(authOptions)

  if (session?.user.role === "ADMIN") {
    redirect("/dashboard")
  }

  return (
    <div>
      {/* HEADER */}
      <Header />

      <main>
        <Hero />
        <ProblemSection />
        <SolutionSection />
        <BenefitsSection />
        <TechSection />
        <CTASection />
      </main>
    </div>
  )
}

export default Home
