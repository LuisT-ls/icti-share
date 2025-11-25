import { describe, it, expect } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { MaterialCard } from "@/components/MaterialCard";

// Mock Next.js Link
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe("MaterialCard", () => {
  const mockMaterial = {
    id: "test-id",
    title: "Apostila de Cálculo I",
    description: "Material completo sobre cálculo diferencial",
    course: "Engenharia",
    discipline: "Cálculo I",
    semester: "2024.1",
    type: "Apostila",
    downloadsCount: 42,
    createdAt: new Date("2024-01-15"),
    uploadedBy: {
      name: "João Silva",
      email: "joao@example.com",
    },
  };

  it("deve renderizar o título do material", () => {
    render(<MaterialCard {...mockMaterial} />);
    expect(screen.getByText("Apostila de Cálculo I")).toBeInTheDocument();
  });

  it("deve renderizar a descrição quando variant é default", () => {
    render(<MaterialCard {...mockMaterial} variant="default" />);
    expect(
      screen.getByText("Material completo sobre cálculo diferencial")
    ).toBeInTheDocument();
  });

  it("não deve renderizar a descrição quando variant é compact", () => {
    render(<MaterialCard {...mockMaterial} variant="compact" />);
    expect(
      screen.queryByText("Material completo sobre cálculo diferencial")
    ).not.toBeInTheDocument();
  });

  it("deve renderizar o número de downloads", () => {
    render(<MaterialCard {...mockMaterial} />);
    expect(screen.getByText("42 downloads")).toBeInTheDocument();
  });

  it("deve renderizar informações do uploader quando variant é default", () => {
    render(<MaterialCard {...mockMaterial} variant="default" />);
    expect(screen.getByText(/Por: João Silva/)).toBeInTheDocument();
  });

  it("não deve renderizar informações do uploader quando variant é compact", () => {
    render(<MaterialCard {...mockMaterial} variant="compact" />);
    expect(screen.queryByText(/Por:/)).not.toBeInTheDocument();
  });

  it("deve renderizar link para detalhes do material", () => {
    render(<MaterialCard {...mockMaterial} />);
    const link = screen.getByRole("link", { name: /Ver Detalhes/i });
    expect(link).toHaveAttribute("href", "/material/test-id");
  });

  it("deve renderizar metadata quando disponível", () => {
    render(<MaterialCard {...mockMaterial} />);
    // Verifica se algum dos metadados está presente
    expect(
      screen.getByText(/Curso:|Disciplina:|Semestre:|Tipo:/)
    ).toBeInTheDocument();
  });

  it("deve funcionar sem descrição", () => {
    const materialWithoutDescription = {
      ...mockMaterial,
      description: null,
    };
    render(<MaterialCard {...materialWithoutDescription} />);
    expect(screen.getByText("Apostila de Cálculo I")).toBeInTheDocument();
  });

  it("deve funcionar sem informações do uploader", () => {
    const materialWithoutUploader = {
      ...mockMaterial,
      uploadedBy: null,
    };
    render(<MaterialCard {...materialWithoutUploader} />);
    expect(screen.getByText("Apostila de Cálculo I")).toBeInTheDocument();
  });

  it("deve usar email quando nome não está disponível", () => {
    const materialWithEmailOnly = {
      ...mockMaterial,
      uploadedBy: {
        name: null,
        email: "joao@example.com",
      },
    };
    render(<MaterialCard {...materialWithEmailOnly} variant="default" />);
    expect(screen.getByText(/Por: joao@example.com/)).toBeInTheDocument();
  });
});

