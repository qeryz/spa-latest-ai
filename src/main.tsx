import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Function to dynamically load the Google Maps script
function loadGoogleMapsScript() {
  // Check if the script is already loaded to avoid duplicates
  if (
    document.querySelector(
      'script[src^="https://maps.googleapis.com/maps/api/js"]'
    )
  ) {
    return;
  }

  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  }&libraries=places`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

// Load the script before rendering the app
loadGoogleMapsScript();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
