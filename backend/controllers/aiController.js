const { HfInference } = require('@huggingface/inference');
const Community = require('../models/communities');

const hf = new HfInference(process.env.HF_TOKEN);
const DEFAULT_CHAT_MODEL = 'meta-llama/Llama-3.3-70B-Instruct';

async function getChatCompletionWithFallback(prompt) {
  const modelCandidates = [process.env.HF_CHAT_MODEL, DEFAULT_CHAT_MODEL].filter(Boolean);

  let lastError;

  for (const model of modelCandidates) {
    try {
      return await hf.chatCompletion({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
      });
    } catch (err) {
      lastError = err;
      const code = err?.httpResponse?.body?.error?.code;

      // Try the next candidate only when the model is not supported.
      if (code !== 'model_not_supported') {
        throw err;
      }
    }
  }

  throw lastError || new Error('No supported chat model found');
}

const askAI = async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage || !String(userMessage).trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const communities = await Community.find();

    const communityText = communities
      .map(
        (c) => `
Name: ${c.name}
Type: ${c.type}
Mission: ${c.mission}
Description: ${c.description}
Location: ${c.location?.address || ''}
`,
      )
      .join('\n');

    const prompt = `
You are an assistant helping users find suitable Sri Lankan communities.

Communities:
${communityText}

User Question:
${userMessage}

Recommend the best matching communities and explain why.
`;

    const response = await getChatCompletionWithFallback(prompt);
    const reply = response?.choices?.[0]?.message?.content || '';

    return res.json({ reply });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'AI error',
      details: error?.message || 'Unknown error',
      providerStatus: error?.httpResponse?.status,
      providerError: error?.httpResponse?.body?.error || null,
    });
  }
};

module.exports = { askAI };
