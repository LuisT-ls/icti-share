import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { join } from "path";
import { existsSync, mkdirSync, writeFileSync } from "fs";

const prisma = new PrismaClient();

// Senha padrão para todos os usuários de seed: "Senha123!"
// Atende aos requisitos: 8+ caracteres, maiúscula, minúscula, número e símbolo
const DEFAULT_PASSWORD = "Senha123!";

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // Limpar dados existentes (opcional - descomente se quiser resetar)
  // console.log("🗑️  Limpando dados existentes...");
  // await prisma.download.deleteMany();
  // await prisma.material.deleteMany();
  // await prisma.user.deleteMany();

  // 1. Criar usuários
  console.log("👥 Criando usuários...");

  const adminPasswordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const userPasswordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@icti.edu.br" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@icti.edu.br",
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
    },
  });

  const user1 = await prisma.user.upsert({
    where: { email: "joao.silva@icti.edu.br" },
    update: {},
    create: {
      name: "João Silva",
      email: "joao.silva@icti.edu.br",
      passwordHash: userPasswordHash,
      role: UserRole.USUARIO,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "maria.santos@icti.edu.br" },
    update: {},
    create: {
      name: "Maria Santos",
      email: "maria.santos@icti.edu.br",
      passwordHash: userPasswordHash,
      role: UserRole.USUARIO,
    },
  });

  console.log(
    `✅ Usuários criados: ${admin.name}, ${user1.name}, ${user2.name}`
  );

  // 2. Criar diretório de uploads se não existir
  const uploadDir =
    process.env.RAILWAY_VOLUME_PATH || process.env.UPLOAD_DIR || "./uploads";

  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
    console.log(`📁 Diretório de uploads criado: ${uploadDir}`);
  }

  // 3. Criar materiais de exemplo
  console.log("📚 Criando materiais de exemplo...");

  const materialsData = [
    {
      title: "Apostila de Cálculo Diferencial e Integral I",
      description:
        "Material completo sobre limites, derivadas e integrais. Inclui exemplos práticos e exercícios resolvidos.",
      course: "Engenharia de Software",
      discipline: "Cálculo I",
      semester: "2024.1",
      type: "Apostila",
      uploadedBy: user1.id,
      downloadsCount: 45,
    },
    {
      title: "Prova de Álgebra Linear - 2024.1",
      description: "Prova aplicada no primeiro semestre de 2024 com gabarito.",
      course: "Engenharia de Software",
      discipline: "Álgebra Linear",
      semester: "2024.1",
      type: "Prova",
      uploadedBy: user1.id,
      downloadsCount: 32,
    },
    {
      title: "Resumo de Estruturas de Dados",
      description:
        "Resumo completo sobre listas, pilhas, filas, árvores e grafos. Ideal para revisão antes de provas.",
      course: "Ciência da Computação",
      discipline: "Estruturas de Dados",
      semester: "2024.1",
      type: "Resumo",
      uploadedBy: user2.id,
      downloadsCount: 67,
    },
    {
      title: "Slides de Arquitetura de Computadores",
      description:
        "Apresentações em PDF sobre processadores, memória e organização de computadores.",
      course: "Engenharia de Software",
      discipline: "Arquitetura de Computadores",
      semester: "2023.2",
      type: "Slides",
      uploadedBy: admin.id,
      downloadsCount: 28,
    },
    {
      title: "Lista de Exercícios - Programação Orientada a Objetos",
      description:
        "Exercícios práticos sobre classes, herança, polimorfismo e encapsulamento em Java.",
      course: "Engenharia de Software",
      discipline: "Programação Orientada a Objetos",
      semester: "2024.1",
      type: "Lista de Exercícios",
      uploadedBy: user2.id,
      downloadsCount: 89,
    },
    {
      title: "Material de Banco de Dados",
      description:
        "Conceitos de modelagem, SQL, normalização e transações. Inclui exemplos práticos.",
      course: "Ciência da Computação",
      discipline: "Banco de Dados",
      semester: "2023.2",
      type: "Material de Aula",
      uploadedBy: user1.id,
      downloadsCount: 56,
    },
    {
      title: "Prova de Engenharia de Software - 2024.1",
      description: "Avaliação sobre metodologias ágeis, requisitos e testes.",
      course: "Engenharia de Software",
      discipline: "Engenharia de Software",
      semester: "2024.1",
      type: "Prova",
      uploadedBy: admin.id,
      downloadsCount: 41,
    },
    {
      title: "Resumo de Redes de Computadores",
      description:
        "Resumo sobre protocolos TCP/IP, camadas OSI, roteamento e segurança em redes.",
      course: "Engenharia de Software",
      discipline: "Redes de Computadores",
      semester: "2024.1",
      type: "Resumo",
      uploadedBy: user2.id,
      downloadsCount: 73,
    },
    {
      title: "Apostila de Inteligência Artificial",
      description:
        "Material sobre algoritmos de busca, aprendizado de máquina e redes neurais.",
      course: "Ciência da Computação",
      discipline: "Inteligência Artificial",
      semester: "2023.2",
      type: "Apostila",
      uploadedBy: user1.id,
      downloadsCount: 52,
    },
    {
      title: "Slides de Compiladores",
      description:
        "Apresentações sobre análise léxica, sintática, semântica e geração de código.",
      course: "Ciência da Computação",
      discipline: "Compiladores",
      semester: "2024.1",
      type: "Slides",
      uploadedBy: admin.id,
      downloadsCount: 34,
    },
  ];

  const createdMaterials = [];

  for (const materialData of materialsData) {
    // Criar arquivo PDF mock
    const filename = `${materialData.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
    const filePath = join(uploadDir, filename);

    // Criar conteúdo PDF mock (apenas para seed - não é um PDF real)
    const pdfBody = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(${materialData.title}) Tj
ET
endstream
endobj
xref
0 5
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
`;
    const mockPdfContent = pdfBody + pdfBody.length + "\n%%EOF";

    writeFileSync(filePath, mockPdfContent);

    const material = await prisma.material.create({
      data: {
        title: materialData.title,
        description: materialData.description,
        filename: filename,
        path: filePath,
        mimeType: "application/pdf",
        size: Buffer.byteLength(mockPdfContent),
        uploadedById: materialData.uploadedBy,
        course: materialData.course,
        discipline: materialData.discipline,
        semester: materialData.semester,
        type: materialData.type,
        downloadsCount: materialData.downloadsCount,
        createdAt: new Date(
          Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
        ), // Últimos 90 dias
      },
    });

    createdMaterials.push({
      material,
      downloadsCount: materialData.downloadsCount,
    });
  }

  console.log(`✅ ${createdMaterials.length} materiais criados`);

  // 4. Criar downloads históricos
  console.log("📥 Criando downloads históricos...");

  const users = [admin, user1, user2];
  const ips = [
    "192.168.1.100",
    "192.168.1.101",
    "10.0.0.50",
    "172.16.0.10",
    null,
  ];

  let totalDownloads = 0;

  for (const { material, downloadsCount } of createdMaterials) {
    // Criar downloads distribuídos ao longo do tempo
    const downloadsToCreate = downloadsCount;

    for (let i = 0; i < downloadsToCreate; i++) {
      // Data aleatória entre criação do material e agora
      const materialDate = material.createdAt.getTime();
      const now = Date.now();
      const randomDate = new Date(
        materialDate + Math.random() * (now - materialDate)
      );

      // Usuário aleatório (ou null para downloads anônimos)
      const randomUser =
        Math.random() > 0.3
          ? users[Math.floor(Math.random() * users.length)]
          : null;

      // IP aleatório
      const randomIp = ips[Math.floor(Math.random() * ips.length)];

      await prisma.download.create({
        data: {
          materialId: material.id,
          userId: randomUser?.id || null,
          ip: randomIp,
          createdAt: randomDate,
        },
      });

      totalDownloads++;
    }
  }

  console.log(`✅ ${totalDownloads} downloads históricos criados`);

  // 5. Resumo
  console.log("\n📊 Resumo do seed:");
  console.log(`   👥 Usuários: 3 (1 admin, 2 usuários)`);
  console.log(`   📚 Materiais: ${createdMaterials.length}`);
  console.log(`   📥 Downloads: ${totalDownloads}`);
  console.log("\n🔑 Credenciais de acesso:");
  console.log(`   Admin: admin@icti.edu.br / ${DEFAULT_PASSWORD}`);
  console.log(`   Usuário 1: joao.silva@icti.edu.br / ${DEFAULT_PASSWORD}`);
  console.log(`   Usuário 2: maria.santos@icti.edu.br / ${DEFAULT_PASSWORD}`);
  console.log("\n✅ Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro ao executar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
