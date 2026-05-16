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

type CustomerBookingReminderProps = {
  customerName: string
  barberName: string
  date: string
  time: string
}

export function CustomerBookingReminder({
  customerName,
  barberName,
  date,
  time,
}: CustomerBookingReminderProps) {
  return (
    <Html>
      <Head />

      <Preview>Lembrete do seu horário amanhã 💈</Preview>

      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Lembrete de agendamento 💈</Heading>

          <Text style={paragraph}>Olá, {customerName} 👋</Text>

          <Text style={paragraph}>
            Esse é um lembrete do seu próximo horário.
          </Text>

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
          </Section>

          <Hr style={divider} />

          <Text style={footer}>Nos vemos em breve ✂️</Text>
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
