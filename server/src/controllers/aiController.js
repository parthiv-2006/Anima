import Groq from 'groq-sdk';
import { User } from '../models/User.js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

    const completion = await groq.chat.completions.create({
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

    const completion = await groq.chat.completions.create({
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
