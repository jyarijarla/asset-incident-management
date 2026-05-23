const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const INDUSTRY_CONTEXTS = {
  technology: {
    persona: 'You are an IT operations analyst.',
    categories: 'hardware|software|network|security|access|performance|other',
    priorityContext: [
      'critical: system down, security breach, or data loss',
      'high: major functionality impaired, affects multiple users',
      'medium: partial functionality affected, workaround exists',
      'low: minor issue, cosmetic, single user affected',
    ],
  },
  av_events: {
    persona: 'You are an AV production specialist managing live event equipment.',
    categories: 'audio|lighting|video|power|connectivity|structural|other',
    priorityContext: [
      'critical: show-stopping failure during or immediately before a live event',
      'high: major signal loss or system failure with no backup available',
      'medium: degraded performance but the show can continue',
      'low: minor issue that does not affect show quality',
    ],
  },
  healthcare: {
    persona: 'You are a biomedical equipment technician at a healthcare facility.',
    categories: 'medical_device|it_system|facility|safety|compliance|other',
    priorityContext: [
      'critical: patient safety risk or life-support device failure',
      'high: clinical workflow severely impacted, no alternate available',
      'medium: device degraded but a clinical alternate exists',
      'low: minor issue with no immediate clinical impact',
    ],
  },
  restaurant: {
    persona: 'You are a restaurant equipment and facilities manager.',
    categories: 'kitchen_equipment|refrigeration|pos_system|hvac|facility|other',
    priorityContext: [
      'critical: food safety risk, refrigeration failure, or unable to serve customers',
      'high: major cooking equipment down, service severely impacted',
      'medium: workaround available but throughput is reduced',
      'low: minor issue with no immediate impact on service',
    ],
  },
  education: {
    persona: 'You are an educational technology coordinator.',
    categories: 'technology|lab_equipment|facility|av_system|other',
    priorityContext: [
      'critical: campus-wide outage or safety issue',
      'high: classroom instruction severely impacted',
      'medium: partial functionality, class can continue with a workaround',
      'low: minor inconvenience or cosmetic issue',
    ],
  },
  manufacturing: {
    persona: 'You are a manufacturing equipment maintenance engineer.',
    categories: 'machinery|safety|it_system|facility|logistics|other',
    priorityContext: [
      'critical: production line stopped, safety hazard, or regulatory violation',
      'high: significant production slowdown or major equipment degraded',
      'medium: reduced efficiency but production continues',
      'low: minor issue, good candidate for scheduled maintenance',
    ],
  },
  retail: {
    persona: 'You are a retail operations and equipment manager.',
    categories: 'pos_system|security|facility|inventory_system|other',
    priorityContext: [
      'critical: unable to process sales or major security breach',
      'high: checkout severely impacted, customer experience degraded',
      'medium: workaround available, reduced efficiency',
      'low: minor issue with no immediate customer impact',
    ],
  },
  other: {
    persona: 'You are an operations analyst.',
    categories: 'equipment|system|facility|it|other',
    priorityContext: [
      'critical: complete failure with safety or major operational impact',
      'high: major functionality impaired',
      'medium: partial functionality, workaround exists',
      'low: minor issue affecting a single asset or user',
    ],
  },
};

const analyzeTicket = async (title, description, assetName, industry = 'technology') => {
  try {
    const ctx = INDUSTRY_CONTEXTS[industry] || INDUSTRY_CONTEXTS.other;

    const prompt = `${ctx.persona} Analyze this incident ticket and respond ONLY with a JSON object, no other text.

Ticket Title: ${title}
Description: ${description}
Affected Asset: ${assetName || 'Unknown'}

Respond with exactly this JSON structure:
{
  "priority": "low|medium|high|critical",
  "category": "${ctx.categories}",
  "recommendation": "brief actionable recommendation in 1-2 sentences"
}

Priority guidelines:
${ctx.priorityContext.map((l) => `- ${l}`).join('\n')}`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = message.content[0].text
      .trim()
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

const gradeResolution = async (ticket, aiTriage, resolution, industry = 'technology') => {
  try {
    const ctx = INDUSTRY_CONTEXTS[industry] || INDUSTRY_CONTEXTS.other;

    const prompt = `${ctx.persona} You are evaluating a technician's resolution write-up for an incident ticket. Grade it rigorously and respond ONLY with a JSON object, no other text.

ORIGINAL TICKET
Title: ${ticket.title}
Description: ${ticket.description}
Affected Asset: ${ticket.asset_name || 'Unknown'}

AI TRIAGE ANALYSIS
Suggested Priority: ${aiTriage?.priority || 'Not analyzed'}
Category: ${aiTriage?.category || 'Not analyzed'}
Recommendation: ${aiTriage?.recommendation || 'Not analyzed'}

TECHNICIAN RESOLUTION
Steps Taken: ${resolution.steps}
Root Cause Identified: ${resolution.root_cause}
Solution Applied: ${resolution.solution_applied}

Grade this resolution on a 0-100 scale using these criteria:
- Root cause analysis quality (35%): Is the root cause correctly identified and well explained?
- Steps documentation (25%): Are the diagnostic and remediation steps clear, logical, and complete?
- Solution appropriateness (25%): Does the fix address the root cause and align with the AI recommendation?
- Recurrence prevention (15%): Does the resolution reduce the likelihood of this issue recurring?

Respond with exactly this JSON structure:
{
  "grade": "A|B|C|D|F",
  "score": 0-100,
  "feedback": "2-3 sentence overall assessment of the resolution quality",
  "strengths": ["specific strength 1", "specific strength 2"],
  "improvements": ["specific improvement 1", "specific improvement 2"]
}

Grade mapping: A=90-100, B=75-89, C=60-74, D=50-59, F=0-49
Be strict but fair. Vague or incomplete write-ups should score low.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = message.content[0].text
      .trim()
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    const parsed = JSON.parse(raw);

    return {
      grade: parsed.grade,
      score: parseInt(parsed.score, 10),
      feedback: parsed.feedback,
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
    };
  } catch (err) {
    console.error('AI grading error:', err);
    return null;
  }
};

module.exports = { analyzeTicket, gradeResolution };