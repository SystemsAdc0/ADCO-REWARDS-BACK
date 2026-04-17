interface Props {
  to: string;
  message: string;
}

export async function sendEmail({ to, message }: Props) {
  try {
    if (process.env.NODE_ENV === "production") {
      if (!to || !message) {
        throw Error("falta de identificadores");
      }
      await fetch(`${process.env.N8N_URL}`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          "x-api-key": process.env.N8N_KEY,
        },
        body: JSON.stringify({
          from: "AdcoRewards",
          to: to,
          subject: "Adco Rewards",
          message: message,
        }),
      });
    } else {
      console.log("el correo no se envia estando en desarrollo");
    }
  } catch (error) {
    console.error(error);
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
