export const positionRoutes = {
  detail: (ref: string) => `/positions/${encodeURIComponent(ref)}` as const,
};
