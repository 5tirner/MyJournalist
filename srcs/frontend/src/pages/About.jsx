import './About.css';

function About() {
  return (
    <div className="about-container">
      <div className="about-content">
        <h1>About Journalist AI</h1>
        <p>
          Journalist AI is your personalized news companion, designed to deliver the latest updates tailored to your interests. Powered by cutting-edge artificial intelligence, our platform curates news from various fields including Football, AI, IT, Cyber Security, Politics, and Crypto.
        </p>
        <p>
          Our mission is to provide a seamless, modern reading experience that feels like flipping through a dynamic digital journal. With a sleek, dark-themed interface and interactive elements, Journalist AI brings news to life, ensuring you stay informed with style and ease.
        </p>
        <p>
          Whether you're a tech enthusiast, a sports lover, or a political junkie, Journalist AI adapts to your preferences, offering a unique blend of content that's both engaging and relevant. Join us on this journey to redefine how you consume news in the digital age.
        </p>
        <p>
          Check out the source code and contribute to the project on GitHub: 
          <a 
            href="https://github.com/5tirner/New-News-AI" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="github-link"
          >
            5tirner/NewNewsAI
          </a>
        </p>
      </div>
    </div>
  );
}

export default About;