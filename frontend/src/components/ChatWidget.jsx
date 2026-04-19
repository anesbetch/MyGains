import { useEffect, useRef, useState } from 'react';
import { getChatSettings, sendChatMessage } from '../services/api';

const quickPrompts = [
  'My goal is muscle gain, I am vegan, and my budget is mid. Which protein is best?',
  'I am a beginner. Suggest budget gym accessories.',
  'What supplement is good for fat loss on a budget?',
];

function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hi! I help users choose the right fitness products, answer product questions in real time, and make shopping easy, smart, and beginner-friendly. Tell me your goal, diet, and budget for a smarter suggestion.'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);
  const messageEndRef = useRef(null);

  useEffect(() => {
    getChatSettings().then(setSettings).catch(() => setSettings(null));
  }, []);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const dispatchMessage = async (nextMessage) => {
    setMessages((prev) => [...prev, { role: 'user', text: nextMessage }]);
    setLoading(true);
    try {
      const data = await sendChatMessage(nextMessage);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        text: data.response,
        source: data.response_source,
        matchedQuestion: data.matched_question,
      }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'assistant', text: error.message || 'Sorry, I could not reply right now.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;
    const nextMessage = message.trim();
    setMessage('');
    await dispatchMessage(nextMessage);
  };

  const sourceLabel = (source) => {
    if (source === 'custom_qa') return 'Admin FAQ';
    if (source === 'external_api') return 'External API';
    if (source === 'openai') return 'AI';
    if (source === 'smart_recommendation') return 'Smart Recommendation';
    return 'Assistant';
  };

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-panel">
          <div className="chat-header">
            <div>
              <strong>MyGains Assistant</strong>
              <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>
                {settings?.assistant_purpose || 'AI product guidance for fitness shoppers'}
              </div>
              <div style={{ fontSize: '0.78rem', opacity: 0.75, marginTop: 2 }}>
                {settings?.prompt_hint || 'Tell me your goal, diet, and budget for a smarter suggestion.'}
              </div>
            </div>
            <button onClick={() => setOpen(false)}>×</button>
          </div>
          <div className="chat-messages">
            {messages.map((item, index) => (
              <div key={index} className={`chat-message ${item.role}`}>
                <div style={{ whiteSpace: 'pre-line' }}>{item.text}</div>
                {item.role === 'assistant' && item.source ? (
                  <small style={{ display: 'block', marginTop: 6, opacity: 0.7 }}>
                    Source: {sourceLabel(item.source)}{item.matchedQuestion ? ` • Matched: ${item.matchedQuestion}` : ''}
                  </small>
                ) : null}
              </div>
            ))}
            {loading && <div className="chat-message assistant">Thinking...</div>}
            <div ref={messageEndRef} />
          </div>
          <div style={{ padding: '0 12px 12px' }}>
            <div style={{ fontSize: '0.8rem', marginBottom: 8, opacity: 0.8 }}>Quick prompts</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => !loading && dispatchMessage(prompt)}
                  style={{
                    borderRadius: 999,
                    border: '1px solid #ddd',
                    padding: '6px 10px',
                    background: '#fff',
                    color: '#111',
                    fontSize: '0.78rem'
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
          <form onSubmit={handleSend} className="chat-form">
            <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ask about supplements, protein types, goals, diet, or budget..." />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
      <button className="chat-toggle" onClick={() => setOpen((prev) => !prev)}>
        {open ? 'Close Chat' : 'AI Assistant'}
      </button>
    </div>
  );
}

export default ChatWidget;
