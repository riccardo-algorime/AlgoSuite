import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreateAsset } from "../hooks/useAssets";
import { AssetType } from "../types";
import { toaster } from "../components/ui/toaster";
import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Textarea,
} from "@chakra-ui/react";
import { FormControl, FormLabel, FormErrorMessage } from "../components/ui/form";
import { VStack } from "../components/ui/stack";
import { useColorModeValue } from "../hooks/useColorMode";

/**
 * CreateAssetPage
 * Implements the asset creation form with validation and user feedback.
 */
export const CreateAssetPage = () => {
  const { projectId, surfaceId } = useParams<{ projectId: string; surfaceId: string }>();
  const navigate = useNavigate();

  // Get theme-specific colors
  const inputBgColor = useColorModeValue('#FFFFFF', '#2C2C2C');
  const inputTextColor = useColorModeValue('#1A202C', '#F0F0F0');
  const inputBorderColor = useColorModeValue('#E2E8F0', '#333333');

  // Form state
  const [name, setName] = useState("");
  const [assetType, setAssetType] = useState<AssetType>(AssetType.SERVER);
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ name?: string; assetType?: string; description?: string }>({});
  const [optimisticLoading, setOptimisticLoading] = useState(false);

  // Get the mutation function from the hook
  const { mutate: createAsset, isPending: isLoading } = useCreateAsset(projectId || "", surfaceId || "");

  // Handle asset type change
  const handleAssetTypeChange = (e: any) => {
    const value = e.target.value as AssetType;
    setAssetType(value);
    validateField("assetType", value);
  };

  // Handle name change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    validateField("name", value);
  };

  // Handle description change
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDescription(value);
    validateField("description", value);
  };

  // Validate a field
  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case "name":
        if (!value.trim()) {
          newErrors.name = "Name is required";
        } else {
          delete newErrors.name;
        }
        break;
      case "assetType":
        if (!value) {
          newErrors.assetType = "Asset type is required";
        } else {
          delete newErrors.assetType;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors: { name?: string; assetType?: string; description?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!assetType) {
      newErrors.assetType = "Asset type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Show optimistic loading state
    setOptimisticLoading(true);

    // Save current values for optimistic updates
    const optimisticName = name;
    const optimisticType = assetType;
    const optimisticDesc = description;

    // Clear form
    setName("");
    setAssetType(AssetType.SERVER);
    setDescription("");

    // Create the asset
    createAsset(
      {
        name: optimisticName,
        asset_type: optimisticType,
        description: optimisticDesc || undefined,
      },
      {
        onSuccess: () => {
          toaster.success("Asset Created", {
            description: `Asset was created successfully.`,
          });
          navigate(`/projects/${projectId}/attack-surfaces/${surfaceId}`);
        },
        onError: (error: any) => {
          setName(optimisticName);
          setAssetType(optimisticType);
          setDescription(optimisticDesc);
          console.error("Asset creation error:", error);
          toaster.error("Creation Failed", {
            description:
              error?.message ||
              "An error occurred while creating the asset. Please try again.",
          });
        },
        onSettled: () => {
          setOptimisticLoading(false);
        },
      }
    );
  };

  // Handle navigation back to attack surface page
  const handleBackToAttackSurface = () => {
    navigate(`/projects/${projectId}/attack-surfaces/${surfaceId}`);
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack gap={6} align="stretch">
        <Box>
          <Button onClick={handleBackToAttackSurface} variant="outline" mb={4}>
            Back to Attack Surface
          </Button>
        </Box>
        <Heading as="h1" size="xl">
          Create New Asset
        </Heading>
        <Box as="form" onSubmit={handleSubmit}>
          <VStack gap={4} align="stretch">
            <FormControl isInvalid={!!errors.name} isRequired>
              <FormLabel>Name</FormLabel>
              <Input
                name="name"
                value={name}
                onChange={handleNameChange}
                placeholder="Enter asset name"
                disabled={isLoading || optimisticLoading}
                bg={inputBgColor}
                color={inputTextColor}
                borderColor={inputBorderColor}
              />
              {errors.name && <FormErrorMessage>{errors.name}</FormErrorMessage>}
            </FormControl>

            <FormControl isInvalid={!!errors.assetType} isRequired>
              <FormLabel>Asset Type</FormLabel>
              <select
                name="assetType"
                value={assetType}
                onChange={handleAssetTypeChange}
                disabled={isLoading || optimisticLoading}
                style={{
                  backgroundColor: inputBgColor,
                  color: inputTextColor,
                  borderColor: inputBorderColor,
                  borderWidth: "1px",
                  borderRadius: "0.375rem",
                  padding: "0.5rem",
                  width: "100%"
                }}
              >
                <option value={AssetType.SERVER}>Server</option>
                <option value={AssetType.WEBSITE}>Website</option>
                <option value={AssetType.DATABASE}>Database</option>
                <option value={AssetType.APPLICATION}>Application</option>
                <option value={AssetType.ENDPOINT}>Endpoint</option>
                <option value={AssetType.CONTAINER}>Container</option>
                <option value={AssetType.NETWORK_DEVICE}>Network Device</option>
                <option value={AssetType.CLOUD_RESOURCE}>Cloud Resource</option>
                <option value={AssetType.OTHER}>Other</option>
              </select>
              {errors.assetType && <FormErrorMessage>{errors.assetType}</FormErrorMessage>}
            </FormControl>

            <FormControl isInvalid={!!errors.description}>
              <FormLabel>Description (Optional)</FormLabel>
              <Textarea
                name="description"
                value={description}
                onChange={handleDescriptionChange}
                placeholder="Enter asset description"
                disabled={isLoading || optimisticLoading}
                bg={inputBgColor}
                color={inputTextColor}
                borderColor={inputBorderColor}
                rows={4}
              />
              {errors.description && <FormErrorMessage>{errors.description}</FormErrorMessage>}
            </FormControl>

            <Box pt={4}>
              <Button
                type="submit"
                colorScheme="blue"
                disabled={isLoading || optimisticLoading}
                width={{ base: "full", md: "auto" }}
              >
                {isLoading || optimisticLoading ? "Creating..." : "Create Asset"}
              </Button>
            </Box>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};
