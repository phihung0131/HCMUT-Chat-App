import React, { useRef, useEffect, useState } from 'react';
import { FaArrowDown } from 'react-icons/fa'; // Import icon từ react-icons

const MessageList = ({ messages, currentUser }) => {
  const messagesEndRef = useRef(null);
  const [isNearBottom, setIsNearBottom] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    const container = document.querySelector('.messages-container');
    const isNearBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
    setIsNearBottom(isNearBottom);
  };

  useEffect(() => {
    const container = document.querySelector('.messages-container');
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isNearBottom) {
      scrollToBottom();
    }
  }, [messages, isNearBottom]);

  return (
    <div className="messages-container">
      {messages.map((message) => (
        <div key={message.id} className={`message ${message.user_id === currentUser.id ? 'current-user' : ''}`}>
          <img src="https://demoda.vn/wp-content/uploads/2023/01/hinh-avatar-cute-dang-yeu-ba-dao.jpg" alt="Avatar" className="avatar" />
          <div>
            <p className="message-content">{message.content}</p>
            <small className="message-timestamp">
              {new Date(message.created_at).toLocaleString()}
            </small>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
      {!isNearBottom && <FaArrowDown onClick={scrollToBottom} className="scroll-to-bottom-icon" />}
    </div>
  );
};

export default MessageList;
