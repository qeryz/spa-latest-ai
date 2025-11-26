const apiUrl = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export const fetchChatResponse = async (
  message: string,
  currentLocation?: { lat: number; lng: number; address: string }
): Promise<{ result: string; newLocation?: { lat: number; lng: number; formatted_address: string } }> => {
  try {
    const response = await fetch(`${apiUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, currentLocation }),
    });
    const data = await response.json();
    if (response.ok && data.result) {
      return { result: data.result, newLocation: data.newLocation };
    } else {
      return { result: "Sorry, I couldn't process that request." };
    }
  } catch (error) {
    return { result: "An error occurred while fetching the response." };
  }
};
