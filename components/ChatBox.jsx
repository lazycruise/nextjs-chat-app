// Component that contains the actual chat UI

import React, { useEffect, useState } from "react";
import { useChannel } from "ably/react";
import styles from "./ChatBox.module.css";

export default function ChatBox() {
  let inputBox = null;
  let messageEnd = null;

  const [messageText, setMessageText] = useState(""); // track the textarea element where the messages will be typed
  const [recievedMessages, setMessages] = useState([]); // stores the on-screen chat history
  const messageTextIsEmpty = messageText.trim().length === 0; // checks if the textarea element is empty to disable the send button

  // Allows us to have up to 200 messages at any maximum time
  // so only the last 199 messages plus the new messages are stored in the setMessages hook
  const { channel, ably } = useChannel("chat-demo", (message) => {
    const history = recievedMessages.slice(-199);
    setMessages([...history, message]);
  });

  // uses the Ably Channel above (useChannel hook)
  // clears the input (useState hook)
  // focuses on the textarea so that users can type again if they wish
  const sendChatMessage = (messageText) => {
    channel.publish({ name: "chat-message", data: messageText });
    setMessageText("");
    inputBox.focus();
  };

  // function to be triggered when submit button is clicked
  const handleFormSubmission = (event) => {
    event.preventDefault();
    sendChatMessage(messageText);
  };

  // function to allow enter to be used to send message
  const handleKeyPress = (event) => {
    if (event.charCode !== 13 || messageTextIsEmpty) {
      return;
    }
    sendChatMessage(messageText);
    event.preventDefault();
  };

  // map the messages to span
  const messages = recievedMessages.map((message, index) => {
    const author = message.connectionId === ably.connection.id ? "me" : "other";
    return (
      <span key={index} className={styles.message} data-author={author}>
        {message.data}
      </span>
    );
  });

  // scroll the message history to the bottom whenever the component renders
  useEffect(() => {
    messageEnd.scrollIntoView({
      behaviour: "smooth",
    });
  });

  return (
    <div className={styles.chatHolder}>
      <div className={styles.chatText}>
        {messages}
        <div
          ref={(element) => {
            messageEnd = element;
          }}
        ></div>
      </div>
      <form onSubmit={handleFormSubmission} className={styles.form}>
        <textarea
          ref={(element) => {
            inputBox = element;
          }}
          value={messageText}
          placeholder="Type a message..."
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={handleKeyPress}
          className={styles.textarea}
        ></textarea>
        <button
          type="submit"
          className={styles.button}
          disabled={messageTextIsEmpty}
        >
          Send
        </button>
      </form>
    </div>
  );
}
