import React, { useState } from "react";
import Groq from "groq-sdk";
import "./Chatbot.css";

// Initialize Groq client
const groq = new Groq({
  apiKey: "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", // 🔹 Replace this with your actual API key
  dangerouslyAllowBrowser: true, // Allow API calls from the frontend
});

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Function to send user input to Groq
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages([...messages, userMessage]);
    setLoading(true);

    try {
      const chatCompletion = await groq.chat.completions.create({
        model: "llama3-8b-8192",
        messages: [...messages, 
            {
                role:'system',
                content:'You are an Cooking Assistant',
            },
            {
                role:'system',
                content:`Please provide response in a visually appealing HTML way.Don't use too big tags like h1 or h2.Give response in Italics and Bolds and use emojis to make it more appealing.Each Line should be a separate paragraph strictly and every time.
                for Example : <p><strong>Ingredients:</strong></p><p>1. Eggs</p><p>2. Milk</p><p>3. Sugar</p><p>4. Salt</p><p><strong>Instructions:</strong></p><p>1. Mix all the ingredients in a bowl</p><p>2. Heat the mixture in a pan</p><p>3. Serve hot</p>`,
            },
            userMessage], // Include chat history
        temperature: 1,
        max_tokens: 1000,
        top_p: 1,
        stream: false,
      });

      // Extract response
      const botMessage = {
        role: "assistant",
        content: chatCompletion.choices[0].message.content,
      };

      setMessages([...messages, userMessage, botMessage]);
    } catch (error) {
      console.error("API Error:", error);
      setMessages([
        ...messages,
        { role: "assistant", content: "❌ Error fetching response. Try again." },
      ]);
    }

    setLoading(false);
    setInput(""); // Clear input after sending
  };

  return (
    <div className="chatbot-container">
      <h2>🍎Recipe.AI</h2>
      <div className="chatbox">
        {messages.map((msg, index) => (
          <p key={index} className={msg.role}>
            <strong><i>{msg.role === "user" ? "You: " : "RecipeBot: "}</i> </strong>
            {/* Render HTML content safely */}
            <div dangerouslySetInnerHTML={{ __html: msg.content }} />
          </p>
        ))}
        {loading && <p className="assistant">Typing...</p>}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me for recipes..."
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
