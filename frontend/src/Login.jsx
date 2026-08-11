import { useContext } from "react";
import { MyContext } from "./MyContext";
import "./Login.css";
import { useState } from "react";
import { ScaleLoader } from "react-spinners";

function Login() {
  const {
    password,
    setPassword,
    email,
    setEmail,
    isLoggedIn,
    setisLoggedIn,
    showLogin,
    setshowLogin,
    setUserName,
  } = useContext(MyContext);
  const [loading, setloading] = useState(false); //loader
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [visible, setVisible] = useState(false); //
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorKey, setErrorKey] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (!email || !password) {
      setErrorMsg("All fields are required");
      setErrorKey((prev) => prev + 1);
      return;
    }
    setloading(true);
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    };
    try {
      const response = await fetch("http://localhost:8080/api/login", options);
      const res = await response.json();
      console.log("Login response:", res);
      if (!response.ok) {
        setErrorMsg(res.error);
        setErrorKey((prev) => prev + 1);
        setloading(false);
        return;
      }
      localStorage.setItem("token", res.token);
      setUserName(res.username);
      setloading(false);
      setSuccess(true);
      setEmail("");
      setPassword("");
      setTimeout(() => setisLoggedIn(true), 1000);
    } catch (err) {
      setErrorMsg("Something went wrong");
      setErrorKey((prev) => prev + 1);
      setloading(false);
    }
  };
  return (
    <>
      <div className="authPage">
        <div className="authCard">
          <div className="authHeader">
            <i className="fa-brands fa-openai"></i>
            <h2>Welcome back</h2>
          </div>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Enter Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="passwordWrapper">
              <input
                type={visible ? "text" : "password"}
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <i
                className={
                  visible ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"
                }
                onClick={() => setVisible(!visible)}
              ></i>
            </div>
            {loading ? (
              <div className="loaderWrap">
                <ScaleLoader color="#fff" />
              </div>
            ) : success ? (
              <p className="successMsg">Logged In successfully!</p>
            ) : (
              <button type="submit">Login</button>
            )}
            {errorMsg && (
              <p className="errorMsg" key={errorKey}>
                {errorMsg}
              </p>
            )}
          </form>
          <a onClick={() => setshowLogin(false)}>
            Don't have an account? Sign up
          </a>
        </div>
      </div>
    </>
  );
}
export default Login;
