import React from 'react'
import { useState } from 'react'

const Auth = () => {

  const [auth, setAuth] = useState()
  const [email, setEmail] = useState()
  const [pass, setPass] = useState()

  const handleSubmit = () => {
    console.log(1)
  }

  return (
    <>
      <div className="card">
        <h2>Login</h2>
        <form action="/login" method="post">
          <label htmlFor="login-email">Email</label>
          <input id="login-email" name="email" type="email" required />
          <label htmlFor="login-pass">Password</label>
          <input id="login-pass" name="password" type="password" required />
          <div className="actions">
            <button type="submit" onClick={handleSubmit}>Log in</button>
          </div>
          <div className="muted"><a href="/forgot">Forgot password?</a></div>
        </form>
      </div>

    </>
  )
}

export default Auth