// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: "/",
      query: {},
      asPath: "/",
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return "/";
  },
}));

// Mock framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    form: ({ children, ...props }) => <form {...props}>{children}</form>,
  },
  AnimatePresence: ({ children }) => children,
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Upload: () => <span data-testid="upload-icon">Upload</span>,
  FileText: () => <span data-testid="file-icon">FileText</span>,
  Download: () => <span data-testid="download-icon">Download</span>,
  Calendar: () => <span data-testid="calendar-icon">Calendar</span>,
  Edit: () => <span data-testid="edit-icon">Edit</span>,
  Trash2: () => <span data-testid="trash-icon">Trash2</span>,
}));

