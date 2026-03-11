const Footer = () => {
  return (
    <section className="footer-section">
      <div className="cta-banner">
        <h2>Ready to Write Your Success Story?</h2>
        <p>Join thousands of students who have found their dream careers through our platform</p>
        <button className="cta-btn">Start Your Journey Today</button>
      </div>

      <footer className="main-footer">
        <div className="footer-container">
          <div className="footer-col brand-col">
            <div className="footer-logo">
              <div className="logo-icon"><i className="fa-solid fa-briefcase"></i></div>
              <span>CCSConnect</span>
            </div>
            <p className="brand-desc">
              Bridging the gap between talented students and leading companies. Your career journey starts here with personalized opportunities and comprehensive support.
            </p>
            <div className="contact-info">
              <p><i className="fa-regular fa-envelope"></i> placement@ccsconnect.edu</p>
              <p><i className="fa-solid fa-phone"></i> +91 98765 43210</p>
              <p><i className="fa-solid fa-location-dot"></i> 123 University Road, Education City</p>
            </div>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/opportunities">Opportunities</a></li>
              <li><a href="/dashboard">Dashboard</a></li>
              <li><a href="/notices">Notices</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>For Students</h4>
            <ul>
              <li><a href="#">Find Internships</a></li>
              <li><a href="#">Career Guidance</a></li>
              <li><a href="#">Skill Assessment</a></li>
              <li><a href="#">Interview Prep</a></li>
              <li><a href="#">Resume Builder</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>For Companies</h4>
            <ul>
              <li><a href="#">Post Opportunities</a></li>
              <li><a href="#">Browse Candidates</a></li>
              <li><a href="#">Campus Partnerships</a></li>
              <li><a href="#">Recruitment Solutions</a></li>
              <li><a href="#">Employer Branding</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">FAQ</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="stay-updated">
            <h3>Stay Updated</h3>
            <div className="newsletter-form">
              <input type="email" placeholder="Enter your email" />
              <button type="submit">Subscribe</button>
            </div>
          </div>
        </div>
      </footer>
    </section>
  );
};

export default Footer;
