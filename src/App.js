import "./App.scss";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Reset from "./components/Reset";
import Dashboard from "./components/Dashboard";
import AccountDetail from "./components/AccountDetail";
import UserProfilePage from "./components/UserProfilePage";

function App() {
  return (
    <div className="app">
      <Router>
        <Switch>
          <Route exact path="/" component={Login} />
          <Route exact path="/register" component={Register} />
          <Route exact path="/reset" component={Reset} />
          <Route exact path="/dashboard" component={Dashboard} />
          <Route exact path="/account" component={AccountDetail} />
          <Route exact path="/profile/:id" component={UserProfilePage}></Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
