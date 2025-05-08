import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AboutPage } from './pages/AboutPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ComponentsDemo } from './pages/ComponentsDemo'
import { DashboardPage } from './pages/DashboardPage'
import { ProjectPage } from './pages/ProjectPage'
import { AttackSurfacePage } from './pages/AttackSurfacePage'
import { CreateProjectPage } from './pages/CreateProjectPage'
import { EditProjectPage } from './pages/EditProjectPage'
import { EditAttackSurfacePage } from './pages/EditAttackSurfacePage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext'
import { ChakraProvider } from '@chakra-ui/react'
import { ColorModeProvider } from './components/ui/color-mode'
import { Toaster } from './components/ui/toaster'
import theme from './theme'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider value={theme}>
        <ColorModeProvider>
          <AuthProvider>
            <Layout>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/components" element={<ComponentsDemo />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <HomePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/projects/:projectId"
                  element={
                    <ProtectedRoute>
                      <ProjectPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/projects/:projectId/attack-surfaces/:surfaceId"
                  element={
                    <ProtectedRoute>
                      <AttackSurfacePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/projects/new"
                  element={
                    <ProtectedRoute>
                      <CreateProjectPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/projects/:projectId/edit"
                  element={
                    <ProtectedRoute>
                      <EditProjectPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/projects/:projectId/attack-surfaces/:surfaceId/edit"
                  element={
                    <ProtectedRoute>
                      <EditAttackSurfacePage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Layout>
            <Toaster />
          </AuthProvider>
        </ColorModeProvider>
      </ChakraProvider>
    </QueryClientProvider>
  )
}

export default App
