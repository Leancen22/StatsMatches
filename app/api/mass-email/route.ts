// app/api/mass-email/route.ts
import { NextResponse } from "next/server";
import Mailjet from "node-mailjet";

// Usamos apiConnect (disponible en la versión 3.3.3 o superior de node-mailjet)
const mailjetClient = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC || "",
  process.env.MJ_APIKEY_PRIVATE || ""
);

export async function POST(request: Request) {
  try {
    const { toEmails, toName, subject, text, html } = await request.json();

    // Se espera que "toEmails" sea una cadena con correos separados por coma
    const emailList = toEmails
      .split(",")
      .map((email: string) => email.trim())
      .filter((email: string) => email.length > 0);

    if (emailList.length === 0) {
      return NextResponse.json(
        { success: false, error: "No se proporcionaron direcciones de correo válidas" },
        { status: 400 }
      );
    }

    // Construimos el arreglo de destinatarios para Mailjet
    const toArray = emailList.map((email: string) => ({
      Email: email,
      Name: toName // Puedes ajustar este campo si tienes nombres individuales
    }));

    const result = await mailjetClient
      .post("send", { version: "v3.1" })
      .request({
        Messages: [
          {
            From: {
              Email: "leandromesaprofesional@gmail.com", // Reemplaza con tu correo verificado en Mailjet
              Name: "HandBall Coaching"
            },
            To: toArray,
            Subject: subject,
            TextPart: text,
            HTMLPart: html,
            CustomID: "MassEmail"
          }
        ]
      });

    return NextResponse.json({ success: true, body: result.body });
  } catch (error: any) {
    console.error("Error al enviar correo en masa:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
