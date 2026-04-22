import { db } from "@/lib/prisma"

export type NewClient = {
  id: string
  name: string
  serviceName: string
  barbershopName: string
  createdAt: string
  isManual: boolean
}

type BookingWithClient = Awaited<ReturnType<typeof getOwnerBookings>>[number]

const MANUAL_BOOKING_EMAIL_DOMAIN = "@tempus.local"

async function getOwnerBookings(ownerId: string) {
  return db.booking.findMany({
    where: {
      service: {
        barbershop: {
          ownerId,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      userId: true,
      createdAt: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      service: {
        select: {
          name: true,
          barbershop: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  })
}

function getFirstBookingPerClient(bookings: BookingWithClient[]) {
  const firstBookingByUserId = new Map<string, BookingWithClient>()

  for (const booking of bookings) {
    if (!firstBookingByUserId.has(booking.userId)) {
      firstBookingByUserId.set(booking.userId, booking)
    }
  }

  return Array.from(firstBookingByUserId.values()).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  )
}

export async function getNewClients(ownerId: string): Promise<NewClient[]> {
  const bookings = await getOwnerBookings(ownerId)

  return getFirstBookingPerClient(bookings)
    .slice(0, 3)
    .map((booking) => ({
      id: booking.userId,
      name: booking.user.name?.trim() || "Cliente sem nome",
      serviceName: booking.service.name,
      barbershopName: booking.service.barbershop.name,
      createdAt: booking.createdAt.toISOString(),
      isManual: booking.user.email.includes(MANUAL_BOOKING_EMAIL_DOMAIN),
    }))
}
