"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function PaymentSuccess() {
  const router = useRouter()

  useEffect(() => {
    const refreshSession = async () => {
      router.refresh()
      router.push("/")
    }

    refreshSession()
  }, [])

  return <p>Atualizando sua assinatura...</p>
}
