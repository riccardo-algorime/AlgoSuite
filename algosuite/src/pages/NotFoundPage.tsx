import { Link } from 'react-router-dom'
import '../styles/NotFoundPage.css'

export const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <h1 className="error-code">404</h1>
      <h2>Page Not Found</h2>
      <p>The page you are looking for doesn't exist or has been moved.</p>
      <div>
        <Link to="/" className="home-button">
          Go Home
        </Link>
      </div>
    </div>
  )
}
