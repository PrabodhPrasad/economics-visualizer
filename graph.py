from groq import Groq

client = Groq(api_key="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")

chat_completion = client.chat.completions.create(
    model="llama3-8b-8192",
    messages=[
        {
            "role": "system",
            "content":
            "You are an analyst bot. Use negative values to show loss, positive values to show ownership. "
            "Respond **only** with a valid JSON array. Do not add any explanation, notes, or extra text. "
            "Return a JSON array of values for graphing, using this format:\n"
            "[\n   {\"sector\": \"...\", \"impact\": number},\n   ...\n]"
        },
        {
            "role": "user",
            "content": "what if cheveron went bankrupt tomorrow"
            "respond in terms of companies"
        }
    ],
    temperature=0
)
data=chat_completion.choices[0].message.content
print(data)