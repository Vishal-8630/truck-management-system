import styles from "./Home.module.scss";
import HeroSectionImg from "../../assets/truck.jpg";
import { motion } from "framer-motion";
import { Truck, Package, Share2, Building2, Settings } from "lucide-react";
import ServiceCard from "../../components/ServiceCard";

const Home = () => {
  const iconSize = 40;
  const cardDate = [
    {
      icon: <Truck size={iconSize} />,
      title: "Freight Serves",
      description: "D2D | PTL | SCM | Projects",
    },
    {
      icon: <Package size={iconSize} />,
      title: "Transportation",
      description: "Core Transportation, Distribution Management",
    },
    {
      icon: <Share2 size={iconSize} />,
      title: "3PL & 4PL",
      description: "Outsourced Logistics Solutions",
    },
    {
      icon: <Building2 size={iconSize} />,
      title: "Supply Chain",
      description: "End-to-End Supply Chain Management",
    },
    {
      icon: <Settings size={iconSize} />,
      title: "Project Logistics",
      description: "Heavy-list & Specialized Haulage",
    },
  ];

  return (
    <div className={styles.homePage}>
      <motion.div
        className={styles.heroSection}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <h1 className={styles.heroHeading}>
          Reliable Logistics & Supply Chain Partner
        </h1>
        <div className={styles.heroContent}>
          <div className={styles.content}>
            <p className={styles.heroPara}>
              Delivering Excellence in Freight, Transportation, and Supply Chain
              Solutions.
            </p>
            <div className={styles.heroControls}>
              <button className={styles.quoteBtn}>Get a Quote</button>
              <button className={styles.contactBtn}>Contact Us</button>
            </div>
          </div>
          <img src={HeroSectionImg} alt="Hero Image" className={styles.heroSectionPic}/>
        </div>
      </motion.div>
      <motion.div
        className={styles.aboutSection}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <h1 className={styles.aboutHeading}>About Us</h1>
        <div className={styles.aboutContent}>
          <p className={styles.aboutPara}>
            Divyanshi Road Lines specializes in end-to-end logistics and supply
            chain management. With decades of expertise, we deliver
            cost-effective, reliable, and innovative solutions tailored to your
            business needs.
          </p>
        </div>
        <div className={styles.aboutControls}>
          <button className={styles.aboutBtn}>Read More</button>
        </div>
      </motion.div>
      <div className={styles.servicesSection}>
        <h1 className={styles.servicesHeading}>Our Services</h1>
        <div className={styles.servicesCards}>
          {cardDate.map((card, index) => (
            <ServiceCard
              key={index}
              icon={card.icon}
              title={card.title}
              description={card.description}
            />
          ))}
        </div>
      </div>
      <div className={styles.contactSection}>
        <h1 className={styles.heading}>Contact Us</h1>
        <div className={styles.contactInformation}>
          <p>
            📍 Plot No.230,231, Sec-6 Near RTO Office, Transport Nagar Agra, UP
            – 282007
          </p>
          <p>📞 +91 8630836045 / +91 7983635608</p>
          <p>📧 drldivyanshi@gmail.com</p>
        </div>
        <button className={styles.inquiryBtn}>Send Inquiry</button>
      </div>
    </div>
  );
};

export default Home;
