# frontend-user

User-facing e-commerce storefront built with **React + Vite + Tailwind CSS v4**.

## Features

- 🛍️ Product catalog with search & category filters
- 📦 Product detail pages with sale prices & quantity selector
- 🛒 Persistent shopping cart (localStorage)
- 🔐 User registration / login (JWT)
- 💳 Checkout with promo-code validation & shipping address
- ✅ Order confirmation with payment link

## Getting started

```bash
npm install
npm run dev
```

The Vite dev server proxies `/api` to the backend at `http://localhost:8000`,
so make sure the FastAPI backend is running.

### Run backend + frontend together (recommended)

```bash
npm run dev:all
```

This starts the FastAPI backend (`uvicorn` on :8000) and the Vite frontend
(:5173) at the same time with one command.

### Run them separately

```bash
# Terminal 1 — backend (port 8000)
cd ../backend
.venv/bin/uvicorn app.main:app --reload

# Terminal 2 — frontend (port 5173)
npm run dev
```

Then open http://localhost:5173

## Email OTP verification

Registration requires a 6-digit OTP code sent to the user's email. **OTP works
for users of ANY email provider worldwide** (Gmail, Yahoo, Outlook, Hotmail,
custom domains, etc.) — the sender just needs any SMTP account.

### Using Gmail (current setup)

Configure in `../backend/.env` (create a Gmail **App Password**, not your
normal password):

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
SMTP_FROM_NAME=E-Commerce Store
```

How to get a Gmail App Password:
1. Enable 2-Step Verification on your Google account
2. Visit https://myaccount.google.com/apppasswords
3. Create an app password and paste it into `SMTP_PASSWORD`

> Gmail free accounts are limited to **~500 emails/day**. For a production app
> with many users, use a transactional provider instead (below).

### Switching to another SMTP provider (for scale)

The backend works with any SMTP provider — just change these vars in `.env`:

| Provider  | SMTP_HOST                | Port | `SMTP_USE_SSL` | Free tier                    |
| --------- | ------------------------ | ---- | -------------- | ---------------------------- |
| Gmail     | smtp.gmail.com           | 587  | `False`        | 500 emails/day               |
| Yahoo     | smtp.mail.yahoo.com      | 465  | `True`         | —                            |
| Outlook   | smtp-mail.outlook.com    | 587  | `False`        | —                            |
| Zoho      | smtp.zoho.com            | 465  | `True`         | 5 users / 250 emails/day     |
| **Brevo** | smtp-relay.brevo.com     | 587  | `False`        | 300 emails/day               |
| **SendGrid** | smtp.sendgrid.net    | 587  | `False`        | 100 emails/day               |
| **Mailgun** | smtp.mailgun.org      | 587  | `False`        | 100 emails/day               |

`SMTP_FROM` and `SMTP_FROM_NAME` control the "From" address/name shown to
recipients.

> **Dev mode:** if `SMTP_USER`/`SMTP_PASSWORD` are left empty, the backend
> prints the OTP to its console instead of sending email, and the verify
> page shows the code directly so you can test the flow.

## Telegram login (register / login with Telegram)

Users can create an account and log in with their Telegram account — no email
or password needed. The backend verifies Telegram's signed payload (HMAC) and
auto-registers the user on first login.

### Setup (one-time, ~2 minutes)

1. In Telegram, message **@BotFather** and create a bot:
   - `/newbot` → choose a name → choose a username (e.g. `YourShopBot`)
   - BotFather replies with a **token** (e.g. `123456:ABC...`)
2. Allow the login widget on your domain:
   - `/setdomain` → select your bot → enter your domain
   - For local dev: `localhost:5173`, for production: `yoursite.com`
   - ⚠️ Enter the domain **without** `https://` or any protocol prefix —
     Telegram rejects values like `https://localhost:5173` with
     *"The message should contain one domain name"*.
3. Add the credentials to `../backend/.env`:

```
TELEGRAM_BOT_TOKEN=123456:ABC-your-bot-token
TELEGRAM_BOT_USERNAME=YourShopBot
```

4. Restart the backend. The **"Login with Telegram"** button now appears on
   the storefront Login and Sign Up pages.

> Without a bot configured, the button area shows "Telegram login is not
> configured" and the backend rejects requests.

## Environment variables

| Variable       | Description                                    | Default |
| -------------- | ---------------------------------------------- | ------- |
| `VITE_API_URL` | Backend API base URL. Leave empty to use the Vite proxy (dev). | *(empty)* |

For production, set `VITE_API_URL` to your deployed backend, e.g.
`https://your-api.onrender.com`.

## Available scripts

```bash
npm run dev      # start dev server
npm run build    # production build (output: dist/)
npm run preview  # preview production build
npm run lint     # run ESLint
```

# frontend-user-e-online
