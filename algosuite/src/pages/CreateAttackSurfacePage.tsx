import { useState, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreateAttackSurface } from "../hooks/useAttackSurfaces";
import { SurfaceType } from "../types";
import { toaster } from "../components/ui/toaster";
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  Spinner,
} from "@chakra-ui/react";
import { FormControl, FormLabel, FormErrorMessage } from "../components/ui/form";
import { VStack } from "../components/ui/stack";
import { useColorModeValue } from "../hooks/useColorMode";

/**
 * CreateAttackSurfacePage
 * Implements the attack surface creation form with validation and user feedback.
 */
export const CreateAttackSurfacePage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  // Get theme-specific colors
  const inputBgColor = useColorModeValue('#FFFFFF', '#2C2C2C');
  const inputTextColor = useColorModeValue('#1A202C', '#F0F0F0');
  const inputBorderColor = useColorModeValue('#E2E8F0', '#333333');

  // Form state
  const [surfaceType, setSurfaceType] = useState<SurfaceType>(SurfaceType.WEB);
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ surfaceType?: string; description?: string }>({});
  const [optimisticLoading, setOptimisticLoading] = useState(false);

  // Debounce for input changes
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Get the mutation function from the hook
  const { mutate: createAttackSurface, isPending: isLoading } = useCreateAttackSurface(projectId || "");

  // Handle surface type change
  const handleSurfaceTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as SurfaceType;
    setSurfaceType(value);
    validateField("surfaceType", value);
  };

  // Handle description change with debounce
  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDescription(value);

    // Debounce validation
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      validateField("description", value);
    }, 300);
  }, []);

  // Validate a specific field
  const validateField = (field: string, value: any) => {
    let newErrors = { ...errors };

    switch (field) {
      case "surfaceType":
        if (!value) {
          newErrors.surfaceType = "Surface type is required";
        } else {
          delete newErrors.surfaceType;
        }
        break;
      case "description":
        if (value && value.length > 500) {
          newErrors.description = "Description must be less than 500 characters";
        } else {
          delete newErrors.description;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
  };

  // Validate all fields
  const validate = () => {
    const newErrors: { surfaceType?: string; description?: string } = {};

    if (!surfaceType) {
      newErrors.surfaceType = "Surface type is required";
    }

    if (description && description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Flush debounced values
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    // Validate before submit
    if (!validate()) {
      toaster.error("Validation Error", {
        description: "Please fix the errors in the form.",
      });
      return;
    }

    setOptimisticLoading(true);

    // Optimistic UI: assume success, show spinner, reset form
    const optimisticType = surfaceType;
    const optimisticDesc = description;
    setSurfaceType(SurfaceType.WEB);
    setDescription("");
    setErrors({});

    try {
      // Create the attack surface
      // Log what we're sending for debugging
      console.log("Original surface type:", optimisticType);

      // Ensure we're sending the lowercase string value
      // The SurfaceType enum values are already lowercase, so we don't need to convert them
      // But we'll send the string value directly to avoid any serialization issues
      const surfaceTypeValue = optimisticType.valueOf(); // Get the string value from the enum
      console.log("Sending surface type:", optimisticType);
      console.log("Sending surface type value:", surfaceTypeValue);

      createAttackSurface(
        {
          // Send the string value directly to avoid any serialization issues
          surface_type: surfaceTypeValue as SurfaceType,
          description: optimisticDesc || undefined,
        },
        {
          onSuccess: () => {
            toaster.success("Attack Surface Created", {
              description: `Attack surface was created successfully.`,
            });
            navigate(`/projects/${projectId}`);
          },
          onError: (error: any) => {
            setSurfaceType(optimisticType);
            setDescription(optimisticDesc);
            console.error("Attack surface creation error:", error);
            toaster.error("Creation Failed", {
              description:
                error?.message ||
                "An error occurred while creating the attack surface. Please try again.",
            });
          },
          onSettled: () => {
            setOptimisticLoading(false);
          },
        }
      );
    } catch (error: any) {
      console.error("Unexpected error during attack surface creation:", error);
      toaster.error("Creation Failed", {
        description: error?.message || "An unexpected error occurred. Please try again.",
      });
      setOptimisticLoading(false);
    }
  };

  // Handle back to project navigation
  const handleBackToProject = () => {
    navigate(`/projects/${projectId}`);
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack gap={6} align="stretch">
        <Box>
          <Button onClick={handleBackToProject} variant="outline" mb={4}>
            Back to Project
          </Button>
        </Box>
        <Heading as="h1" size="xl">
          Create New Attack Surface
        </Heading>
        <Box as="form" onSubmit={handleSubmit}>
          <VStack gap={4} align="stretch">
            <FormControl isInvalid={!!errors.surfaceType} isRequired>
              <FormLabel>Surface Type</FormLabel>
              <select
                name="surfaceType"
                value={surfaceType}
                onChange={handleSurfaceTypeChange}
                disabled={isLoading || optimisticLoading}
                data-testid="surface-type-select"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  border: '1px solid',
                  borderColor: !!errors.surfaceType ? 'red' : inputBorderColor,
                  backgroundColor: inputBgColor,
                  color: inputTextColor
                }}
              >
                <option value={SurfaceType.WEB} style={{ backgroundColor: inputBgColor, color: inputTextColor }}>Web</option>
                <option value={SurfaceType.API} style={{ backgroundColor: inputBgColor, color: inputTextColor }}>API</option>
                <option value={SurfaceType.MOBILE} style={{ backgroundColor: inputBgColor, color: inputTextColor }}>Mobile</option>
                <option value={SurfaceType.NETWORK} style={{ backgroundColor: inputBgColor, color: inputTextColor }}>Network</option>
                <option value={SurfaceType.CLOUD} style={{ backgroundColor: inputBgColor, color: inputTextColor }}>Cloud</option>
                <option value={SurfaceType.IOT} style={{ backgroundColor: inputBgColor, color: inputTextColor }}>IoT</option>
                <option value={SurfaceType.OTHER} style={{ backgroundColor: inputBgColor, color: inputTextColor }}>Other</option>
              </select>
              <FormErrorMessage>{errors.surfaceType}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!errors.description}>
              <FormLabel>Description</FormLabel>
              <textarea
                name="description"
                placeholder="Enter attack surface description"
                value={description}
                onChange={handleDescriptionChange}
                maxLength={500}
                disabled={isLoading || optimisticLoading}
                data-testid="description-textarea"
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  border: '1px solid',
                  borderColor: !!errors.description ? 'red' : inputBorderColor,
                  backgroundColor: inputBgColor,
                  color: inputTextColor,
                  resize: 'vertical'
                }}
              />
              <FormErrorMessage>{errors.description}</FormErrorMessage>
            </FormControl>
            <Button
              type="submit"
              colorScheme="blue"
              loading={isLoading || optimisticLoading}
              loadingText="Creating..."
              data-testid="create-attack-surface-submit"
            >
              Create Attack Surface
            </Button>
            {(isLoading || optimisticLoading) && (
              <Box textAlign="center">
                <Spinner size="md" />
                <Text mt={2}>Creating attack surface...</Text>
              </Box>
            )}
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};
