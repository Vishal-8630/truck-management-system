import styles from "./Home.module.scss";
import HeroSectionImg from "../../assets/truck.jpg";
import { Truck, Package, Share2, Building2, Settings } from "lucide-react";
import ServiceCard from "../../components/ServiceCard";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const { hash } = useLocation();
  const iconSize = 40;
  const cardDate = [
    {
      icon: <Truck size={iconSize} />,
      title: "Freight Serves",
      description: "D2D | PTL | SCM | Projects",
      detail: `Divyanshi Road Lines has been instrumental in providing innovative and value added solutions for Indian Corporate and Multinationals. It’s the only leading multi-modal logistics company with single window integrated logistics services for all the elements of the supply chain management in India. Through its innovative and cost saving
methods, Divyanshi Road Lines has consistently added value for its customers, which can be complimented by our competence to take the driving seat for generating maximum value in cost effectiveness and lean supply chain in India. It has been dealing with corporate, multinational industry and has been pioneer in transportation, and logistics support to the sector.
`,
    },
    {
      icon: <Package size={iconSize} />,
      title: "Transportation",
      description: "Core Transportation, Distribution Management",
      detail: `In a complex, difficult and uneven geographic terrain like India transportation management plays a crucial role in timely delivery of your products. At Divyanshi Road Lines we oversee and manage the entire distribution process to the most complex locations. Our advanced ERP system ensures connectivity and availability of information regarding distribution.`
    },
    {
      icon: <Share2 size={iconSize} />,
      title: "3PL & 4PL",
      description: "Outsourced Logistics Solutions",
            detail: `Outsourcing of logistics function is a business dynamics of growing importance all over the world. A growing awareness that competitive advantage comes from the delivery process as much as from the product has been instrumental in upgrading logistics from its traditional backroom function to a strategic boardroom function. In order to handle its logistics activities effectively and efficiently, a company may consider the following options it can provide the function in-house by making the service, or it can own logistics subsidiaries through setting up or buying a logistics firm, or it can outsource the function and buy the service. Currently, there has been a growing interest in the third option, i.e. outsourcing of logistics functions to third party logistics service providers.

Divyanshi Road Lines  Maps and understands these requirements to place it in the framework of logical execution and provides 3pl, 4pl services.
`
    },
    {
      icon: <Building2 size={iconSize} />,
      title: "Supply Chain",
      description: "End-to-End Supply Chain Management",
      detail: `Supply chain is defined as a set of three or more companies directly linked by one or more of the upstream and downstream flows of the products, services, finances and information from a source to a customer. It consists of all the stages involved, directly or indirectly, in fulfilling a customer's demand. It not only includes the manufacturer and suppliers, but also transporters, warehouses, retailers and customers themselves. Within an organization, the supply chain includes all the functions involved in fulfilling a customer demand. These functions include, but are not limited to, new product development, marketing, operations, distribution, finance and customer service.

The objective of the supply chain is to maximize the overall value generated. The value a supply chain generates is the difference between what the final product is worth to the customer and the effort the supply chain expends in filling the customer’s demand. It is strongly correlated with the supply-chain profitability, the difference between the revenue generated from the customer and the overall costs across the supply chain.

`

    },
    {
      icon: <Settings size={iconSize} />,
      title: "Project Logistics",
      description: "Heavy-list & Specialized Haulage",
      detail: `Divyanshi Road Lines varied project logistics solutions. Heavy haulage solutions include project planning and implementation. Specialized equipment capable of hauling extremely heavy loads available with us provides an end-to- end solution to clients.

Our Logistics Engineering teams support other projects such as project imports and exports and turn-key projects
`
    },
  ];

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [hash]);

  return (
    <div className={styles.homePage}>
      <div className={styles.heroSection}>
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
              <a className={styles.contactBtn} href="#contact">
                Contact Us
              </a>
            </div>
          </div>
          <img
            src={HeroSectionImg}
            alt="Hero Image"
            className={styles.heroSectionPic}
          />
        </div>
      </div>
      <div className={styles.aboutSection}>
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
          <button
            className={styles.aboutBtn}
            onClick={() => navigate("/about")}
          >
            Read More
          </button>
        </div>
      </div>
      <div className={styles.servicesSection}>
        <h1 className={styles.servicesHeading}>Our Services</h1>
        <div className={styles.servicesCards}>
          {cardDate.map((card, index) => (
            <ServiceCard
              key={index}
              icon={card.icon}
              title={card.title}
              description={card.description}
              detail={card.detail}
            />
          ))}
        </div>
      </div>
      <div className={styles.contactSection} id="contact">
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
