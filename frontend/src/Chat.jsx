import "./Chat.css";
import React, { useState, useEffect, useContext } from "react";
import { MyContext } from "./MyContext";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

function Chat() {
  const {
    newChat,
    prevChats,
    reply,
    prompt,
    setPrompt,
    setprevChats,
    getReply,
    triggerReply,
    settriggerReply,
    loading,
    setloading,
  } = useContext(MyContext);

  const [lastestReply, setLastestReply] = useState(null);
  const [isSpeaking, setisSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editingIndex, seteditingIndex] = useState(null);
  const [editText, setEditText] = useState("");

  //latest reply effect
  useEffect(() => {
    if (!reply || typeof reply !== "string") {
      setLastestReply(null); //load prev chats
      return;
    }

    if (!prevChats?.length) return;

    const content = reply.split(" "); //individual words
    let idx = 0;

    const interval = setInterval(() => {
      setLastestReply(content.slice(0, idx + 1).join(" "));
      idx++;
      if (idx > content.length) clearInterval(interval);
    }, 35);
    return () => clearInterval(interval);
  }, [prevChats, reply]);

  const speakText = (text) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setisSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.find((v) => v.name.includes("Zira")) || voices[0];
    utterance.onend = () => setisSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setisSpeaking(true);
  };
  //copy text
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  }
  const submitEdit = (idx) => {
    const updatedChats = prevChats.slice(0, idx);
    setprevChats(updatedChats);
    setPrompt(editText);
    seteditingIndex(null);
    settriggerReply((prev) => prev + 1); // rings the doorbell
  };
  return (
    <>
      {prevChats.length === 0 && (
        <h1 className="welcomeText">Where Should we begin!</h1>
      )}
      <div className="chats">
        {prevChats?.slice(0, -1).map((chat, idx) => (
          <div
            className={chat.role === "user" ? "userDiv" : "gptDiv"}
            key={idx}
          >
            {chat.role === "user" ? (
              editingIndex === idx ? (
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitEdit(idx);
                  }}
                />
              ) : (
                <p className="userMessage">
                  <i
                    className="fa-solid fa-pen-to-square"
                    onClick={() => {
                      seteditingIndex(idx);
                      setEditText(chat.content);
                    }}
                  ></i>
                  &nbsp;
                  {chat.content}
                </p>
              )
            ) : (
              <div className="gptMessage">
                <ReactMarkdown rehypePlugins={rehypeHighlight}>
                  {chat.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        ))}
        {/* //if latest == null */}
        {prevChats.length > 0 && (
          <>
            {lastestReply === null ? (
              <div className="gptDiv" key={"non-typing"}>
                <ReactMarkdown rehypePlugins={rehypeHighlight}>
                  {prevChats[prevChats.length - 1].content}
                </ReactMarkdown>
                <div className="messageActions">
                  <i
                    className={
                      isSpeaking
                        ? "fa-solid fa-stop"
                        : "fa-solid fa-volume-high"
                    }
                    onClick={() =>
                      speakText(prevChats[prevChats.length - 1].content)
                    }
                  ></i>
                  <i
                    className={
                      copied ? "fa-solid fa-check" : "fa-solid fa-copy"
                    }
                    onClick={() =>
                      copyText(prevChats[prevChats.length - 1].content)
                    }
                  ></i>
                  {/* edit icon goes here once built */}
                </div>
              </div>
            ) : (
              <div className="gptDiv" key={"typing"}>
                <ReactMarkdown rehypePlugins={rehypeHighlight}>
                  {lastestReply}
                </ReactMarkdown>{" "}
                <div className="messageActions">
                  <i
                    className={
                      isSpeaking
                        ? "fa-solid fa-stop"
                        : "fa-solid fa-volume-high"
                    }
                    onClick={() => speakText(lastestReply)}
                  ></i>
                  <i
                    className={
                      copied ? "fa-solid fa-check" : "fa-solid fa-copy"
                    }
                    onClick={() => copyText(lastestReply)}
                  ></i>
                  {/* edit icon goes here once built */}
                </div>
              </div>
            )}
          </>
        )}
        {loading && (
          <div className="typingDots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
      </div>
    </>
  );
}
export default Chat;
