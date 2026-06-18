const waitlistUrl = "https://tally.so/r/WOZGRN";
const waitlistMatch = waitlistUrl.match(/\/r\/([A-Za-z0-9]+)/);
if (!waitlistMatch) throw new Error(`waitlistUrl missing /r/<id>: ${waitlistUrl}`);
const waitlistFormId = waitlistMatch[1];

export default {
  brand: "Depthly",
  title: "Depthly — Onchain portfolio monitoring",
  description: "Track every position across every chain.",
  url: "https://depthly.app",
  ogImage: "/assets/img/og.png",

  waitlistUrl,
  waitlistFormId,

  hero: {
    headline: "Onchain portfolio monitoring.",
    sub: "Track every position across every chain.",
  },

  cta: {
    eyebrow: "In development",
    title: "Be first to know when we launch.",
    button: "Join the waitlist",
    note: "No spam. One email when we ship.",
  },
};
