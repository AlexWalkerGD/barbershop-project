import { createHash } from "crypto"

import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"

export async function POST() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return Response.json({ error: "Não autenticado" }, { status: 401 })
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || "barbershops"

  if (!cloudName || !apiKey || !apiSecret) {
    return Response.json(
      { error: "Cloudinary não configurado corretamente" },
      { status: 500 },
    )
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const signaturePayload = `folder=${folder}&timestamp=${timestamp}${apiSecret}`
  const signature = createHash("sha1").update(signaturePayload).digest("hex")

  return Response.json({
    cloudName,
    apiKey,
    folder,
    timestamp,
    signature,
  })
}
