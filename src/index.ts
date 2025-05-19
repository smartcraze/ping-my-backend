import express from 'express'
import session from 'express-session'
import passport from './auth/auth'
import urlsRouter from './routes/urls'
import pingLogsRouter from './routes/pinglogs'
import { schedulePings } from './worker/pingScheduler'

const app = express()

app.use(session({
  secret: 'bun_oauth_secret',
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

app.use('/urls', urlsRouter);
app.use('/pinglogs', pingLogsRouter);

schedulePings()

app.get('/', (req, res) => {
  res.send(`<a href="/auth/google">Login with Google</a>`)
})


app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}))


app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/profile')
  }
)


app.get('/profile', (req, res) => {
  if (!req.user) return res.redirect('/')
  res.send(`
    <h2>Welcome, ${req.user.displayName || req.user.email}</h2>
    <a href="/logout">Logout</a>
  `)
})


app.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err)
    res.redirect('/')
  })
})

app.listen(3000, () => {
  console.log('🚀 Server running at http://localhost:3000')
})
