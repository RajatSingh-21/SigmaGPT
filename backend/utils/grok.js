import "dotenv/config";

const getGrokAIAPIStream = async (messages) => {
  const options = {
    method: "POST",
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: messages,
    }),
  };
  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      options,
    );
    const data = await response.json();
    // console.log(data.choices[0].message.content);
    return data.choices[0].message.content;
  } catch (err) {
    console.log(err);
  }
};
export default getGrokAIAPIStream;
