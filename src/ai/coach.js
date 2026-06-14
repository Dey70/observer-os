const GROQ_API_KEY = process.env.GROQ_API_KEY;

const askGroq = async (messages) => {
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    },
  );

  const data = await response.json();
  return data.choices[0].message.content;
};

export const askCoach = async (userMessage, recentLogs, recentSessions) => {
  const logsContext =
    recentLogs.length > 0
      ? recentLogs
          .map(
            (l) =>
              `${l.date}: Sleep ${l.sleep_hours}hrs (quality ${l.sleep_quality}/10), ` +
              `Mood ${l.mood}/10, Energy ${l.energy}/10, ` +
              `Soreness ${l.soreness}/10, Fatigue ${l.fatigue}/10` +
              (l.notes ? `, Notes: ${l.notes}` : ""),
          )
          .join("\n")
      : "No check-in data yet.";

  const sessionsContext =
    recentSessions.length > 0
      ? recentSessions
          .map(
            (s) =>
              `${s.date}: ${s.type} — ${s.duration} mins, RPE ${s.rpe}` +
              (s.notes ? `, ${s.notes}` : ""),
          )
          .join("\n")
      : "No sessions logged yet.";

  const systemPrompt = `You are Observer, a personal AI performance coach. You are direct, smart, and evidence-based.

You are coaching a hybrid athlete who is also a BTech AI&DS student doing an internship. He trains (running and lifting), studies seriously, and wants to optimize performance across all areas simultaneously.

Your philosophy:
- Long-term sustainability over short-term gains
- Recovery is as important as training
- Mental state and study load affect physical performance and vice versa
- Be honest, not reassuring — tell him what the data actually suggests

Here is his recent data:

DAILY CHECK-INS (last 14 days):
${logsContext}

TRAINING SESSIONS (last 14 days):
${sessionsContext}

Always ground your responses in his actual data. If data is missing, say so and ask him to log more. Keep responses concise and actionable. Never give generic fitness advice.`;

  return await askGroq([
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage },
  ]);
};
