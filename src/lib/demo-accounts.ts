export const DEMO_ACCOUNTS = [
  {
    label: "Admin Demo",
    role: "admin" as const,
    email: "demo.admin@nextgentms.com",
    password: "Admin@12345",
  },
  {
    label: "Dispatcher Demo",
    role: "dispatcher" as const,
    email: "demo.dispatcher@nextgentms.com",
    password: "Dispatch@12345",
  },
  {
    label: "Customer Demo",
    role: "customer" as const,
    email: "demo.customer@nextgentms.com",
    password: "Customer@12345",
  },
] as const;
