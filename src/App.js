import "./App.scss";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Reset from "./Reset";
import Dashboard from "./Dashboard";
import AccountDetail from "./components/AccountDetail";

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
        </Switch>
      </Router>
    </div>
  );
}

export default App;
