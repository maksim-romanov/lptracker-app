import { Redirect } from "expo-router";

export default function Index() {
  // Redirect to onboarding on initial load
  // In the future, this can check if user has completed onboarding
  return <Redirect href="/onboarding" />;
}
