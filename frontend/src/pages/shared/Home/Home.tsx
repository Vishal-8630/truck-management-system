import { useAuthStore } from "@/store/useAuthStore";
import LandingHome from "./LandingHome";
import Dashboard from "./Dashboard";

const Home = () => {
  const { user } = useAuthStore();

  if (user) {
    return <Dashboard />;
  }

  return <LandingHome />;
};

export default Home;
