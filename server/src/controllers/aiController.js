import Groq from 'groq-sdk';
import { User } from '../models/User.js';

// Lazy-initialize so missing GROQ_API_KEY only errors when AI routes are actually called,
// not at module import time (keeps unit/integration tests for non-AI routes working).
let _groq;
function getGroq() {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return _groq;
}

const SPECIES_PERSONALITIES = {
  EMBER: {
    emoji: '🔥',
    voice: `You are an Ember-type spirit companion — a fiery, intense, battle-hardened warrior mentor forged in flame.
You speak with raw passion and urgency, using forge, fire, and battle metaphors. You push hard, never accept excuses, and celebrate victories loudly.
Call the user "warrior" or by their name. Keep responses under 130 words. Stay in character at all times.`
  },
  AQUA: {
    emoji: '💧',
    voice: `You are an Aqua-type spirit companion — calm, wise, and flowing like deep ocean water.
You speak with serene depth and patience, using ocean, tide, and water metaphors. You are philosophical and gentle, finding meaning in stillness.
Call the user "traveler" or by their name. Keep responses under 130 words. Stay in character at all times.`
  },
  TERRA: {
    emoji: '🌿',
    voice: `You are a Terra-type spirit companion — grounded, steady, and nurturing like ancient earth.
You speak with warmth and quiet wisdom, using growth, harvest, and nature metaphors. You celebrate consistency over intensity.
Call the user "seeker" or by their name. Keep responses under 130 words. Stay in character at all times.`
  }
};

export async function petChat(req, res) {
  try {
    const { message, chatHistory = [] } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'Message required' });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { pet, habits } = user;
    const species = pet.species || 'EMBER';
    const personality = SPECIES_PERSONALITIES[species] || SPECIES_PERSONALITIES.EMBER;

    // Gather recent completions across habits
    const recentCompletions = [];
    habits.forEach(h => {
      const lastEntry = h.completionLog[h.completionLog.length - 1];
      if (lastEntry) {
        recentCompletions.push({
          name: h.name,
          stat: h.statCategory,
          streak: h.streak,
          date: lastEntry.date
        });
      }
    });
    recentCompletions.sort((a, b) => new Date(b.date) - new Date(a.date));
    const recentText = recentCompletions.slice(0, 5)
      .map(c => `"${c.name}" (${c.stat}, streak: ${c.streak})`)
      .join(', ') || 'none yet';

    const dominantStat = Object.entries(pet.stats)
      .sort((a, b) => b[1] - a[1])[0]?.[0]?.toUpperCase() || 'STR';

    const systemPrompt = `${personality.voice}

HERO CONTEXT (use this to personalize your response):
- Name: ${user.username}
- Companion: ${pet.nickname} — Stage ${pet.stage} ${species}
- HP: ${pet.hp}/100
- Stats: STR ${pet.stats.str} | INT ${pet.stats.int} | SPI ${pet.stats.spi}
- Total XP: ${pet.totalXp} | Dominant: ${dominantStat}
- Recent quests: ${recentText}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.slice(-10).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message }
    ];

    const completion = await getGroq().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 220,
      temperature: 0.88
    });

    const reply = completion.choices[0]?.message?.content?.trim()
      || 'The spirits are restless... try again.';
    return res.json({ reply });
  } catch (err) {
    console.error('Pet chat error:', err);
    return res.status(500).json({ message: 'The spirits are silent. Try again shortly.' });
  }
}

export async function generateNarratives(req, res) {
  try {
    const { entries, petContext } = req.body;
    if (!entries?.length) return res.json({ narratives: [] });

    const { species = 'EMBER', stage = 1, nickname = 'Nova' } = petContext || {};
    const speciesName = species.charAt(0) + species.slice(1).toLowerCase();

    const limited = entries.slice(0, 12);

    const entrySummaries = limited
      .map((e, i) => {
        const statLabel = e.statCategory === 'STR' ? 'physical strength'
          : e.statCategory === 'INT' ? 'intellect and learning'
          : 'spirit and mindfulness';
        const diffLabel = e.difficulty === 1 ? 'minor' : e.difficulty === 2 ? 'challenging' : 'legendary';
        return `${i + 1}. Quest: "${e.habitName}" (${diffLabel} feat of ${statLabel}, earned ${e.xp} XP)${e.note ? `, note: "${e.note}"` : ''}`;
      })
      .join('\n');

    const prompt = `You are a fantasy chronicler writing the hero's adventure log. The hero's ${speciesName}-type spirit companion is named "${nickname}" (Stage ${stage}).

