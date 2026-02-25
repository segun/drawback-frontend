import { Router, Route, Switch, Redirect } from 'wouter'
import { AuthModule } from './modules/auth/components/AuthModule'
import { MainPage } from './pages/MainPage'

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={MainPage} />
        <Route path="/dashboard" component={AuthModule} />
        <Route path="/register" component={AuthModule} />
        <Route path="/login" component={AuthModule} />
        <Route path="/confirm" component={AuthModule} />
        <Route path="/reset-password" component={AuthModule} />
        <Route>
          <Redirect to="/" />
        </Route>
      </Switch>
    </Router>
  )
}

export default App
