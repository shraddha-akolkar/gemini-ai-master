const API_KEY = "AIzaSyDiEA_6vyVVosqnj8B_C90nTmvJhnQAibU";

export const getGeminiResponse = async (message, conversationHistory = []) => {
  try {
    // Build conversation history
    const contents = conversationHistory.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Add current message
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: contents,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `HTTP error! status: ${response.status} - ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json();
    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ No answer returned"
    );
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
