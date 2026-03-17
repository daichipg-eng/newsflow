const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request) {
  if (!GEMINI_API_KEY) {
    return Response.json(
      { error: "Gemini APIキーが設定されていません。.env.localにGEMINI_API_KEYを追加してください。" },
      { status: 503 }
    );
  }

  const { title, description, source } = await request.json();

  if (!title) {
    return Response.json({ error: "タイトルが必要です" }, { status: 400 });
  }

  const prompt = `以下のニュース記事を日本語で3行以内に簡潔に要約してください。重要なポイントと背景を含めてください。

タイトル: ${title}
ソース: ${source || "不明"}
説明: ${description || "なし"}

要約:`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 256,
          },
        }),
      }
    );

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (text) {
      return Response.json({ summary: text.trim() });
    }

    return Response.json({ error: "要約の生成に失敗しました" }, { status: 500 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
