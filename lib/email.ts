import { Resend } from "resend";

// Inicializar Resend apenas se a API key estiver configurada
let resend: Resend | null = null;

if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
} else {
  console.warn("⚠️ RESEND_API_KEY não configurada. Emails não serão enviados.");
}

/**
 * Envia email de recuperação de senha
 */
export async function sendPasswordResetEmail({
  email,
  token,
  name,
}: {
  email: string;
  token: string;
  name?: string | null;
}): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    return {
      success: false,
      error: "Serviço de email não configurado",
    };
  }

  // Determinar URL base automaticamente baseado no ambiente
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.AUTH_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  // Usar domínio de teste do Resend se não houver domínio próprio configurado
  // resend.dev funciona sem verificação para desenvolvimento e testes
  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const fromName = process.env.RESEND_FROM_NAME || "ICTI Share";

  // Log de debug (apenas em desenvolvimento)
  if (process.env.NODE_ENV === "development") {
    console.log("📧 Tentando enviar email:", {
      from: `${fromName} <${fromEmail}>`,
      to: email,
      hasApiKey: !!process.env.RESEND_API_KEY,
      apiKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 7),
    });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [email],
      subject: "Recuperação de Senha - ICTI Share",
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Recuperação de Senha</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">ICTI Share</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <h2 style="color: #1f2937; margin-top: 0;">Recuperação de Senha</h2>
            <p>Olá${name ? ` ${name}` : ""},</p>
            <p>Recebemos uma solicitação para redefinir a senha da sua conta no ICTI Share.</p>
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Redefinir Senha</a>
            </div>
            <p style="font-size: 14px; color: #6b7280;">Ou copie e cole este link no seu navegador:</p>
            <p style="font-size: 12px; color: #9ca3af; word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px;">${resetUrl}</p>
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
              <strong>Importante:</strong> Este link expira em 1 hora. Se você não solicitou esta recuperação, ignore este email.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="font-size: 12px; color: #9ca3af; margin: 0;">
              Este é um email automático, por favor não responda.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        Recuperação de Senha - ICTI Share
        
        Olá${name ? ` ${name}` : ""},
        
        Recebemos uma solicitação para redefinir a senha da sua conta no ICTI Share.
        
        Clique no link abaixo para criar uma nova senha:
        ${resetUrl}
        
        Este link expira em 1 hora. Se você não solicitou esta recuperação, ignore este email.
        
        ---
        Este é um email automático, por favor não responda.
      `,
    });

    if (error) {
      console.error("❌ Erro detalhado do Resend:", {
        error,
        code: error?.message || "unknown",
        name: error?.name || "unknown",
      });

      // Mensagens de erro mais específicas
      let errorMessage = "Erro ao enviar email";

      if (
        error?.message?.includes("403") ||
        error?.message?.includes("Forbidden")
      ) {
        errorMessage =
          "Acesso negado. Verifique sua API Key e permissões do Resend.";
      } else if (
        error?.message?.includes("Invalid") ||
        error?.message?.includes("invalid")
      ) {
        errorMessage =
          "Email inválido ou não autorizado. Se usar resend.dev, adicione o email em 'Test Recipients'.";
      } else if (
        error?.message?.includes("domain") ||
        error?.message?.includes("Domain")
      ) {
        errorMessage =
          "Domínio não autorizado. Verifique o email remetente (RESEND_FROM_EMAIL).";
      } else if (error?.message) {
        errorMessage = `Erro: ${error.message}`;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    // Log de sucesso
    if (process.env.NODE_ENV === "development") {
      console.log("✅ Email enviado com sucesso:", data);
    }

    return { success: true };
  } catch (error) {
    console.error("❌ Erro ao enviar email (catch):", error);

    let errorMessage = "Erro ao enviar email";

    if (error instanceof Error) {
      if (
        error.message.includes("403") ||
        error.message.includes("Forbidden")
      ) {
        errorMessage = "Acesso negado. Verifique sua API Key do Resend.";
      } else if (error.message.includes("Invalid API key")) {
        errorMessage = "API Key inválida. Verifique RESEND_API_KEY no .env";
      } else {
        errorMessage = `Erro: ${error.message}`;
      }
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}
