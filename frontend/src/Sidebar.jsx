import { API_URL } from "./config";
import "./Sidebar.css";
import { useContext, useEffect } from "react";
import { MyContext } from "./MyContext";
import { v1 as uuidv1 } from "uuid";
import blackLogo from "/assets/blacklogo.png";
import { ScaleLoader, CircleLoader } from "react-spinners";

function Sidebar() {
  const {
    allThreads,
    setAllThreads,
    currThreadId,
    setnewChat,
    setReply,
    setPrompt,
    setprevChats,
    setcurrThreadId,
    username,
  } = useContext(MyContext);

  useEffect(() => {
    getAllThreads();
  }, [currThreadId]);

  //creates new chat
  const createNewChat = () => {
    setnewChat(true);
    setPrompt("");
    setReply(null);
    setcurrThreadId(uuidv1());
    setprevChats([]);
  };
  //to show all chats threadId and title
  const getAllThreads = async () => {
    try {
      const response = await fetch(`${API_URL}/api/thread`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const res = await response.json();
      const filterData = res.map((thread) => ({
        threadId: thread.threadId,
        title: thread.title,
      }));
      // console.log(filterData);
      setAllThreads(filterData);
    } catch (err) {
      console.log(err);
    }
  };

  //to check specific chat
  const changeThread = async (newThreadId) => {
    setcurrThreadId(newThreadId);
    try {
      const response = await fetch(`${API_URL}/api/thread/${newThreadId}`, {
        headers: { Authorization: `Bearer ${localStorage.getitem("token")}` },
      });
      const res = await response.json();
      console.log(res);
      setprevChats(res);
      setReply(null);
    } catch (err) {
      console.log(err);
    }
  };

  const deleteThread = async (threadId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/thread/${threadId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
        { method: "DELETE" },
      );
      const res = await response.json();
      console.log(res);
      //updated threads
      setAllThreads((prev) =>
        prev.filter((thread) => thread.threadId !== threadId),
      );
      if (threadId === currThreadId) {
        createNewChat();
      }
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <section className="sidebar">
      <button onClick={createNewChat}>
        <img src={blackLogo} alt="" className="logo" />
        <span>
          <i className="fa-solid fa-pen-to-square"></i>
        </span>
      </button>

      <ul className="history">
        {allThreads?.map((thread, idx) => (
          <li
            key={idx}
            onClick={() => changeThread(thread.threadId)}
            className={thread.threadId == currThreadId ? "highlighted" : ""}
          >
            {thread.title}
            <i
              className="fa-solid fa-trash"
              onClick={(e) => {
                e.stopPropagation();
                deleteThread(thread.threadId);
              }}
            ></i>
          </li>
        ))}
      </ul>

      <div className="sign">
        <p>Hi, {username || "there"} 👋</p>
      </div>
    </section>
  );
}

export default Sidebar;
