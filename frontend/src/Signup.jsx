import { API_URL } from "./config";
import { useContext } from "react";
import { MyContext } from "./MyContext";
import "./Signup.css";
import { useState } from "react";
import { ScaleLoader } from "react-spinners";

function Signup() {
  const {
    username,
    setUserName,
    password,
    setPassword,
    email,
    setEmail,
    isLoggedIn,
    setisLoggedIn,
    showLogin,
    setshowLogin,
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
    if (!username || !email || !password) {
      setErrorMsg("All fields are required");
      setErrorKey((prev) => prev + 1);
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      setErrorKey((prev) => prev + 1);
      return;
    }
    setloading(true); //loader
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        email: email,
        password: password,
      }),
    };
    try {
      const response = await fetch(`${API_URL}/api/signup`, options); //call to auth route
      const res = await response.json();
      if (!response.ok) {
        setErrorMsg(res.error);
        setErrorKey((prev) => prev + 1);
        setloading(false);
        return;
      }
      localStorage.setItem("token", res.token);
      setloading(false);
      setSuccess(true);
      setEmail("");
      setPassword("");
      setUserName("");
      setConfirmPassword("");
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
            <h2>Create your account</h2>
          </div>
          <form onSubmit={handleSubmit} className="signupForm">
            <input
              type="text"
              placeholder="Enter Username"
              value={username}
              onChange={(e) => setUserName(e.target.value)}
            />
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
            <div className="passwordWrapper">
              <input
                type={visible ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <i
                className={
                  visible ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"
                }
                onClick={() => setVisible(!visible)}
              ></i>
            </div>
            {/* <button type="submit">Sign Up</button> */}
            {loading ? (
              <div className="loaderWrap">
                <ScaleLoader color="#fff" />
              </div>
            ) : success ? (
              <p className="successMsg">Signed up successfully!</p>
            ) : (
              <button type="submit">Sign Up</button>
            )}
            {errorMsg && (
              <p className="errorMsg" key={errorKey}>
                {errorMsg}
              </p>
            )}
          </form>
          <a onClick={() => setshowLogin(true)}>
            Already have an account? Login
          </a>
        </div>
      </div>
    </>
  );
}
export default Signup;
