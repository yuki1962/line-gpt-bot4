
const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const CHANNEL_ACCESS_TOKEN = "MF0W2sLvZHnGzYqC1TrKLCZUCtT/LJYO7jxuJyxa0PPXIKM8YW+dadnCzMoxNXowssHnRWEdFglFrKQ5vyvRqggxQtLbkrQUot/vLY3Uf5VKGGK/Oh/plIg5sHLs6aA/vKshB8q/kr0e/AcIHl/9iwdB04t89/1O/w1cDnyilFU=";
const GROQ_API_KEY = "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";

app.post("/webhook", async (req, res) => {
  const event = req.body.events?.[0];
  if (event?.message?.type === "text") {
    try {
      const userText = event.message.text;

      const groqResp = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama3-8b-8192",
          messages: [
          { role: "system", content: "あなたは親切な日本語アシスタントです。必ず日本語で答えてください。" },

            { role: "user", content: userText },
          ],
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const replyText = groqResp.data.choices?.[0]?.message?.content ?? "返答がありません";

      await axios.post(
        "https://api.line.me/v2/bot/message/reply",
        {
          replyToken: event.replyToken,
          messages: [{ type: "text", text: replyText }],
        },
        {
          headers: {
            Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error("エラー:", error.response?.data || error.message);
    }
  }
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on ${PORT}`));
