import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Link, useHistory } from "react-router-dom";
import {
  auth,
  registerWithEmailAndPassword,
  signInWithGoogle,
} from "./firebase";
import "./Register.scss";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [user, loading] = useAuthState(auth);
  const history = useHistory();

  const register = () => {
    if (!name) alert("Please enter name");
    registerWithEmailAndPassword(name, email, password);
  };

  useEffect(() => {
    if (loading) return;
    if (user) history.replace("/dashboard");
  }, [user, loading, history]);

  return (
    <div className="register">
      <div className="register__container">
        <div>
          <label htmlFor="register-fullname" className="form-label register__hidden">Full name</label>
          <input
            type="text"
            id="register-fullname"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter full name"
          />
        </div>
        <div>
          <label htmlFor="register-email" className="form-label register__hidden">Email</label>
          <input
            type="text"
            id="register-email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="enter valid email"
          />
        </div>
        <div>
          <label htmlFor="register-password" className="form-label register__hidden">Password</label>
          <input
            id="register-password"
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
        </div>
        <button className="btn btn-outline-primary" onClick={register}>
          Register
        </button>
        <button
          className="btn btn-outline-secondary"
          onClick={signInWithGoogle}
        >
          Register with Google
        </button>

        <div>
          Already have an account? <Link to="/">Login</Link> now.
        </div>
      </div>
    </div>
  );
}

export default Register;
