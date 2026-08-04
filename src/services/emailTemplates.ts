import { NotifType } from "./notificationService";

export type Status = "success" | "rejected" | "delivered" | "pending" | "approved";

interface TemplateProps {
  name: string;
  message: string;
  type: NotifType;
  status?: Status;
}

export function transformMessage(text: string) {
  for (const word of text.split(" ")) {
    if (/^\d+$/.test(word)) {
      return text.replace(
        `${word} puntos`,
        `<span style="
          background-color: #fbbf24;
          margin: 0px;
          color: #ffffff;
          padding: 5px 5px 5px 5px;
          font-size: 16px;
          letter-spacing: 1px;
          font-weight: semi-bold;
          border-radius: 999px;
        ">${word} puntos</span>`,
      );
    }
  }
  return text;
}

const THEME_CONFIG: Record<NotifType, { label: string }> = {
  success: { label: "¡Logro desbloqueado!" },
  warning: { label: "Atención requerida ⚠️" },
  info: { label: "Información extra" },
};

const buildImage = (icon: string, size = 20) => `
  <img
    src="https://storage.googleapis.com/adco_rewards_public/logos/${icon}"
    width="${size}"
    height="${size}"
    style="display:block; border-radius:9999px; background: #ffffff;"
    alt="icon"
  />
`;

const STATUS_STYLES: Record<
  Status,
  { bg: string; border: string; color: string; text: string; icon: string }
> = {
  approved: {
    bg: "#052e16",
    border: "#22c55e",
    color: "#bbf7d0",
    text: "Tu solicitud ha sido aprobada correctamente.",
    icon: "circle-check-solid.png",
  },
  pending: {
    bg: "#422006",
    border: "#f59e0b",
    color: "#fde68a",
    text: "⏳ Tu solicitud está en proceso de revisión.",
    icon: "circle-info-solid.png",
  },
  delivered: {
    bg: "#0c4a6e",
    border: "#0ea5e9",
    color: "#bae6fd",
    text: "📦 Tu recompensa ya fue entregada.",
    icon: "circle-info-solid.png",
  },
  rejected: {
    bg: "#450a0a",
    border: "#ef4444",
    color: "#fecaca",
    text: "Tu solicitud fue rechazada.",
    icon: "circle-xmark-solid.png",
  },
  success: {
    bg: "#052e16",
    border: "#22c55e",
    color: "#bbf7d0",
    text: "Operación exitosa.",
    icon: "circle-check-solid.png",
  },
};

function resolveMainIcon(type: NotifType, status?: Status): string {
  if (type !== "info") {
    return `<span style="font-size:80px;">🏆</span>`;
  }
  const icon = status ? STATUS_STYLES[status].icon : "circle-info-solid.png";
  return buildImage(icon, 80);
}

function buildInfoExtra(status?: Status): string {
  if (!status) return "";

  const s = STATUS_STYLES[status];

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:40px; margin-bottom:20px;">
      <tr>
        <td style="
          background:${s.bg};
          border-left:4px solid ${s.border};
          padding:12px;
          color:${s.color};
          font-size:14px;
        ">
          ${s.text}
        </td>
      </tr>
    </table>
  `;
}

const Template = ({ name, message, type, status }: TemplateProps) => {
  const theme = THEME_CONFIG[type ?? "info"];
  const tag = buildInfoExtra(status);
  const image = resolveMainIcon(type, status);

  return `<!doctype html>
<html>
  <body
    style="margin: 0; background: #111827; font-family: Arial, sans-serif; border-radius: 10px; border: 1px solid #1f2937;"
  >
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table
            width="600"
            cellpadding="0"
            cellspacing="0"
            style="margin-top: 20px"
          >
            <!-- LOGO -->
            <tr>
              <td style="text-align:center; padding:0 0 0 0;">
                <img
                  src="https://storage.googleapis.com/adco_rewards_public/logos/TROFEO2.png"
                  width="160"
                  style="display:block; margin:0 auto;"
                  alt="ADCO Rewards"
                />
              </td>
            </tr>

            <!-- HEADER -->
            <tr>
              <td style="text-align:center; padding:0 0 20px 0;">
                <h1
                  style="
                    color:#fbbf24;
                    margin:0;
                    font-size:26px;
                    letter-spacing:1px;
                    line-height:1.2;
                  "
                >
                  ADCO REWARDS
                </h1>

                <p style="
                  color:#94a3b8;
                  margin:4px 0 0 0;
                  font-size:14px;
                ">
                  Sistema de recompensas
                </p>
              </td>
            </tr>

            <!-- CARD -->
            <tr>
              <td
                style="
                  background: #111827;
                  padding: 40px;
                  border-radius: 10px;
                  border: 1px solid #1f2937;
                "
              >
                <table cellpadding="0" cellspacing="0" style="margin-top:30px; margin-bottom:30px;">
                  <tr>
                    <td
                      style="
                        background:#22c55e;
                        border:1px solid #fbbf24;
                        border-radius:999px;
                        padding:8px 14px;
                      "
                    >
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td width="6"></td>
                          <td
                            style="
                              color: #ffffff;
                              font-size:13px;
                              font-weight:600;
                              vertical-align:middle;
                            "
                          >
                            ${theme.label}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <!-- TEXTO -->
                    <td style="vertical-align: middle; padding-right: 10px;">
                      <h2 style="color: #ffffff; margin:0; font-size:22px;">
                        Hola ${name}
                      </h2>

                      <p style="color: #d1d5db; margin-top:15px; line-height:1.6;">
                        ${message}
                      </p>
                    </td>

                    <!-- ICONO -->
                    <td
                      width="80"
                      style="text-align:right; vertical-align:middle;"
                    >
                      <div style="display:inline-block;">
                        ${image}
                      </div>
                    </td>
                  </tr>
                </table>

                ${tag}

                <!-- BUTTON -->
                <table style="width: 100%; text-align: center; margin-top:30px; margin-bottom:30px;" align="center" cellpadding="0" cellspacing="0">
                  <tr>
                    <td bgcolor="#fbbf24" style="border-radius:6px;">
                      <a href="https://www.grupoadcorewards.com/dashboard"
                        style="
                          display:block;
                          padding:14px 24px;
                          color: #ffffff;
                          font-weight:bold;
                          text-decoration:none;
                        ">
                        Ver en plataforma
                      </a>
                    </td>
                  </tr>
                </table>

                <hr
                  style="
                    margin: 30px 0;
                    border: none;
                    border-top: 1px solid #eee;
                  "
                />

                <!-- CONTACTANOS -->
                <div style="margin-top: 30px">
                  <p
                    style="color: #9ca3af; font-size: 14px; margin-bottom: 8px"
                  >
                    ¿Necesitas ayuda?
                  </p>

                  <a
                    href="mailto:systems.adco@gmail.com"
                    style="
                      color: #fbbf24;
                      text-decoration: none;
                      font-weight: 600;
                    "
                  >
                    Contáctanos
                  </a>
                </div>
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="text-align: center; padding: 20px">
                <p style="color: #6b7280; font-size: 12px">
                  © ADCO Rewards — Sistema de incentivos
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
};

export function formatTemplate({
  type,
  name,
  message,
  status,
}: {
  type: NotifType;
  message: string;
  name: string;
  status?: Status;
}) {
  return Template({
    name,
    message: transformMessage(message),
    type,
    status,
  });
}