For each quest entry, write exactly 2 vivid sentences of fantasy RPG prose narrating the hero completing it. Be specific to the quest name and category. Use second person ("you").

Respond ONLY with a valid JSON object in this exact format:
{"narratives":[{"idx":0,"text":"..."},{"idx":1,"text":"..."},...]}

Quest entries:
${entrySummaries}`;

    const completion = await getGroq().chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 180 * limited.length,
      temperature: 0.82
    });

    const raw = completion.choices[0]?.message?.content || '';

    let parsed = [];
    try {
      // Extract JSON from the response (model sometimes adds preamble)
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const obj = JSON.parse(jsonMatch[0]);
        parsed = obj.narratives || obj.entries || [];
      }
    } catch {
      parsed = [];
    }

    const narratives = limited.map((entry, i) => {
      const found = parsed.find(n => n.idx === i) || parsed[i];
      return {
        id: entry.id,
        text: found?.text || null
      };
    });

    return res.json({ narratives });
  } catch (err) {
    console.error('Narrate error:', err);
    return res.status(500).json({ message: 'The chronicles are silent.', narratives: [] });
  }
}

// ─── Tool definitions for the agentic loop ────────────────────────────────────
const AGENT_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'create_habit',
      description: 'Create a single new habit/quest for the hero. Use when the user asks to add or create one habit.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Concise action-oriented habit name, e.g. "Morning Run" or "Read 20 Pages"' },
          statCategory: { type: 'string', enum: ['STR', 'INT', 'SPI'], description: 'STR=physical, INT=mental/learning, SPI=mindfulness/spiritual' },
          difficulty: { type: 'integer', minimum: 1, maximum: 3, description: '1=easy, 2=moderate, 3=legendary' }
        },
        required: ['name', 'statCategory', 'difficulty']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'suggest_morning_routine',
      description: 'Create a full set of habits as a morning routine or training plan. Use when the user asks for a routine, plan, or program (creates up to 5 habits at once).',
      parameters: {
        type: 'object',
        properties: {
          habits: {
            type: 'array',
            maxItems: 5,
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                statCategory: { type: 'string', enum: ['STR', 'INT', 'SPI'] },
                difficulty: { type: 'integer', minimum: 1, maximum: 3 }
              },
              required: ['name', 'statCategory', 'difficulty']
            }
          }
        },
        required: ['habits']
      }
    }
  }
];

function buildAgentSystemPrompt(personality, user, pet, dominantStat) {
  const habitsSummary = (user.habits || [])
    .map(h => `"${h.name}" (${h.statCategory}, streak: ${h.streak})`)
    .join(', ') || 'none yet';

  return `${personality.voice}

HERO CONTEXT:
- Name: ${user.username}
- Companion: ${pet.nickname} — Stage ${pet.stage} ${pet.species}
- HP: ${pet.hp}/100 | XP: ${pet.totalXp} | Dominant stat: ${dominantStat}
- Stats: STR ${pet.stats.str} | INT ${pet.stats.int} | SPI ${pet.stats.spi}
- Active quests: ${habitsSummary}

