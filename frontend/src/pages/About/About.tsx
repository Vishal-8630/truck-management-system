import { Link } from "react-router-dom";
import styles from "./About.module.scss";
import { useEffect, useState } from "react";
import Loading from "../../components/Loading";

const About = () => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  console.log(loading);

  if (loading) {
    return <Loading />
  }

  return (
    <div className={styles.aboutSection}>
      <header>
        <h1>About Divyanshi Road Lines</h1>
        <p>
          <strong>
            Driving India's Logistics Forward — One Mile at a Time
          </strong>
        </p>
      </header>

      <section id="intro">
        <h2>Who We Are</h2>
        <p>
          Founded with a vision to modernize India’s trucking and logistics
          industry,
          <strong> Divyanshi Road Lines</strong> is a smart truck management
          system that connects drivers, fleet owners, and clients under one
          unified platform. We bring transparency, efficiency, and reliability
          to every delivery — ensuring smooth operations from dispatch to
          destination.
        </p>
      </section>

      <section id="mission">
        <h2>Our Mission</h2>
        <p>
          Our mission is to simplify logistics through innovation and technology
          — optimizing truck routes, minimizing downtime, and ensuring on-time
          deliveries while keeping safety and customer satisfaction at the core
          of our operations.
        </p>
      </section>

      <section className={styles.features}>
        <h2>What We Offer</h2>
        <ul>
          <li>
            <strong>Real-Time Truck Tracking</strong> – Monitor every vehicle’s
            live location and status.
          </li>
          <li>
            <strong>Fleet Management Dashboard</strong> – Manage your entire
            fleet from one place.
          </li>
          <li>
            <strong>Driver Performance Insights</strong> – Track and improve
            driver efficiency and safety.
          </li>
          <li>
            <strong>Automated Trip Logs & Reports</strong> – Save time with
            auto-generated reports.
          </li>
          <li>
            <strong>Fuel & Expense Tracking</strong> – Keep your operations
            cost-efficient and transparent.
          </li>
          <li>
            <strong>Maintenance & Compliance</strong> – Stay ahead with timely
            service and document alerts.
          </li>
        </ul>
      </section>

      <section id="why-us">
        <h2>Why Choose Us</h2>
        <p>
          We combine years of logistics experience with the latest technology to
          deliver a seamless management experience. Whether it’s a single truck
          or a large fleet, our system makes operations smarter, safer, and more
          profitable.
        </p>
        <p>
          Our platform ensures data accuracy, operational transparency, and
          real-time communication — empowering transporters and clients to stay
          informed every step of the way.
        </p>
      </section>

      <section id="vision">
        <h2>Our Vision</h2>
        <p>
          We envision a connected and digital trucking network across India —
          where every delivery is tracked, optimized, and sustainable. Our goal
          is to build a future where logistics are not just faster but smarter
          and environmentally responsible.
        </p>
      </section>

      <section id="founder">
        <h2>Message from the Founder</h2>
        <blockquote>
          “At Divyanshi Road Lines, we believe logistics should be as fast as
          the road itself — efficient, transparent, and reliable. Every feature
          we build aims to empower transporters and drivers alike.”
        </blockquote>
        <p>
          <strong>— Gopal Chaudhary, Founder</strong>
        </p>
      </section>

      <section id="cta">
        <h2>Join the Future of Smart Logistics</h2>
        <p>
          Ready to make your logistics operations smarter and more efficient?
          <br />
          <Link to="/#contact" className={styles.contact}>
            Contact Divyanshi Road Lines today
          </Link>{" "}
          — where technology meets trust on every route.
        </p>
      </section>
    </div>
  );
};

export default About;
