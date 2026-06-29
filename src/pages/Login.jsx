// ─── IMPORTS ──────────────────────────────────────────────────────────────────
// React's useState lets us store values that, when changed, cause the UI to re-render.
import { useState } from 'react';

// useNavigate gives us a navigate() function to redirect to another page in code.
import { useNavigate } from 'react-router-dom';

// We only import the specific icons we need from lucide-react to keep the bundle small.
import { Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react';

// Our custom hook — pulls the login() function out of the global AuthContext.
import { useAuth } from '../context/AuthContext';


// ─── COMPONENT ────────────────────────────────────────────────────────────────
// `export default` means this is the main thing this file exports.
// Any file that imports Login.jsx gets this function.
export default function Login() {

  // Destructure login() from our auth context so we can call it after a successful sign-in.
  const { login } = useAuth();

  // navigate() lets us redirect the user without a page reload (SPA behaviour).
  const navigate = useNavigate();


  // ─── STATE ──────────────────────────────────────────────────────────────────
  // useState(initialValue) returns [currentValue, setterFunction].
  // Calling the setter updates the value AND re-renders the component.

  // Which step of the login flow we're on. 1 = credentials, 2 = 2FA code.
  const [step, setStep] = useState(1);

  // Tracks what the user typed in the email field.
  const [email, setEmail] = useState('');

  // Tracks what the user typed in the password field.
  const [password, setPassword] = useState('');

  // Tracks the 6-digit authenticator code entered in step 2.
  const [totpCode, setTotpCode] = useState('');

  // true = show password as plain text, false = show as dots (••••).
  const [showPassword, setShowPassword] = useState(false);

  // true while waiting for an API response — disables the button to prevent double-submit.
  const [loading, setLoading] = useState(false);

  // Stores an error message string. Empty string '' means no error is shown.
  const [error, setError] = useState('');


  // ─── STEP 1 HANDLER ───────────────────────────────────────────────────────
  // `async` marks this as an asynchronous function so we can use `await` inside it.
  async function handleCredentials(e) {
    // e is the form submit event. preventDefault() stops the browser refreshing the page.
    e.preventDefault();

    // Clear any old error from a previous failed attempt.
    setError('');

    // .trim() removes surrounding whitespace. If either field is blank, show an error and stop.
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return; // `return` exits the function early — the code below does NOT run.
    }

    // Show the spinner and disable the button while we wait for the API.
    setLoading(true);

    try {
      // TODO: replace this fake delay with a real fetch() call to your backend:
      //   const res = await fetch('/api/auth/login', { method:'POST', body: JSON.stringify({email,password}) });
      //   const data = await res.json();
      //   if (!data.success) throw new Error(data.error.message);
      //
      // `await` pauses HERE until the Promise resolves. The browser stays responsive during the wait.
      await new Promise(r => setTimeout(r, 900)); // simulated 900ms network delay

      // Credentials accepted — move to step 2 so the user can enter their 2FA code.
      setStep(2);

    } catch (err) {
      // If fetch() fails or we throw an error above, it lands in catch.
      // Show the server's message, or a generic fallback if there is none.
      setError(err.message || 'Invalid credentials. Please try again.');

    } finally {
      // `finally` always runs — whether try succeeded or catch ran.
      // Always stop the spinner so the button becomes clickable again.
      setLoading(false);
    }
  }


  // ─── STEP 2 HANDLER ───────────────────────────────────────────────────────
  async function handleTwoFactor(e) {
    e.preventDefault();
    setError('');

    // TOTP codes are always exactly 6 digits — reject anything else.
    if (totpCode.length !== 6) {
      setError('Enter the 6-digit code from your authenticator app.');
      return;
    }

    setLoading(true);

    try {
      // TODO: replace with real API call to verify the TOTP code.
      await new Promise(r => setTimeout(r, 800));

      // Tell the global AuthContext that login succeeded.
      // This sets isAuthenticated = true, which lets PrivateRoute in App.jsx pass through.
      login({ email, name: 'Super Admin', role: 'super_admin' });

      // Redirect to the dashboard home page.
      navigate('/');

    } catch (err) {
      setError(err.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  }


  // ─── JSX / RENDER ─────────────────────────────────────────────────────────
  // Everything inside `return ()` is JSX — React's HTML-like syntax.
  // Key differences from HTML: use `className` not `class`, styles are JS objects,
  // events are camelCase (onClick, onChange), and expressions go inside { }.
  return (
    // Outer wrapper — `styles.page` makes this a flex row so left/right panels sit side by side.
    <div style={styles.page}>

      {/* ══ LEFT PANEL — Brand side (teal background) ══════════════════════ */}
      {/* This panel is purely decorative/informational — no form here. */}
      <div style={styles.leftPanel}>
        <div style={styles.brandContent}>

          {/* Logo row: icon box + "Vaultly" text sit next to each other */}
          <div style={styles.logoRow}>
            {/* Small rounded box housing the shield icon */}
            <div style={styles.logoIcon}>
              {/* ShieldCheck from lucide-react — size in px, color, strokeWidth control appearance */}
              <ShieldCheck size={22} color="#fff" strokeWidth={2} />
            </div>
            <span style={styles.logoText}>Vaultly</span>
          </div>

          {/* Tagline + description — sits in the vertical centre of the panel */}
          <div style={styles.brandBody}>
            {/* h1 is the most important heading on the page — there should only be one h1 per page */}
            <h1 style={styles.brandHeading}>
              Manage your platform with confidence.
            </h1>
            <p style={styles.brandSub}>
              The Vaultly Admin Panel gives you full visibility and control over
              users, transactions, and system settings — all in one place. Fully customized for Dominic
            </p>
          </div>

          {/* Feature bullet list at the bottom of the left panel */}
          {/* <ul> is an unordered list. We render items with .map() instead of writing each <li> manually. */}
          <ul style={styles.featureList}>
            {/*
              Array.map() transforms each item in the array into JSX.
              `f` is each string. `key={f}` is required by React to track list items efficiently.
            */}
            {['Role-based access control', 'Real-time audit logs', 'Two-factor authentication'].map(f => (
              <li key={f} style={styles.featureItem}>
                {/* Self-closing <span /> renders as a small circle bullet dot */}
                <span style={styles.featureDot} />
                {f} {/* render the feature text */}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ══ RIGHT PANEL — Form side (light background) ═════════════════════ */}
      <div style={styles.rightPanel}>
        {/* formWrap constrains the form to a max-width so it doesn't stretch too wide */}
        <div style={styles.formWrap}>

          {/* ── Form Header ── */}
          <div style={styles.formHeader}>
            {/*
              TERNARY OPERATOR: condition ? valueIfTrue : valueIfFalse
              Here we swap the heading text depending on which step we're on.
            */}
            <h2 style={styles.formTitle}>
              {step === 1 ? 'Sign in' : 'Verify your identity'}
            </h2>
            <p style={styles.formSub}>
              {step === 1
                ? 'Enter your admin credentials to continue.'
                : 'Enter the 6-digit code from your authenticator app.'}
            </p>
          </div>

          {/* ── Step Indicator Pills ── */}
          {/* Shows the user "Step 1 → Step 2" progress visually */}
          <div style={styles.stepRow}>
            {/*
              Spread syntax: { ...styles.stepPill, ...styles.stepPillActive }
              merges two style objects. The second one overwrites any keys from the first.
              So every pill gets the base stepPill styles PLUS a colour variant on top.
            */}
            <span style={{ ...styles.stepPill, ...(step === 1 ? styles.stepPillActive : styles.stepPillDone) }}>
              1 Credentials
            </span>
            {/* A thin horizontal line between the two pills */}
            <div style={styles.stepLine} />
            <span style={{ ...styles.stepPill, ...(step === 2 ? styles.stepPillActive : styles.stepPillIdle) }}>
              2 Verification
            </span>
          </div>

          {/* ── Error Banner ── */}
          {/*
            SHORT-CIRCUIT: `{error && <div>...</div>}`
            In JS, `true && X` evaluates to X. `false && X` evaluates to false (renders nothing).
            So this div only appears when `error` is a non-empty string.
          */}
          {error && (
            <div style={styles.errorBox}>
              {/* flexShrink:0 stops the icon from squishing when the error text is long */}
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* ══ STEP 1 — Email + Password ════════════════════════════════════ */}
          {/*
            `{step === 1 && (...)}` only renders this block when step equals 1.
            When step changes to 2, React removes this from the DOM and shows step 2 below.
          */}
          {step === 1 && (
            // onSubmit fires when the user clicks the submit button OR presses Enter.
            <form onSubmit={handleCredentials} style={styles.form}>

              {/* ── Email field ── */}
              <div style={styles.fieldGroup}>
                {/*
                  htmlFor="login-email" links this label to the input with id="login-email".
                  Clicking the label focuses the input — important for accessibility.
                */}
              
                <input
                  id="login-email"
                  type="text"        // browser validates email format automatically
                  style={styles.input}
                  placeholder="Email address"
                  value={email}       // CONTROLLED: React owns the displayed value
                  onChange={e => setEmail(e.target.value)} // update state on every keystroke
                  autoComplete="email" // tells the browser to offer saved emails
                  autoFocus           // focus this input when the page loads
                />
              </div>

              {/* ── Password field ── */}
              <div style={styles.fieldGroup}>
    
                {/* position:relative on this wrapper lets us absolutely-position the eye button inside */}
                <div style={{ position: 'relative' }}>
                  <input
                    id="login-password"
                    // Toggle between "password" (dots) and "text" (visible) based on showPassword state.
                    type={showPassword ? 'text' : 'password'}
                    // Spread base input styles but override paddingRight to make room for the eye button.
                    style={{ ...styles.input, paddingRight: 44 }}
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password" // browser can offer to fill saved password
                  />
                  {/* Eye toggle button — sits inside the input on the right side */}
                  <button
                    type="button" // CRITICAL: without this, clicking here would submit the form
                    // `v => !v` is a functional update — flips the current boolean value
                    onClick={() => setShowPassword(v => !v)}
                    style={styles.eyeBtn}
                    // aria-label describes the button for screen readers (accessibility)
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {/* Swap icon based on current visibility state */}
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* ── Submit Button ── */}
              <button
                id="login-submit-btn"
                type="submit"          // clicking this triggers the form's onSubmit
                style={styles.submitBtn}
                disabled={loading}     // greys out and blocks clicks while loading
              >
                {/*
                  Fragment shorthand: <> ... </> groups elements without adding a real DOM node.
                  We use it here to show spinner + text side by side while loading.
                */}
                {loading
                  ? <><span style={styles.spinner} />Signing in…</>
                  : 'Continue'}
              </button>
            </form>
          )}

          {/* ══ STEP 2 — 2FA / TOTP Code ═════════════════════════════════════ */}
          {step === 2 && (
            <form onSubmit={handleTwoFactor} style={styles.form}>

              {/* Instruction hint — tells the user what to do */}
              <div style={styles.hintBox}>
                Open your authenticator app and enter the code for{' '}
                {/* {' '} explicitly inserts a space between the text and the <strong> tag */}
                <strong>Vaultly Admin</strong>.
              </div>

              {/* ── TOTP Code Input ── */}
              <div style={styles.fieldGroup}>
                <label style={styles.label} htmlFor="login-totp-input">6-digit code</label>
                <input
                  id="login-totp-input"
                  type="text"
                  inputMode="numeric" // hints mobile browsers to open the number keyboard
                  // Spread base input styles then add extra overrides for the big centred code look.
                  style={{ ...styles.input, textAlign: 'center', fontSize: '1.375rem', fontWeight: 600, letterSpacing: '0.3em' }}
                  placeholder="· · · · · ·"
                  value={totpCode}
                  onChange={e =>
                    setTotpCode(
                      e.target.value
                        .replace(/\D/g, '') // regex: strip any character that is NOT a digit
                        .slice(0, 6)        // keep only the first 6 characters
                    )
                  }
                  autoFocus // auto-focus when step 2 mounts so the user can type immediately
                />
              </div>

              {/* Verify button */}
              <button
                id="login-totp-submit-btn"
                type="submit"
                style={styles.submitBtn}
                disabled={loading}
              >
                {loading
                  ? <><span style={styles.spinner} />Verifying…</>
                  : 'Verify & Sign In'}
              </button>

              {/* Back button — returns to step 1 without a page reload */}
              <button
                type="button" // type="button" prevents this from submitting the form
                style={styles.backBtn}
                onClick={() => {
                  setStep(1);      // go back to the credentials form
                  setTotpCode(''); // clear whatever code they typed
                  setError('');    // clear any error message
                }}
              >
                ← Back to login
              </button>
            </form>
          )}

          {/* Footer note */}
          <p style={styles.footer}>
            Dominic's Vaultly Admin Web App· Authorised access only
          </p>
        </div>
      </div>
    </div>
  );
}


// ─── STYLES OBJECT ────────────────────────────────────────────────────────────
// In React we can write CSS as a plain JavaScript object and pass it to `style={}`.
// Property names use camelCase instead of kebab-case: e.g. `borderRadius` not `border-radius`.
// Number values (e.g. 8) are treated as pixels automatically.
// String values (e.g. '1rem') are used as-is.

// We store the brand colour once in a constant so we can reuse it without repeating the hex code.
const TEAL = '#0D9488';      // primary teal — same as --primary in index.css
const TEAL_DARK = '#0F766E'; // darker shade used for hover states

const styles = {

  // ── Outer page wrapper ────────────────────────────────────────────────────
  page: {
    display: 'flex',                          // puts left and right panels side by side
    minHeight: '100vh',                       // fills the full browser window height
    fontFamily: "'Inter', system-ui, sans-serif", // Inter first, then system font as fallback
  },

  // ── Left Panel ────────────────────────────────────────────────────────────
  leftPanel: {
    width: '42%',           // takes up 42% of the viewport width
    background: TEAL,       // solid teal background using our constant
    display: 'flex',        // needed so brandContent can use alignItems / justifyContent
    alignItems: 'stretch',  // makes brandContent fill the full height of the panel
    padding: '48px 52px',   // 48px top/bottom, 52px left/right breathing room
    flexShrink: 0,          // prevents this panel from shrinking when the window is small
  },

  brandContent: {
    display: 'flex',
    flexDirection: 'column',        // stack logo, body, features vertically
    justifyContent: 'space-between', // push logo to top, features to bottom, body in middle
    width: '100%',
  },

  logoRow: {
    display: 'flex',
    alignItems: 'center', // vertically centre the icon and text on the same line
    gap: 10,              // 10px space between icon box and "Vaultly" text
  },

  logoIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,                       // slightly rounded square
    background: 'rgba(255,255,255,0.18)',   // semi-transparent white so it looks frosted
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',              // centre the shield icon inside the box
  },

  logoText: {
    fontSize: '1.25rem',      // 20px
    fontWeight: 700,           // bold
    color: '#fff',
    letterSpacing: '-0.02em', // slightly tighten the character spacing — looks more premium
  },

  brandBody: {
    flex: 1,                  // takes up all remaining vertical space between logo and features
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center', // vertically centre the heading + paragraph
    paddingTop: 60,
    paddingBottom: 40,
  },

  brandHeading: {
    fontSize: '1.75rem',      // 28px — large enough to feel impactful
    fontWeight: 700,
    color: '#fff',
    lineHeight: 1.35,         // tighter line height for headings looks more designed
    letterSpacing: '-0.02em',
    marginBottom: 16,         // space between heading and paragraph
  },

  brandSub: {
    fontSize: '0.9375rem',             // 15px
    color: 'rgba(255,255,255,0.72)',   // slightly translucent white — less dominant than heading
    lineHeight: 1.7,                   // generous line height for body text readability
  },

  featureList: {
    listStyle: 'none', // remove default browser bullet points
    margin: 0,
    padding: 0,        // remove default browser indentation on lists
    display: 'flex',
    flexDirection: 'column',
    gap: 10,           // 10px space between each feature row
  },

  featureItem: {
    display: 'flex',
    alignItems: 'center',              // vertically centre the dot and text on the same line
    gap: 10,                           // space between dot and text
    fontSize: '0.875rem',              // 14px
    color: 'rgba(255,255,255,0.82)',   // slightly opaque white
    fontWeight: 500,
  },

  featureDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',               // 50% border-radius on a square = perfect circle
    background: 'rgba(255,255,255,0.6)',
    flexShrink: 0,                     // dot should never shrink even if text wraps
  },

  // ── Right Panel ───────────────────────────────────────────────────────────
  rightPanel: {
    flex: 1,                 // takes up all remaining width (100% minus the left panel's 42%)
    background: '#F8FAFC',   // very light grey — feels clean and professional
    display: 'flex',
    alignItems: 'center',    // vertically centre the form in the panel
    justifyContent: 'center', // horizontally centre the form in the panel
    padding: '48px 40px',
  },

  formWrap: {
    width: '100%',
    maxWidth: 400, // cap the form width — wide forms are hard to read
  },

  formHeader: {
    marginBottom: 28, // space between the heading block and the step pills
  },

  formTitle: {
    fontSize: '1.5rem',       // 24px
    fontWeight: 700,
    color: '#0F172A',         // very dark navy — almost black, not harsh pure black
    letterSpacing: '-0.02em',
    marginBottom: 6,
  },

  formSub: {
    fontSize: '0.9375rem', // 15px
    color: '#64748B',      // medium grey for secondary text
    lineHeight: 1.5,
  },

  // ── Step Pills ────────────────────────────────────────────────────────────
  stepRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },

  stepPill: {
    // Base styles shared by ALL pills. Colour is added by the variant styles below.
    fontSize: '0.75rem',    // 12px — small label size
    fontWeight: 600,
    padding: '4px 10px',
    borderRadius: 20,       // high value = fully pill-shaped
    whiteSpace: 'nowrap',   // prevent pill text from wrapping to a second line
  },

  stepPillActive: {
    // Applied to the CURRENT step — teal background with white text
    background: TEAL,
    color: '#fff',
  },

  stepPillDone: {
    // Applied to a COMPLETED step — light green tint
    background: '#D1FAE5', // very light green
    color: '#065F46',      // dark green text for contrast
  },

  stepPillIdle: {
    // Applied to a FUTURE step not yet reached — grey/neutral
    background: '#F1F5F9',
    color: '#94A3B8',
  },

  stepLine: {
    flex: 1,             // stretches to fill remaining space between the two pills
    height: 1,           // 1px thin line
    background: '#E2E8F0', // light grey border colour
  },

  // ── Error Box ─────────────────────────────────────────────────────────────
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#FEF2F2',         // very light red background
    border: '1px solid #FECACA',   // soft red border
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: '0.875rem',          // 14px
    color: '#B91C1C',              // dark red text — readable on the light red background
    marginBottom: 16,
  },

  // ── Form Layout ───────────────────────────────────────────────────────────
  form: {
    display: 'flex',
    flexDirection: 'column', // stack fields vertically
    gap: 18,                 // 18px between each field/button group
  },

  fieldGroup: {
    display: 'flex',
    flexDirection: 'column', // label sits above the input
    gap: 6,                  // small gap between label and input
  },

  label: {
    fontSize: '0.875rem', // 14px
    fontWeight: 500,
    color: '#374151',     // dark grey — clearly readable but not black
  },

  input: {
    width: '100%',                                     // always fill its container
    padding: '11px 14px',                             // comfortable click/tap target
    background: '#fff',
    border: '1px solid #D1D5DB',                      // light grey border
    borderRadius: 8,
    fontSize: '0.9375rem',                            // 15px — matches label size
    color: '#0F172A',                                 // dark text for typed value
    outline: 'none',                                  // remove default browser focus ring (CSS handles it)
    transition: 'border-color 0.15s, box-shadow 0.15s', // smooth focus animation
    boxSizing: 'border-box',                          // padding is included in the 100% width calculation
  },

  eyeBtn: {
    position: 'absolute',           // positioned relative to the parent div with position:relative
    right: 12,                      // 12px from the right edge of the input
    top: '50%',                     // start at the vertical midpoint
    transform: 'translateY(-50%)',  // pull up by half its own height — perfectly centres it
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#9CA3AF',               // muted grey icon colour
    display: 'flex',
    alignItems: 'center',
    padding: 2,
  },

  submitBtn: {
    width: '100%',
    padding: '12px 20px',
    background: TEAL,
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: '0.9375rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center', // centre spinner + text horizontally inside the button
    gap: 8,                   // space between spinner and text
    transition: 'background 0.15s', // smooth hover colour change
    marginTop: 4,
  },

  spinner: {
    display: 'inline-block',
    width: 15,
    height: 15,
    border: '2px solid rgba(255,255,255,0.35)',  // faint white circle track
    borderTopColor: '#fff',                       // bright white segment that appears to spin
    borderRadius: '50%',                          // makes it a circle
    animation: 'spin 600ms linear infinite',      // `spin` keyframe is defined in index.css
  },

  hintBox: {
    background: '#F0FDF4',        // very light green
    border: '1px solid #BBF7D0', // soft green border
    borderRadius: 8,
    padding: '12px 14px',
    fontSize: '0.875rem',
    color: '#166534',            // dark green text — good contrast on light green background
    lineHeight: 1.6,
  },

  backBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
    color: '#64748B',           // same grey as subtitle text
    textAlign: 'center',
    padding: '6px 0',
    textDecoration: 'underline',
    textUnderlineOffset: 3,     // moves the underline slightly away from the text — cleaner look
  },

  footer: {
    marginTop: 36,
    fontSize: '0.75rem',  // 12px — small disclaimer text
    color: '#94A3B8',     // light grey — unobtrusive
    textAlign: 'center',
  },
};
