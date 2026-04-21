const express = require("express");
const router = express.Router();

// AI Chat — proxies to Anthropic API
router.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        system: `You are QuickServe AI, a helpful assistant for an urban home services platform. 
Help users identify what service they need (AC Repair, Plumbing, Laundry, Grooming, Electrical, Cleaning, Carpentry, Pest Control).
Ask clarifying questions to understand their problem. 
Respond concisely (2-3 sentences max). 
Always end by recommending a service category from the list above.
Format: Give advice, then on a new line write "RECOMMENDED_SERVICE: <category>" if you can determine the service.`,
        messages,
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || "Sorry, I couldn't process that. Please try again.";

    // Extract recommended service if present
    const serviceMatch = text.match(/RECOMMENDED_SERVICE:\s*(.+)/);
    const recommendedService = serviceMatch ? serviceMatch[1].trim() : null;
    const cleanText = text.replace(/RECOMMENDED_SERVICE:.+/, "").trim();

    res.json({ message: cleanText, recommendedService });
  } catch (err) {
    res.status(500).json({ message: "AI service unavailable", error: err.message });
  }
});

module.exports = router;
