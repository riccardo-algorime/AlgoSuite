import { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import '../styles/Layout.css'

interface LayoutProps {
  children: ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
  const { authState, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="layout">
      <header className="header">
        <div className="container">
          <div className="navbar">
            <h1 className="logo">
              <Link to="/">AlgoSuite</Link>
            </h1>
            <nav className="nav">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/about" className="nav-link">About</Link>
              {authState.isAuthenticated ? (
                <>
                  <span className="user-info">
                    {authState.user?.email || 'User'}
                  </span>
                  <button onClick={handleLogout} className="logout-button">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="nav-link">Login</Link>
                  <Link to="/register" className="nav-link">Register</Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>
      <main className="main container">
        {children}
      </main>
      <footer className="footer">
        <div className="container">
          <p>© {new Date().getFullYear()} AlgoSuite. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
