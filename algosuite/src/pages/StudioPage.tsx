import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Heading,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';
import { FormControl, FormLabel, FormErrorMessage } from '../components/ui/form';
import { toaster } from '../components/ui/toaster';
import { useProjects } from '../hooks/useProjects';
import { useAttackSurfaces } from '../hooks/useAttackSurfaces';
import { useAssets } from '../hooks/useAssets';
import { Project, AttackSurface, Asset } from '../types';
import { useColorModeValue } from '../hooks/useColorMode';

export const StudioPage = () => {
  const navigate = useNavigate();

  // State for selected items
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedSurfaceId, setSelectedSurfaceId] = useState<string>('');
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [selectionType, setSelectionType] = useState<'attack-surface' | 'asset'>('attack-surface');

  // Fetch projects
  const {
    data: projects,
    isLoading: isLoadingProjects,
    isError: isErrorProjects,
    error: projectsError
  } = useProjects();

  // Fetch attack surfaces for selected project
  const {
    data: attackSurfaces,
    isLoading: isLoadingSurfaces,
    isError: isErrorSurfaces,
    error: surfacesError
  } = useAttackSurfaces(selectedProjectId, { skip: 0, limit: 100 });

  // Fetch assets for selected attack surface
  const {
    data: assets,
    isLoading: isLoadingAssets,
    isError: isErrorAssets,
    error: assetsError
  } = useAssets(selectedProjectId, selectedSurfaceId, { skip: 0, limit: 100 });

  // Style variables
  const inputBgColor = useColorModeValue('white', 'gray.800');
  const inputBorderColor = useColorModeValue('gray.300', 'gray.600');
  const inputTextColor = useColorModeValue('gray.800', 'white');

  // Create a more comprehensive CSS rule to style the dropdown options
  useEffect(() => {
    // Create a style element
    const styleEl = document.createElement('style');
    const darkMode = inputBgColor === 'gray.800';

    // Define the CSS rule for select options with more specific selectors and !important to override browser defaults
    styleEl.innerHTML = `
      .themed-select {
        background-color: ${darkMode ? '#1A202C' : 'white'} !important;
        color: ${darkMode ? 'white' : 'black'} !important;
        border-color: ${darkMode ? '#4A5568' : '#E2E8F0'} !important;
      }

      .themed-select option {
        background-color: ${darkMode ? '#1A202C' : 'white'} !important;
        color: ${darkMode ? 'white' : 'black'} !important;
      }

      /* Target Webkit browsers (Chrome, Safari) */
      @media screen and (-webkit-min-device-pixel-ratio:0) {
        .themed-select {
          background-color: ${darkMode ? '#1A202C' : 'white'} !important;
        }

        .themed-select option {
          background-color: ${darkMode ? '#1A202C' : 'white'} !important;
          color: ${darkMode ? 'white' : 'black'} !important;
        }
      }

      /* Target Firefox */
      @-moz-document url-prefix() {
        .themed-select {
          background-color: ${darkMode ? '#1A202C' : 'white'} !important;
          color: ${darkMode ? 'white' : 'black'} !important;
        }

        .themed-select option {
          background-color: ${darkMode ? '#1A202C' : 'white'} !important;
          color: ${darkMode ? 'white' : 'black'} !important;
        }
      }

      /* Additional styling for dropdown appearance */
      .themed-select {
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        background-image: ${darkMode ?
          'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")' :
          'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'black\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")'
        };
        background-repeat: no-repeat;
        background-position: right 0.5rem center;
        background-size: 1em;
        padding-right: 2.5rem;
      }
    `;

    // Add the style element to the document head
    document.head.appendChild(styleEl);

    // Clean up when component unmounts
    return () => {
      document.head.removeChild(styleEl);
    };
  }, [inputBgColor]);

  // Reset dependent selections when parent selection changes
  useEffect(() => {
    setSelectedSurfaceId('');
    setSelectedAssetId('');
  }, [selectedProjectId]);

  useEffect(() => {
    setSelectedAssetId('');
  }, [selectedSurfaceId]);

  // Handle project selection
  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProjectId(e.target.value);
  };

  // Handle attack surface selection
  const handleSurfaceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSurfaceId(e.target.value);
  };

  // Handle asset selection
  const handleAssetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAssetId(e.target.value);
  };

  // Handle selection type change
  const handleSelectionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectionType(e.target.value as 'attack-surface' | 'asset');
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectionType === 'attack-surface' && selectedSurfaceId) {
      // For now, just show a message since the actual studio functionality isn't implemented
      toaster.success('Opening Attack Surface in Studio', {
        description: `Opening attack surface ${selectedSurfaceId} in studio.`,
      });
      // In the future, navigate to the actual studio view with the attack surface
      // navigate(`/studio/${selectedProjectId}/attack-surfaces/${selectedSurfaceId}`);
    } else if (selectionType === 'asset' && selectedAssetId) {
      // For now, just show a message since the actual studio functionality isn't implemented
      toaster.success('Opening Asset in Studio', {
        description: `Opening asset ${selectedAssetId} in studio.`,
      });
      // In the future, navigate to the actual studio view with the asset
      // navigate(`/studio/${selectedProjectId}/attack-surfaces/${selectedSurfaceId}/assets/${selectedAssetId}`);
    } else {
      toaster.error('Selection Required', {
        description: 'Please select an attack surface or asset to open in studio.',
      });
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack gap={6} align="stretch">
        <Heading as="h1" size="xl">
          Studio
        </Heading>
        <Text color="text.secondary">
          Select an attack surface or asset to open in the studio.
        </Text>

        {isErrorProjects && (
          <Text color="red.500">
            Error loading projects: {projectsError instanceof Error ? projectsError.message : 'Unknown error'}
          </Text>
        )}

        <Box as="form" onSubmit={handleSubmit}>
          <VStack gap={4} align="stretch">
            {/* Selection Type */}
            <FormControl isRequired>
              <FormLabel>What would you like to open?</FormLabel>
              <select
                name="selectionType"
                value={selectionType}
                onChange={handleSelectionTypeChange}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  border: '1px solid',
                  borderColor: inputBorderColor,
                  backgroundColor: inputBgColor,
                  color: inputTextColor
                }}
                className="themed-select"
              >
                <option value="attack-surface">Attack Surface</option>
                <option value="asset">Asset</option>
              </select>
            </FormControl>

            {/* Project Selection */}
            <FormControl isRequired>
              <FormLabel>Project</FormLabel>
              {isLoadingProjects ? (
                <Spinner size="sm" />
              ) : (
                <select
                  name="projectId"
                  value={selectedProjectId}
                  onChange={handleProjectChange}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '0.375rem',
                    border: '1px solid',
                    borderColor: inputBorderColor,
                    backgroundColor: inputBgColor,
                    color: inputTextColor
                  }}
                  className="themed-select"
                >
                  <option value="">Select a project</option>
                  {projects?.map((project) => (
                    <option
                      key={project.id}
                      value={project.id}
                    >
                      {project.name}
                    </option>
                  ))}
                </select>
              )}
            </FormControl>

            {/* Attack Surface Selection */}
            {selectedProjectId && (
              <FormControl isRequired={selectionType === 'attack-surface'}>
                <FormLabel>Attack Surface</FormLabel>
                {isLoadingSurfaces ? (
                  <Spinner size="sm" />
                ) : isErrorSurfaces ? (
                  <Text color="red.500">
                    Error loading attack surfaces: {surfacesError instanceof Error ? surfacesError.message : 'Unknown error'}
                  </Text>
                ) : (
                  <select
                    name="surfaceId"
                    value={selectedSurfaceId}
                    onChange={handleSurfaceChange}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '0.375rem',
                      border: '1px solid',
                      borderColor: inputBorderColor,
                      backgroundColor: inputBgColor,
                      color: inputTextColor
                    }}
                    className="themed-select"
                  >
                    <option value="">Select an attack surface</option>
                    {attackSurfaces?.map((surface) => (
                      <option
                        key={surface.id}
                        value={surface.id}
                      >
                        {surface.surface_type} - {surface.description || 'No description'}
                      </option>
                    ))}
                  </select>
                )}
              </FormControl>
            )}

            {/* Asset Selection (only shown when selectionType is 'asset') */}
            {selectedSurfaceId && selectionType === 'asset' && (
              <FormControl isRequired={selectionType === 'asset'}>
                <FormLabel>Asset</FormLabel>
                {isLoadingAssets ? (
                  <Spinner size="sm" />
                ) : isErrorAssets ? (
                  <Text color="red.500">
                    Error loading assets: {assetsError instanceof Error ? assetsError.message : 'Unknown error'}
                  </Text>
                ) : (
                  <select
                    name="assetId"
                    value={selectedAssetId}
                    onChange={handleAssetChange}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '0.375rem',
                      border: '1px solid',
                      borderColor: inputBorderColor,
                      backgroundColor: inputBgColor,
                      color: inputTextColor
                    }}
                    className="themed-select"
                  >
                    <option value="">Select an asset</option>
                    {assets?.map((asset) => (
                      <option
                        key={asset.id}
                        value={asset.id}
                      >
                        {asset.name} - {asset.asset_type}
                      </option>
                    ))}
                  </select>
                )}
                {assets?.length === 0 && (
                  <Text fontSize="sm" color="text.secondary" mt={1}>
                    No assets found for this attack surface.
                  </Text>
                )}
              </FormControl>
            )}

            <Button
              type="submit"
              colorScheme="blue"
              mt={4}
              disabled={
                !selectedProjectId ||
                (selectionType === 'attack-surface' && !selectedSurfaceId) ||
                (selectionType === 'asset' && !selectedAssetId)
              }
            >
              Open in Studio
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};
