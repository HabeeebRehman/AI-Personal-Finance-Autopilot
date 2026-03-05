import LoginScreen from "../../src/screens/LoginScreen";
import { useRouter } from "expo-router";

export default function LoginRoute() {
  const router = useRouter();

  const handleNavigateToRegister = () => {
    router.push("/register" as any);
  };

  return <LoginScreen onNavigateToRegister={handleNavigateToRegister} />;
}
