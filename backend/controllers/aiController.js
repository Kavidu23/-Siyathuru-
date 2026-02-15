const { HfInference } = require("@huggingface/inference");
const Community = require("../models/communities"); // adjust name if different

const hf = new HfInference(process.env.HF_TOKEN);

const askAI = async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage || !String(userMessage).trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    // 1️⃣ Get public communities
    const communities = await Community.find();

    // 2️⃣ Convert to readable text
    const communityText = communities.map(c => `
Name: ${c.name}
Type: ${c.type}
Mission: ${c.mission}
Description: ${c.description}
Location: ${c.location?.address || ""}
`).join("\n");

    // 3️⃣ Create prompt
    const prompt = `
You are an assistant helping users find suitable Sri Lankan communities.

Communities:
${communityText}

User Question:
${userMessage}

Recommend the best matching communities and explain why.
`;

    // 4️⃣ Call Hugging Face model
    const response = await hf.chatCompletion({
      model: "mistralai/Mistral-7B-Instruct-v0.2",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300
    });

    const reply = response?.choices?.[0]?.message?.content || "";
    res.json({ reply });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "AI error",
      details: error?.message || "Unknown error",
    });
  }
};

module.exports = { askAI };