You have tools to CREATE habits for the hero. When the hero asks for a routine, plan, or to add/create any habit, you MUST call the appropriate tool immediately — do not merely describe the routine in text and do not ask clarifying questions first; pick sensible defaults yourself. Before calling a tool, briefly state what you are about to do in your message content (can also be null for pure tool calls). Stay in character at all times.`;
}

/**
 * Agentic chat with HITL (human-in-the-loop) tool confirmation.
 *
 * Round 1: model decides whether to call a tool or reply normally.
 *   → If tool call: return { type: 'pending_confirmation', toolCall, assistantMessage }
 *   → If normal:    return { type: 'reply', reply }
 *
 * Round 2 (confirmedToolCall present): execute the tool, then ask the model
 * to craft a final in-character response with the tool result in context.
 *   → return { type: 'reply', reply, sideEffect }
 */
export async function agentChat(req, res) {
  try {
    const { message, chatHistory = [], confirmedToolCall = null } = req.body;
    if (!message?.trim() && !confirmedToolCall) {
      return res.status(400).json({ message: 'Message required' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { pet } = user;
    const species = pet.species || 'EMBER';
    const personality = SPECIES_PERSONALITIES[species] || SPECIES_PERSONALITIES.EMBER;
    const dominantStat = Object.entries(pet.stats)
      .sort((a, b) => b[1] - a[1])[0]?.[0]?.toUpperCase() || 'STR';
    const systemPrompt = buildAgentSystemPrompt(personality, user, pet, dominantStat);

    // ── Round 2: confirmed → execute tool, then get final reply ──────────────
    if (confirmedToolCall) {
      const { id: toolCallId, name, args } = confirmedToolCall;
      let toolResult = '';
      let sideEffect = null;

      if (name === 'create_habit') {
        const { name: habitName, statCategory, difficulty } = args;
        user.habits.push({ name: habitName, statCategory, difficulty });
        await user.save();
        const created = user.habits[user.habits.length - 1];
        toolResult = `Successfully created habit "${habitName}" (${statCategory}, difficulty ${difficulty}).`;
        sideEffect = { type: 'habit_created', habit: created.toObject() };

      } else if (name === 'suggest_morning_routine') {
        const toCreate = (args.habits || []).slice(0, 5);
        for (const h of toCreate) {
          user.habits.push({ name: h.name, statCategory: h.statCategory, difficulty: h.difficulty || 1 });
        }
        await user.save();
        const names = toCreate.map(h => h.name).join(', ');
        toolResult = `Created ${toCreate.length} habits: ${names}.`;
        sideEffect = { type: 'habits_created', count: toCreate.length };
      }

      // Feed the tool result back to the model for an in-character response
      const messagesWithResult = [
        { role: 'system', content: systemPrompt },
        ...chatHistory.slice(-8).map(m => ({ role: m.role, content: m.content })),
        {
          role: 'assistant',
          content: null,
          tool_calls: [{
            id: toolCallId,
            type: 'function',
            function: { name, arguments: JSON.stringify(args) }
          }]
        },
        { role: 'tool', tool_call_id: toolCallId, content: toolResult }
      ];

      const finalCompletion = await getGroq().chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: messagesWithResult,
        max_tokens: 250,
        temperature: 0.85
      });

      const reply = finalCompletion.choices[0]?.message?.content?.trim() || 'Done!';
      return res.json({ type: 'reply', reply, sideEffect });
    }

    // ── Round 1: initial message → model decides ──────────────────────────────
    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.slice(-8).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message }
    ];

    const completion = await getGroq().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      tools: AGENT_TOOLS,
      tool_choice: 'auto',
      max_tokens: 300,
      // Low temperature keeps the create-habit → tool-call mapping reliable;
      // the in-character flavor comes from the round-2 reply at 0.85.
      temperature: 0.3
    });

    const choice = completion.choices[0];
    const assistantMsg = choice.message;

    if (assistantMsg.tool_calls?.length > 0) {
      const tc = assistantMsg.tool_calls[0];
      const args = JSON.parse(tc.function.arguments);
      return res.json({
        type: 'pending_confirmation',
        toolCall: { id: tc.id, name: tc.function.name, args },
        assistantMessage: assistantMsg.content || null
      });
    }

    const reply = assistantMsg.content?.trim() || 'The spirits are restless… try again.';
    return res.json({ type: 'reply', reply });

  } catch (err) {
    console.error('Agent chat error:', err);
    return res.status(500).json({ message: 'The spirits are silent. Try again shortly.' });
  }
}
