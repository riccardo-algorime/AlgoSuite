import '../styles/AboutPage.css'

export const AboutPage = () => {
  return (
    <div className="about-page">
      <section className="about-section">
        <h1>About AlgoSuite</h1>
        <p className="lead">
          AlgoSuite is a modern web application designed to provide powerful algorithmic tools
          for businesses and individuals. Our mission is to make complex algorithms accessible
          and useful for everyday tasks.
        </p>
      </section>

      <section className="about-section">
        <h2>Our Technology</h2>
        <p>
          Built with modern web technologies including React and TypeScript,
          AlgoSuite delivers a fast, responsive, and intuitive user experience. Our backend
          services are powered by high-performance algorithms optimized for speed and accuracy.
        </p>
      </section>

      <div className="divider"></div>

      <section className="about-section">
        <h2>Contact Us</h2>
        <p>
          Have questions or feedback? We'd love to hear from you.
          Email us directly at <a href="mailto:support@algosuite.com">support@algosuite.com</a>.
        </p>
      </section>
    </div>
  )
}
