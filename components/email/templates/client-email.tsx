import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components"

type CustomerBookingConfirmationProps = {
  customerName: string
  barberName: string
  shopName: string
  date: string
  time: string
}

export function CustomerBookingConfirmation({
  customerName,
  barberName,
  shopName,
  date,
  time,
}: CustomerBookingConfirmationProps) {
  return (
    <Html>
      <Head />

      <Preview>Seu agendamento foi confirmado 💈</Preview>

      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Agendamento confirmado 💈</Heading>

          <Text style={paragraph}>Olá, {customerName} 👋</Text>

          <Text style={paragraph}>Seu horário foi confirmado com sucesso.</Text>

          <Section style={infoContainer}>
            <Text style={infoText}>
              📅 <strong>Data:</strong> {date}
            </Text>

            <Text style={infoText}>
              ⏰ <strong>Horário:</strong> {time}
            </Text>

            <Text style={infoText}>
              💈 <strong>Barbeiro:</strong> {barberName}
            </Text>

            <Text style={infoText}>
              📍 <strong>Local:</strong> {shopName}
            </Text>
          </Section>

          <Hr style={divider} />

          <Text style={footer}>Estamos te esperando ✂️</Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#f6f9fc",
  padding: "40px 0",
  fontFamily: "Arial, sans-serif",
}

const container = {
  backgroundColor: "#FFFFFF",
  borderRadius: "12px",
  padding: "32px",
  maxWidth: "500px",
  margin: "0 auto",
}

const heading = {
  color: "#c39322",
  fontSize: "28px",
  marginBottom: "24px",
}

const paragraph = {
  color: "#575E6B",
  fontSize: "16px",
  lineHeight: "26px",
}

const infoContainer = {
  backgroundColor: "#f3efe7",
  borderRadius: "10px",
  padding: "20px",
  marginTop: "24px",
}

const infoText = {
  color: "#000000",
  fontSize: "15px",
  margin: "10px 0",
}

const divider = {
  borderColor: "#3f3f46",
  margin: "32px 0",
}

const footer = {
  color: "#a1a1aa",
  fontSize: "14px",
}
