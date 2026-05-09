const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const analyzeTicket = async (title, description, assetName) => {
  try {
    const prompt = `You are an IT operations analyst. Analyze this incident ticket and respond ONLY with a JSON object, no other text.

Ticket Title: ${title}
Description: ${description}
Affected Asset: ${assetName || 'Unknown'}

Respond with exactly this JSON structure:
{
  "priority": "low|medium|high|critical",
  "category": "hardware|software|network|security|access|performance|other",
  "recommendation": "brief actionable recommendation in 1-2 sentences"
}

Priority guidelines:
- critical: system down, security breach, data loss
- high: major functionality impaired, affects multiple users
- medium: partial functionality affected, workaround exists
- low: minor issue, cosmetic, single user affected`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = message.content[0].text.trim()
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
    const parsed = JSON.parse(raw);

    return {
      priority: parsed.priority,
      category: parsed.category,
      recommendation: parsed.recommendation,
    };
  } catch (err) {
    console.error('AI triage error:', err);
    return null;
  }
};

module.exports = { analyzeTicket };