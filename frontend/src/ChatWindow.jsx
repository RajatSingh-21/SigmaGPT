import { API_URL } from "./config";
import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect, useRef } from "react";
import { ScaleLoader } from "react-spinners";
// import Button from "@mui/material/Button";

function ChatWindow() {
  const {
    prompt,
    setPrompt,
    reply,
    setReply,
    currThreadId,
    prevChats,
    setprevChats,
    isLoggedIn,
    setisLoggedIn,
    triggerReply,
    setUsername,
    sidebarOpen,
    setSidebarOpen,
    loading,
    setloading,
  } = useContext(MyContext);

  // const [loading, setloading] = useState(false); //loader
  const [isOpen, setisOpen] = useState(true);
  const [chatError, setChatError] = useState("");
  //
  const recognitionRef = useRef(null);
  const [isListening, setisListening] = useState(false);
  useEffect(() => {
    if (triggerReply > 0) getReply();
  }, [triggerReply]);
  //speech to text
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return; // browser doesn't support it

    const recognition = new SpeechRecognition(); //constructor
    recognition.continuous = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      //after result
      setPrompt(event.results[0][0].transcript);
      setisListening(false);
    };
    recognition.onend = () => {
      setisListening(false);
    };
    recognitionRef.current = recognition;
  }, []);

  const startListening = () => {
    recognitionRef.current?.start();
    setisListening(true);
  };
  //
  const getReply = async () => {
    setloading(true);
    setChatError("");
    console.log("message", prompt, "threadId", currThreadId);
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        message: prompt,
        threadId: currThreadId,
      }),
    };
    try {
      const response = await fetch(`${API_URL}/api/chat`, options);
      if (response.status === 401) {
        handleLogout();
        return;
      }
      if (!response.ok) {
        throw new error("Server error");
      }
      const res = await response.json();
      console.log(res);
      setReply(res.reply);
    } catch (err) {
      console.log(err);
      setChatError("Something went wrong. Please try again.");
    }
    setloading(false);
  };
  //2 to save all prev chats
  useEffect(() => {
    if (prompt && reply) {
      setprevChats((prevChats) => [
        ...prevChats,
        { role: "user", content: prompt },
        { role: "assistant", content: reply },
      ]);
    }
    setPrompt("");
  }, [reply]);
  //
  const handleProfileClick = () => {
    setisOpen(!isOpen);
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    setisLoggedIn(false);
    setprevChats([]);
    setAllThreads([]);
    setReply(null);
    setPrompt("");
    setcurrThreadId(uuidv1());
  };
  return (
    <div className="chatWindow">
      {sidebarOpen && (
        <div
          className="sidebarBackdrop"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      <div className="navbar">
        <i
          className="fa-solid fa-bars hamburger"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        ></i>
        <span>
          {" "}
          <b>SigmaGPT</b> <i className="fa-solid fa-angle-down"></i>
        </span>
        <div className="userIconDiv" onClick={handleProfileClick}>
          <span className="userIcon">
            <i className="fa-solid fa-user"></i>
          </span>
        </div>
      </div>

      {!isOpen && (
        <div className="dropDown">
          <div className="dropDownItem">
            <i className="fa-solid fa-cloud-arrow-up"></i> Settings
          </div>
          <div className="dropDownItem">
            <i className="fa-solid fa-gear"></i> Upgrade Plans
          </div>
          <div className="dropDownItem" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket"></i> Logout
          </div>
        </div>
      )}
      <Chat></Chat>

      {/* <ScaleLoader color="#fff" loading={loading}></ScaleLoader>
      <CircleLoader color="#fff" loading={loading}></CircleLoader> */}
      {/* {loading && (
        <div className="typingDots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      )} */}
      {chatError && <p className="chatErrorMsg">{chatError}</p>}
      <div className="chatInput">
        <p className="info">ChatGPT can make mistakes. Check important info.</p>
        <div className="inputBox">
          <input
            type="text"
            placeholder="Ask anything"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => (e.key === "Enter" ? getReply() : "")}
          />
          <div
            id="mic"
            onClick={startListening}
            className={isListening ? "listening" : ""}
          >
            <i className="fa-solid fa-microphone"></i>
          </div>
          <div id="submit" onClick={getReply}>
            <i className="fa-solid fa-paper-plane"></i>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ChatWindow;
