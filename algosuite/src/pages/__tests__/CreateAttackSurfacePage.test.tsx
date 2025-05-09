import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { CreateAttackSurfacePage } from "../CreateAttackSurfacePage";
import { SurfaceType } from "../../types";

// Mock hooks
const mockMutate = jest.fn();
jest.mock("../../hooks/useAttackSurfaces", () => ({
  useCreateAttackSurface: () => ({
    mutate: mockMutate,
    isLoading: false,
  }),
}));

// Mock toaster
jest.mock("../../components/ui/toaster", () => ({
  toaster: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useParams: () => ({ projectId: "test-project-id" }),
}));

const renderPage = () =>
  render(
    <BrowserRouter>
      <CreateAttackSurfacePage />
    </BrowserRouter>
  );

describe("CreateAttackSurfacePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the form with default values", () => {
    renderPage();

    // Check if the page title is rendered
    expect(screen.getByText("Create New Attack Surface")).toBeInTheDocument();

    // Check if the form elements are rendered
    expect(screen.getByLabelText(/Surface Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Create Attack Surface/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Back to Project/i })).toBeInTheDocument();

    // Check if the default surface type is selected
    const surfaceTypeSelect = screen.getByLabelText(/Surface Type/i) as HTMLSelectElement;
    expect(surfaceTypeSelect.value).toBe(SurfaceType.WEB);
  });

  it("navigates back to project page when back button is clicked", () => {
    renderPage();

    // Click the back button
    fireEvent.click(screen.getByRole("button", { name: /Back to Project/i }));

    // Check if navigate was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith("/projects/test-project-id");
  });

  it("submits the form with valid data", async () => {
    renderPage();

    // Fill the form
    const surfaceTypeSelect = screen.getByLabelText(/Surface Type/i) as HTMLSelectElement;
    fireEvent.change(surfaceTypeSelect, { target: { value: SurfaceType.API } });

    const descriptionInput = screen.getByLabelText(/Description/i) as HTMLTextAreaElement;
    fireEvent.change(descriptionInput, {
      target: { value: "This is a test API attack surface" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /Create Attack Surface/i }));

    // Check if the mutation function was called with the correct data
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        {
          surface_type: SurfaceType.API,
          description: "This is a test API attack surface",
        },
        expect.any(Object)
      );
    });
  });

  it("validates description length", async () => {
    renderPage();

    // Fill the form with an invalid description (too long)
    const descriptionInput = screen.getByLabelText(/Description/i) as HTMLTextAreaElement;
    const longDescription = "a".repeat(501); // 501 characters, over the 500 limit
    fireEvent.change(descriptionInput, {
      target: { value: longDescription },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /Create Attack Surface/i }));

    // Check if the error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Description must be less than 500 characters/i)).toBeInTheDocument();
    });

    // Check that the mutation function was not called
    expect(mockMutate).not.toHaveBeenCalled();
  });
});
