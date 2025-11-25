import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UploadForm } from "@/components/UploadForm";

// Mock Next.js router
const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

// Mock upload action
const mockUploadMaterial = jest.fn();
jest.mock("@/app/actions/upload", () => ({
  uploadMaterial: (...args: unknown[]) => mockUploadMaterial(...args),
}));

describe("UploadForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUploadMaterial.mockResolvedValue({ success: true, materialId: "test-id" });
  });

  it("deve renderizar o formulário", () => {
    render(<UploadForm />);
    expect(screen.getByLabelText(/Título/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Arquivo PDF/i)).toBeInTheDocument();
  });

  it("deve exibir erro quando título está vazio", async () => {
    const user = userEvent.setup();
    render(<UploadForm />);

    const submitButton = screen.getByRole("button", { name: /Fazer Upload/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Título é obrigatório/i)).toBeInTheDocument();
    });
  });

  it("deve exibir erro quando arquivo não é selecionado", async () => {
    const user = userEvent.setup();
    render(<UploadForm />);

    const titleInput = screen.getByLabelText(/Título/i);
    await user.type(titleInput, "Teste");

    const submitButton = screen.getByRole("button", { name: /Fazer Upload/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Arquivo é obrigatório/i)).toBeInTheDocument();
    });
  });

  it("deve validar tamanho máximo do título", async () => {
    const user = userEvent.setup();
    render(<UploadForm />);

    const titleInput = screen.getByLabelText(/Título/i);
    const longTitle = "a".repeat(201);
    await user.type(titleInput, longTitle);

    const submitButton = screen.getByRole("button", { name: /Fazer Upload/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Título muito longo/i)
      ).toBeInTheDocument();
    });
  });

  it("deve permitir preencher campos opcionais", async () => {
    const user = userEvent.setup();
    render(<UploadForm />);

    const titleInput = screen.getByLabelText(/Título/i);
    await user.type(titleInput, "Teste");

    const descriptionInput = screen.getByLabelText(/Descrição/i);
    await user.type(descriptionInput, "Descrição de teste");

    const courseInput = screen.getByLabelText(/Curso/i);
    await user.type(courseInput, "Engenharia");

    expect(descriptionInput).toHaveValue("Descrição de teste");
    expect(courseInput).toHaveValue("Engenharia");
  });

  it("deve exibir campos opcionais", () => {
    render(<UploadForm />);
    expect(screen.getByLabelText(/Curso/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Disciplina/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Semestre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo/i)).toBeInTheDocument();
  });

  it("deve exibir botão de submit", () => {
    render(<UploadForm />);
    expect(
      screen.getByRole("button", { name: /Fazer Upload/i })
    ).toBeInTheDocument();
  });

  // Nota: Testes de upload real requerem mock mais complexo do File input
  // e integração com react-hook-form. Este é um exemplo básico.
});

