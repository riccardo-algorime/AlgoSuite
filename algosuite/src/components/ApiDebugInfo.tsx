import { useState, useEffect } from 'react';
import { Box, Text, Button, VStack, HStack, Badge } from '@chakra-ui/react';
import { Card } from './Card';
import { getApiBaseUrl, getHostInfo, isDevelopment } from '../utils/apiConfig';

interface ApiStatus {
  url: string;
  status: 'checking' | 'success' | 'error';
  response?: string;
  error?: string;
}

export const ApiDebugInfo = () => {
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    url: '',
    status: 'checking'
  });
  const [isVisible, setIsVisible] = useState(false);

  const checkApiStatus = async () => {
    const apiBaseUrl = getApiBaseUrl();
    setApiStatus({ url: apiBaseUrl, status: 'checking' });

    try {
      // Try to reach a simple endpoint
      const response = await fetch(`${apiBaseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.text();
        setApiStatus({
          url: apiBaseUrl,
          status: 'success',
          response: data || 'OK'
        });
      } else {
        setApiStatus({
          url: apiBaseUrl,
          status: 'error',
          error: `HTTP ${response.status}: ${response.statusText}`
        });
      }
    } catch (error) {
      setApiStatus({
        url: apiBaseUrl,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  useEffect(() => {
    if (isVisible) {
      checkApiStatus();
    }
  }, [isVisible]);

  // Only show in development or when explicitly requested
  if (!isDevelopment() && !isVisible) {
    return (
      <Box position="fixed" bottom={4} right={4} zIndex={1000}>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsVisible(true)}
        >
          Debug API
        </Button>
      </Box>
    );
  }

  if (!isVisible) return null;

  const hostInfo = getHostInfo();
  const apiBaseUrl = getApiBaseUrl();

  return (
    <Box position="fixed" bottom={4} right={4} zIndex={1000} maxWidth="400px">
      <Card>
        <VStack spacing={3} align="stretch">
          <HStack justify="space-between">
            <Text fontWeight="bold" fontSize="sm">API Debug Info</Text>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => setIsVisible(false)}
            >
              ✕
            </Button>
          </HStack>

          <Box>
            <Text fontSize="xs" fontWeight="semibold" mb={1}>Current Host:</Text>
            <Text fontSize="xs" fontFamily="mono">
              {hostInfo.protocol}//{hostInfo.hostname}
              {hostInfo.port && `:${hostInfo.port}`}
            </Text>
          </Box>

          <Box>
            <Text fontSize="xs" fontWeight="semibold" mb={1}>API Base URL:</Text>
            <Text fontSize="xs" fontFamily="mono" wordBreak="break-all">
              {apiBaseUrl}
            </Text>
          </Box>

          <Box>
            <HStack justify="space-between" align="center" mb={1}>
              <Text fontSize="xs" fontWeight="semibold">API Status:</Text>
              <Badge
                colorScheme={
                  apiStatus.status === 'success' ? 'green' :
                  apiStatus.status === 'error' ? 'red' : 'yellow'
                }
                size="sm"
              >
                {apiStatus.status}
              </Badge>
            </HStack>
            
            {apiStatus.status === 'checking' && (
              <Text fontSize="xs" color="gray.500">Checking connectivity...</Text>
            )}
            
            {apiStatus.status === 'success' && (
              <Text fontSize="xs" color="green.600">
                ✅ API is reachable
              </Text>
            )}
            
            {apiStatus.status === 'error' && (
              <Text fontSize="xs" color="red.600">
                ❌ {apiStatus.error}
              </Text>
            )}
          </Box>

          <HStack spacing={2}>
            <Button
              size="xs"
              onClick={checkApiStatus}
              isLoading={apiStatus.status === 'checking'}
              loadingText="Checking..."
            >
              Test API
            </Button>
            <Button
              size="xs"
              variant="outline"
              onClick={() => {
                const info = {
                  hostInfo,
                  apiBaseUrl,
                  apiStatus,
                  environment: import.meta.env.MODE,
                  envVars: {
                    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL
                  }
                };
                console.log('API Debug Info:', info);
                navigator.clipboard?.writeText(JSON.stringify(info, null, 2));
              }}
            >
              Copy Info
            </Button>
          </HStack>

          <Text fontSize="xs" color="gray.500">
            This debug panel helps troubleshoot API connectivity issues.
            Check the browser console for detailed logs.
          </Text>
        </VStack>
      </Card>
    </Box>
  );
};
