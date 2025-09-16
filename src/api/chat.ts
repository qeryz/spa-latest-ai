const apiUrl = import.meta.env.VITE_API_URL;

export const fetchChatResponse = async (message: string): Promise<string> => {
  try {
    const response = await fetch(`${apiUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const data = await response.json();
    if (response.ok && data.result) {
      return data.result;
    } else {
      return "Sorry, I couldn't process that request.";
    }
  } catch (error) {
    return "An error occurred while fetching the response.";
  }
};
