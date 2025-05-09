import { useNavigate } from "react-router-dom";
import { useState, useCallback, useRef } from "react";
import { useCreateProject } from "../hooks/useProjects";
import { useToastNotification } from "../hooks/useToastNotification";
import { usersApi } from "../api/usersApi";
import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Text,
  VStack,
  Spinner,
} from "@chakra-ui/react";

// Temporary mock components until Shadcn UI is fully implemented
const FormControl = ({ children, isInvalid, isRequired }: any) => (
  <div className={`form-control ${isInvalid ? 'invalid' : ''} ${isRequired ? 'required' : ''}`}>
    {children}
  </div>
);

const FormLabel = ({ children }: any) => (
  <label className="form-label">{children}</label>
);

const FormErrorMessage = ({ children }: any) => (
  <div className="error-message">{children}</div>
);

/**
 * CreateProjectPage
 * Implements the project creation form with robust state, validation, debounced input, optimistic UI, and user feedback.
 * Author: aiGI Auto-Coder
 */
export const CreateProjectPage = () => {
  const navigate = useNavigate();
  const notify = useToastNotification();
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});
  const [optimisticLoading, setOptimisticLoading] = useState(false);

// Reset form fields to defaults (used in the form submission)
  // Debounce refs
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Validate input fields
  const validate = useCallback(() => {
    const newErrors: { name?: string; description?: string } = {};
    if (!projectName.trim()) newErrors.name = "Project name is required.";
    else if (projectName.length > 100)
      newErrors.name = "Project name must be under 100 characters.";
    if (projectDescription.length > 500)
      newErrors.description = "Description must be under 500 characters.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [projectName, projectDescription]);

  // Debounced input handlers
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setProjectName(value);
    }, 200);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setProjectDescription(value);
    }, 200);
  };

  // Project creation mutation
  const { addProject: createProject, isLoading } = useCreateProject();

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Flush debounced values
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    // Validate before submit
    if (!validate()) {
      notify({
        title: "Validation Error",
        description: "Please fix the errors in the form.",
        status: "error",
      });
      return;
    }

    setOptimisticLoading(true);
    // Optimistic UI: assume success, show spinner, reset form
    const optimisticName = projectName;
    const optimisticDesc = projectDescription;
    setProjectName("");
    setProjectDescription("");
    setErrors({});

    try {
      // First ensure the user exists in the database
      await usersApi.ensureUserInDb();

      // Then create the project
      createProject(
        { name: optimisticName, description: optimisticDesc },
        {
          onSuccess: () => {
            notify({
              title: "Project Created",
              description: `Project "${optimisticName}" was created successfully.`,
              status: "success",
            });
            navigate("/dashboard");
          },
          onError: (error: any) => {
            setProjectName(optimisticName);
            setProjectDescription(optimisticDesc);
            notify({
              title: "Creation Failed",
              description:
                error?.message ||
                "An error occurred while creating the project. Please try again.",
              status: "error",
            });
          },
          onSettled: () => {
            setOptimisticLoading(false);
          },
        }
      );
    } catch (error: any) {
      setProjectName(optimisticName);
      setProjectDescription(optimisticDesc);
      notify({
        title: "User Verification Failed",
        description: "Failed to verify user account. Please try again.",
        status: "error",
      });
      setOptimisticLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack gap={6} align="stretch">
        <Box>
          <Button onClick={handleBackToDashboard} variant="outline" mb={4}>
            Back to Dashboard
          </Button>
        </Box>
        <Heading as="h1" size="xl">
          Create New Project
        </Heading>
        <Box as="form" onSubmit={handleSubmit}>
          <VStack gap={4} align="stretch">
            <FormControl isInvalid={!!errors.name} isRequired>
              <FormLabel>Project Name</FormLabel>
              <Input
                name="projectName"
                placeholder="Enter project name"
                defaultValue={projectName}
                onChange={handleNameChange}
                maxLength={100}
                autoFocus
                disabled={isLoading || optimisticLoading}
                data-testid="project-name-input"
              />
              <FormErrorMessage>{errors.name}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!errors.description}>
              <FormLabel>Description</FormLabel>
              <Input
                name="projectDescription"
                placeholder="Enter project description"
                defaultValue={projectDescription}
                onChange={handleDescriptionChange}
                maxLength={500}
                disabled={isLoading || optimisticLoading}
                data-testid="project-description-input"
              />
              <FormErrorMessage>{errors.description}</FormErrorMessage>
            </FormControl>
            <Button
              type="submit"
              colorScheme="blue"
              loading={isLoading || optimisticLoading}
              data-testid="create-project-submit"
            >
              Create Project
            </Button>
            {(isLoading || optimisticLoading) && (
              <Box textAlign="center">
                <Spinner size="md" />
                <Text mt={2}>Creating project...</Text>
              </Box>
            )}
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};
