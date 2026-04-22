interface Props {
  to: string;
  message: string;
}

export async function sendEmail({ to, message }: Props) {
  if (process.env.NODE_ENV !== "production") {
    console.log("el correo no se envia estando en desarrollo");
    return;
  }

  if (!to || !message) {
    throw new Error("falta de identificadores");
  }

  const response = await fetch(`${process.env.N8N_URL}`, {
    method: "POST",
    headers: {
      "Content-type": "application/json",
      "x-api-key": process.env.N8N_KEY ?? "",
    },
    body: JSON.stringify({
      from: "AdcoRewards",
      to,
      subject: "Adco Rewards",
      message,
    }),
  });

  if (!response.ok) {
    throw new Error(`Error al enviar correo: ${response.status} ${response.statusText}`);
  }
}

// $ curl -X POST https://auto.adco.adi.mx/webhook/send-email \
//   -H "Content-Type: application/json" \
//   -H "x-api-key: adc0#CDA" \
//   -d '{
//     "from": "AdcoRewards",
//     "to": "jorgealbertolejim@gmail.com",
//     "subject": "Asunto del correo",
//     "message": "prueba de correo"
//   }'
