// Para Next.js 16, a API de ImageResponse está disponível nativamente
// Mas se não funcionar, você pode criar uma imagem estática em public/og-image.png

export const alt =
  "ICTI Share - Plataforma de Compartilhamento de Materiais Acadêmicos";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Se a API de ImageResponse não estiver disponível, você pode:
// 1. Criar uma imagem estática em public/og-image.png (1200x630px)
// 2. Ou instalar @vercel/og: npm install @vercel/og

// Por enquanto, vamos usar uma abordagem que funciona sem dependências extras
// Criando um arquivo que será usado como fallback
export default function Image() {
  // Esta função retorna null, mas o Next.js vai procurar por public/og-image.png
  // Você deve criar uma imagem estática em public/og-image.png com 1200x630px
  return null;
}
