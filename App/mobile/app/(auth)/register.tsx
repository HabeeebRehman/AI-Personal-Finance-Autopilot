import RegisterScreen from "../../src/screens/RegisterScreen";
import { useRouter } from "expo-router";

export default function RegisterRoute() {
  const router = useRouter();

  const handleNavigateToLogin = () => {
    router.push("/login" as any);
  };

  return <RegisterScreen onNavigateToLogin={handleNavigateToLogin} />;
}
