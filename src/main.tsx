import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { seedDatabase } from "./lib/seed-data";

async function enableMocking() {
  if (typeof window === 'undefined') {
    return;
  }

  const { worker } = await import('./lib/api/browser');
  
  await worker.start({
    onUnhandledRequest: 'bypass',
  });
}

enableMocking().then(async () => {
  await seedDatabase();
  createRoot(document.getElementById("root")!).render(<App />);
});
