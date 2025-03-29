import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import './UserSpace.css';

function UserSpace() {
  const [fields, setFields] = useState([]);
  const [news, setNews] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [password, setPassword] = useState('');
  const [newFields, setNewFields] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // { conversation_id, messages }
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [conversations, setConversations] = useState([]); // History of conversation IDs
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const token = Cookies.get('access_token');
        const response = await axios.get('/auth/api/getUserFields', {
          headers: { 'Access-Token': token },
        });
        if (response.status === 200) {
          const userFields = Object.keys(response.data).filter(
            (key) => response.data[key] === true || response.data[key] === 'true'
          );
          setFields(userFields);
          setNewFields(userFields);
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Failed to fetch fields:', error);
        navigate('/login');
      }
    };

    fetchFields();

    const ws = new WebSocket("ws://" + location.host + "/livenews/");

    ws.onopen = () => {
      console.log('Connected to live news WebSocket');
    };

    ws.onmessage = (event) => {
      const newsItem = JSON.parse(event.data);
      setNews((prev) => [newsItem, ...prev]);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
    };

    return () => ws.close();
  }, [navigate]);

  const toggleSettings = () => setShowSettings(!showSettings);

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = Cookies.get('access_token');
      await axios.post(
        '/auth/api/fields',
        { fields: newFields },
        { headers: { 'Access-Token': token } }
      );
      setFields(newFields);
      setPassword('');
      setShowSettings(false);
    } catch (error) {
      console.error('Failed to update settings:', error);
      alert('Failed to update settings');
    }
  };

  const toggleField = (field) => {
    setNewFields((prev) =>
      prev.includes(field)
        ? prev.filter((f) => f !== field)
        : [...prev, field]
    );
  };

  const openChat = (newsItem) => {
    const initialMessage = {
      type: 'news',
      content:
        newsItem.formWhere === 'NEWS'
          ? `${newsItem.title}\n${newsItem.subj}`
          : newsItem.text,
    };
    setActiveChat({
      conversation_id: newsItem.conversation_id,
      messages: [initialMessage],
    });
    if (!conversations.includes(newsItem.conversation_id)) {
      setConversations((prev) => [...prev, newsItem.conversation_id]);
    }
  };

  const fetchConversationHistory = async (convId) => {
    try {
      const token = Cookies.get('access_token');
      const response = await axios.post(
        '/ai/api/getConv',
        { conversation_id: convId},
        { headers: { 'Access-Token': token } }
      );
      const messages = response.data.map((msg) => ({
        type: msg.type || (msg.from === 'user' ? 'user' : 'ai'),
        content: msg.content,
      }));
      setActiveChat({ conversation_id: convId, messages });
    } catch (error) {
      console.error('Failed to fetch conversation history:', error);
      alert('Failed to load conversation history');
    }
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || !activeChat || isSending) return;

    const userMessage = { type: 'user', content: chatInput };
    setActiveChat((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
    }));
    setChatInput('');
    setIsSending(true);

    try {
      const token = Cookies.get('access_token');
      const response = await axios.post(
        '/ai/api/chat',
        {
          question: userMessage.content,
          conversation_id: activeChat.conversation_id,
        },
        { headers: { 'Access-Token': token } }
      );
      const aiMessage = { type: 'ai', content: response.data.answer };
      setActiveChat((prev) => ({
        ...prev,
        messages: [...prev.messages, aiMessage],
      }));
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const availableFields = ['football', 'ai', 'it', 'cybersec', 'politic', 'crypto'];

  return (
    <div className="user-space-container">
      <div className="sidebar">
        <h3>Your Fields</h3>
        <ul>
          {fields.length > 0 ? (
            fields.map((field) => (
              <li key={field} className="field-item">
                {field}
              </li>
            ))
          ) : (
            <li>No fields selected</li>
          )}
        </ul>
        <div className="sidebar-buttons">
          <button onClick={toggleSettings} className="icon-btn settings-icon" title="Settings">
            ⚙️
          </button>
        </div>
        <h3>History</h3>
        <ul className="conversation-history">
          {conversations.map((convId) => (
            <li
              key={convId}
              className="history-item"
              onClick={() => fetchConversationHistory(convId)}
            >
              {convId}
            </li>
          ))}
        </ul>
      </div>

      <div className="main-content">
        <h2>Your News Feed</h2>
        <div className="news-feed">
          {news.length > 0 ? (
            news.map((item, index) => (
              <div key={index} className="news-post">
                <div className="post-header">
                  <span className="post-source">
                    {item.formWhere === 'NEWS' ? item.source : item.username}
                  </span>
                  <span className="post-time">
                    {formatDate(item.formWhere === 'NEWS' ? item.publishDate : item.real_time)}
                  </span>
                </div>
                <div className="post-content">
                  <h3>{item.formWhere === 'NEWS' ? item.title : item.text.split('\n')[0]}</h3>
                  <p>{item.formWhere === 'NEWS' ? item.subj : item.text}</p>
                  {item.newsImage && <img src={item.newsImage} alt="News" className="post-image" />}
                  {item.formWhere === 'Twitter' && item.likes && (
                    <div className="post-likes">Likes: {item.likes}</div>
                  )}
                  {item.formWhere === 'NEWS' && (
                    <a href={item.newsUrl} target="_blank" rel="noopener noreferrer" className="post-link">
                      Read more
                    </a>
                  )}
                  <button className="conversation-btn" onClick={() => openChat(item)}>
                    Take Conversation
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No news available yet.</p>
          )}
        </div>
      </div>

      {activeChat && (
        <div className="chat-panel">
          <div className="chat-header">
            <h3>Conversation {activeChat.conversation_id}</h3>
            <button className="close-btn" onClick={() => setActiveChat(null)}>
              ×
            </button>
          </div>
          <div className="chat-messages">
            {activeChat.messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chat-message ${msg.type === 'user' ? 'user-message' : 'ai-message'}`}
              >
                {msg.content}
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type your message..."
              className="input-field"
              disabled={isSending}
            />
            <button
              className={`send-btn ${isSending ? 'sending' : ''}`}
              onClick={sendMessage}
              disabled={isSending}
            >
              {isSending ? '...' : 'Send'}
            </button>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="settings-modal">
          <form onSubmit={handleSettingsSubmit} className="settings-form">
            <h3>Update Settings</h3>
            <label>
              New Password:
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current"
                className="input-field"
              />
            </label>
            <h4>Update Fields</h4>
            <div className="fields-grid">
              {availableFields.map((field) => (
                <button
                  key={field}
                  type="button"
                  onClick={() => toggleField(field)}
                  className={`field-btn ${newFields.includes(field) ? 'selected' : ''}`}
                >
                  {field}
                </button>
              ))}
            </div>
            <button type="submit" className="submit-btn">Save</button>
            <button type="button" onClick={toggleSettings} className="cancel-btn">
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default UserSpace;