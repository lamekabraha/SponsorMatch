# Tutorial: Run the dev server with Turbo and ngrok

Expose your local `npm run dev -- --turbo` app to the internet using ngrok, so you can test on real devices, share a preview, or use webhooks (e.g. OAuth callbacks).

---

## Prerequisites

- **Node.js & npm** installed and on your PATH (e.g. via nvm4w: `C:\nvm4w\nodejs`).
- **Dependencies installed** in the project: run `npm install` once if you haven’t.

---

## Step 1: Start the Next.js dev server (with Turbo)

1. Open a terminal in the project root (`sponsor_match`).
2. Ensure Node is on PATH (e.g. add nvm4w if needed):
   ```powershell
   $env:Path = "C:\nvm4w\nodejs;$env:Path"
   ```
3. Start the dev server with Turbo:
   ```powershell
   npm run dev -- --turbo
   ```
4. Wait until you see something like:
   ```text
   ▲ Next.js 16.x.x
   - Local:        http://localhost:3000
   ```
5. Leave this terminal open; the server must keep running.

---

## Step 2: Install ngrok (if you haven’t)

**Option A – Download (Windows)**

1. Go to [https://ngrok.com/download](https://ngrok.com/download).
2. Download the Windows (64-bit) ZIP.
3. Unzip it and put `ngrok.exe` somewhere on your PATH (e.g. `C:\Tools\ngrok`) or note the folder.

**Option B – Chocolatey**

```powershell
choco install ngrok
```

**Option C – npm (global)**

```powershell
npm install -g ngrok
```

**Sign up (free)** at [https://ngrok.com](https://ngrok.com), then add your auth token:

```powershell
ngrok config add-authtoken YOUR_TOKEN
```

---

## Step 3: Expose port 3000 with ngrok

1. Open a **second** terminal (keep the dev server running in the first).
2. Run ngrok against port 3000:
   ```powershell
   ngrok http 3000
   ```
3. In the ngrok terminal you’ll see something like:
   ```text
   Forwarding   https://abc123.ngrok-free.app -> http://localhost:3000
   ```
4. Use that **HTTPS URL** (e.g. `https://abc123.ngrok-free.app`) in your browser or on other devices.

---

## Step 4: Use the public URL

- **Browser:** Open the ngrok URL (e.g. `https://abc123.ngrok-free.app`). You may see an ngrok “Visit Site” warning page first; click through.
- **OAuth / callbacks:** If your app uses redirect URLs (e.g. NextAuth), add the ngrok URL in your provider (e.g. Google/GitHub) and in `.env`:
  - `NEXTAUTH_URL=https://abc123.ngrok-free.app`
  - Restart the dev server after changing env.

**Note:** The ngrok URL changes each time you restart ngrok (on the free tier). Update any config or env that references it.

---

## Quick reference

| Step | Command / action |
|------|-------------------|
| Terminal 1 – start dev server | `npm run dev -- --turbo` |
| Terminal 2 – start tunnel   | `ngrok http 3000`        |
| Use in browser               | Open the `https://....ngrok-free.app` URL from Terminal 2 |

---

## Troubleshooting

- **“npm not recognized”**  
  Add Node to PATH for that terminal, e.g.  
  `$env:Path = "C:\nvm4w\nodejs;$env:Path"`  
  Or set the Root Directory / PATH in Cursor as in your project docs.

- **“next not recognized”**  
  Run `npm install` in the project root.

- **ngrok “Visit Site” / warning page**  
  Normal on the free tier; click through to reach your app.

- **OAuth / login fails on the ngrok URL**  
  Set `NEXTAUTH_URL` (and any provider redirect URLs) to the current ngrok HTTPS URL and restart the dev server.

- **Port 3000 in use**  
  Stop any other process on 3000, or run the app on another port (e.g. `npm run dev -- --turbo -p 3001`) and then run `ngrok http 3001`.
