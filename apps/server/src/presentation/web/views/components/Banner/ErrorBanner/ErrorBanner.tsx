import { Banner } from "../Banner/Banner";

export const ErrorBanner = ({ message }: { message: string }) => (
  // message is rendered as escaped text by hono/jsx (never raw()).
  <Banner variant="error">{message}</Banner>
);
