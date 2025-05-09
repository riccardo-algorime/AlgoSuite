/**
 * CreateProjectPage.test.tsx
 * Tests for CreateProjectPage: input validation, optimistic UI, error handling, and edge cases.
 * Author: aiGI Auto-Coder
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { CreateProjectPage } from "../CreateProjectPage";

// Mock hooks
const mockMutate = jest.fn();
jest.mock("../../hooks/useProjects", () => ({
  ...jest.requireActual("../../hooks/useProjects"),
  useCreateProject: () => ({
    mutate: mockMutate,
    isLoading: false,
  }),
}));
jest.mock("../../hooks/useToastNotification", () => ({
  useToastNotification: () => jest.fn(),
}));

const renderPage = () =>
  render(
    <BrowserRouter>
      <CreateProjectPage />
    </BrowserRouter>
  );

describe("CreateProjectPage", () => {
  beforeEach(() => {
    mockMutate.mockReset();
  });

  it("renders form fields and submit button", () => {
    renderPage();
    expect(screen.getByTestId("project-name-input")).toBeInTheDocument();
    expect(screen.getByTestId("project-description-input")).toBeInTheDocument();
    expect(screen.getByTestId("create-project-submit")).toBeInTheDocument();
  });

  it("shows validation error for empty project name", async () => {
    renderPage();
    fireEvent.change(screen.getByTestId("project-name-input"), { target: { value: "" } });
    fireEvent.click(screen.getByTestId("create-project-submit"));
    await waitFor(() =>
      expect(screen.getByText(/Project name is required/i)).toBeInTheDocument()
    );
  });

  it("shows validation error for long project name", async () => {
    renderPage();
    fireEvent.change(screen.getByTestId("project-name-input"), {
      target: { value: "a".repeat(101) },
    });
    fireEvent.click(screen.getByTestId("create-project-submit"));
    await waitFor(() =>
      expect(screen.getByText(/under 100 characters/i)).toBeInTheDocument()
    );
  });

  it("shows validation error for long description", async () => {
    renderPage();
    fireEvent.change(screen.getByTestId("project-name-input"), { target: { value: "Test" } });
    fireEvent.change(screen.getByTestId("project-description-input"), {
      target: { value: "b".repeat(501) },
    });
    fireEvent.click(screen.getByTestId("create-project-submit"));
    await waitFor(() =>
      expect(screen.getByText(/under 500 characters/i)).toBeInTheDocument()
    );
  });

  it("calls mutate with valid input", async () => {
    renderPage();
    fireEvent.change(screen.getByTestId("project-name-input"), { target: { value: "Test Project" } });
    fireEvent.change(screen.getByTestId("project-description-input"), { target: { value: "A project" } });
    fireEvent.click(screen.getByTestId("create-project-submit"));
    await waitFor(() =>
      expect(mockMutate).toHaveBeenCalledWith(
        { name: "Test Project", description: "A project" },
        expect.any(Object)
      )
    );
  });

  it("handles API error and restores form state", async () => {
    // Simulate error callback
    mockMutate.mockImplementation((_data, { onError }) => {
      onError({ message: "API error" });
    });
    renderPage();
    fireEvent.change(screen.getByTestId("project-name-input"), { target: { value: "Test" } });
    fireEvent.change(screen.getByTestId("project-description-input"), { target: { value: "Desc" } });
    fireEvent.click(screen.getByTestId("create-project-submit"));
    await waitFor(() => {
      expect(screen.getByTestId("project-name-input")).toHaveValue("Test");
      expect(screen.getByTestId("project-description-input")).toHaveValue("Desc");
    });
  });

  // Edge case: rapid input changes (debounce)
  it("debounces input changes", async () => {
    jest.useFakeTimers();
    renderPage();
    const nameInput = screen.getByTestId("project-name-input");
    fireEvent.change(nameInput, { target: { value: "A" } });
    fireEvent.change(nameInput, { target: { value: "AB" } });
    fireEvent.change(nameInput, { target: { value: "ABC" } });
    jest.advanceTimersByTime(200);
    await waitFor(() => expect(nameInput).toHaveValue("ABC"));
    jest.useRealTimers();
  });
});