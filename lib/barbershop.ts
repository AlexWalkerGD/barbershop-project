// types/barbershop.ts
export interface UserInfo {
  id: string
  name: string | null
  image: string | null
  email: string | null
}

export interface Employee {
  id: string
  user: UserInfo
}

export interface BarbershopBase {
  id: string
  name: string
  address: string
  services?: { id: string; name: string; price: number }[]
}

export interface BarbershopWithRelations extends BarbershopBase {
  phones: string[]
  description: string
  imageUrl: string
  createdAt: Date
  updatedAt: Date
  ownerId: string | null
  owner?: UserInfo
  employees?: Employee[]
}

export interface BarbershopItemProps {
  barbershop: BarbershopWithRelations
  onSuccess: () => void
}

export interface SelectableEmployee {
  id: string
  role: "OWNER" | "EMPLOYEE"
  name: string | null
  image: string | null
}
