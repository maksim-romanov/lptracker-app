import { IconAlert } from "../Icons";

export const ErrorBanner = ({ message }: { message: string }) => {
  // message is rendered as escaped text by hono/jsx (never raw()).
  return (
    <div role="alert" class="alert alert-error error-banner">
      <IconAlert size={18} />
      <span>{message}</span>
    </div>
  );
};
