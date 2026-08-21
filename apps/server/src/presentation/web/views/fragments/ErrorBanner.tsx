import { IconAlert } from "../Icons";

export const ErrorBanner = ({ message }: { message: string }) => {
  // message is rendered as escaped text by hono/jsx (never raw()).
  return (
    <div role="alert" class="flex items-center gap-2 rounded-md border border-outline p-3">
      <IconAlert size={18} />
      <span>{message}</span>
    </div>
  );
};
