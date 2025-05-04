import '../styles/HomePage.css'

export const HomePage = () => {
  return (
    <div className="home-page">
      <section className="hero">
        <h1>Welcome to AlgoSuite</h1>
        <p className="subtitle">
          A powerful suite of algorithmic tools for your business needs
        </p>
      </section>

      <section className="get-started">
        <h2>Get Started</h2>
        <p>
          AlgoSuite provides a comprehensive set of tools to help you analyze data,
          optimize processes, and make better decisions.
        </p>
        <button className="button">Explore Features</button>
      </section>

      <section className="features">
        <h2>Our Features</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>Data Analysis</h3>
            <p>Powerful tools for analyzing complex datasets and extracting valuable insights.</p>
          </div>
          <div className="feature-card">
            <h3>Process Optimization</h3>
            <p>Optimize your business processes with our advanced algorithms.</p>
          </div>
          <div className="feature-card">
            <h3>Predictive Analytics</h3>
            <p>Forecast future trends and make data-driven decisions with confidence.</p>
          </div>
          <div className="feature-card">
            <h3>Custom Solutions</h3>
            <p>Tailored algorithmic solutions designed to meet your specific business needs.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
