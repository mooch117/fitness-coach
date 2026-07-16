import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleLogin(event) {
    event.preventDefault()
    setMessage('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    })

    setMessage(
      error ? error.message : 'Check your email for your magic login link.',
    )
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  if (!session) {
    return (
      <main className="container">
        <h1>Fitness Coach</h1>
        <p>Sign in with your email.</p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <button type="submit">Send Magic Link</button>
        </form>

        {message && <p>{message}</p>}
      </main>
    )
  }

  return (
    <main className="container">
      <button type="button" onClick={handleSignOut}>
        Sign Out
      </button>

      <h1>Daily Check-In</h1>
      <p>Signed in as {session.user.email}</p>

      <p>Next: weight, meal plan, hunger, workout, and notes.</p>
    </main>
  )
}

export default App