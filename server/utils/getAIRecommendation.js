export async function getAIRecommendation(userPrompt, products) {
  const API_KEY = process.env.GROQ_API_KEY;

  if (!API_KEY) {
    throw new Error("GROQ_API_KEY is not defined in environment variables.");
  }

  const prompt = `
You are an AI assistant for an e-commerce website.

Here is a list of available products:
${JSON.stringify(products, null, 2)}

User request:
"${userPrompt}"

Return ONLY the matching products as a valid JSON array.
Do NOT include explanations.
Do NOT include markdown.
Return pure JSON.
`;

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content:
                "You are a strict JSON generator. Always return valid JSON only.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.2,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || "Groq API error");
    }

    const aiText = data?.choices?.[0]?.message?.content?.trim();

    if (!aiText) {
      throw new Error("AI response is empty.");
    }

    // Remove accidental markdown if model still adds it
    const cleanedText = aiText.replace(/```json|```/g, "").trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("AI Recommendation Error:", error.message);
    throw new Error("Failed to generate AI recommendations.");
  }
}