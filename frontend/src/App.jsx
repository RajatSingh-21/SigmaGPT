import "./App.css";
import Sidebar from "./Sidebar.jsx";
import ChatWindow from "./ChatWindow.jsx";
import { MyContext } from "./MyContext.jsx";
import { useState } from "react";
import { v1 as uuidv1 } from "uuid";
import Signup from "./Signup.jsx";
import Login from "./Login.jsx";

function App() {
  const [prompt, setPrompt] = useState(""); //user prompt
  const [reply, setReply] = useState(null); //reply from api
  const [currThreadId, setcurrThreadId] = useState(uuidv1()); //for new currId
  const [prevChats, setprevChats] = useState([]); //stores all chats
  const [newChat, setnewChat] = useState(true); //to create new chat
  const [allThreads, setAllThreads] = useState([]); //to get all chats
  //for authorization
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showLogin, setshowLogin] = useState(true);
  const [isLoggedIn, setisLoggedIn] = useState(!!localStorage.getItem("token"));
  const [triggerReply, settriggerReply] = useState(0);

  const providerValues = {
    prompt,
    setPrompt,
    reply,
    setReply,
    currThreadId,
    setcurrThreadId,
    prevChats,
    setprevChats,
    newChat,
    setnewChat,
    allThreads,
    setAllThreads,
    username,
    setUserName,
    email,
    setEmail,
    password,
    setPassword,
    showLogin,
    setshowLogin,
    isLoggedIn,
    setisLoggedIn,
    triggerReply,
    settriggerReply,
  };

  return (
    <div className="app">
      <MyContext.Provider value={providerValues}>
        {isLoggedIn ? (
          <>
            <Sidebar></Sidebar>
            <ChatWindow></ChatWindow>
          </>
        ) : showLogin ? (
          <Login />
        ) : (
          <Signup />
        )}
      </MyContext.Provider>
    </div>
  );
}

export default App;
