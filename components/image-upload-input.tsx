"use client"

import Image from "next/image"
import { ChangeEvent, useState } from "react"
import { ImageIcon, LoaderCircleIcon, UploadIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "./ui/button"

interface ImageUploadInputProps {
  value: string
  onChange: (value: string) => void
  inputId: string
  label?: string
  onUploadingChange?: (value: boolean) => void
}

const MAX_FILE_SIZE = 5 * 1024 * 1024

const ImageUploadInput = ({
  value,
  onChange,
  inputId,
  label = "Imagem da barbearia",
  onUploadingChange,
}: ImageUploadInputProps) => {
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem válido")
      event.target.value = ""
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("A imagem deve ter no máximo 5MB")
      event.target.value = ""
      return
    }

    try {
      setIsUploading(true)
      onUploadingChange?.(true)

      const signatureResponse = await fetch("/api/cloudinary/signature", {
        method: "POST",
      })

      if (!signatureResponse.ok) {
        throw new Error("Falha ao gerar a assinatura do upload")
      }

      const { cloudName, apiKey, folder, timestamp, signature } =
        await signatureResponse.json()

      const formData = new FormData()
      formData.append("file", file)
      formData.append("api_key", apiKey)
      formData.append("folder", folder)
      formData.append("timestamp", String(timestamp))
      formData.append("signature", signature)

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      )

      if (!uploadResponse.ok) {
        throw new Error("Falha ao enviar imagem para o Cloudinary")
      }

      const uploadData = await uploadResponse.json()

      if (!uploadData.secure_url) {
        throw new Error("O Cloudinary não retornou a URL da imagem")
      }

      onChange(uploadData.secure_url)
      toast.success("Imagem enviada com sucesso")
    } catch (error) {
      console.error(error)
      toast.error("Não foi possí­vel enviar a imagem")
    } finally {
      setIsUploading(false)
      onUploadingChange?.(false)
      event.target.value = ""
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-lg border border-dashed border-border p-3">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary">
          {value ? (
            <Image
              src={value}
              alt={label}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">
            JPG, PNG ou WEBP até 5MB
          </p>
        </div>

        <Button type="button" variant="outline" asChild disabled={isUploading}>
          <label htmlFor={inputId} className="cursor-pointer">
            {isUploading ? (
              <LoaderCircleIcon className="h-4 w-4 animate-spin" />
            ) : (
              <UploadIcon className="h-4 w-4" />
            )}
            {isUploading ? "Enviando" : "Upload"}
          </label>
        </Button>
      </div>

      <input
        id={inputId}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFileChange}
      />
    </div>
  )
}

export default ImageUploadInput
