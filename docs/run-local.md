# Run HornExchange Locally

This guide is a step-by-step setup for running HornExchange on your machine.

## Prerequisites

- Git
- Node.js LTS (recommended: Node 20+)
- npm (comes with Node.js)

## 1) Clone or update the repo

If you do not have the repo yet:

```bash
git clone https://github.com/ShreyasRiddle/HornExchange.git
cd HornExchange
```

If you already have it:

```bash
cd HornExchange
git pull origin main
```

## 2) Verify Node and npm

```bash
node -v
npm -v
```

You should see version numbers for both commands.

## 3) Install dependencies

```bash
npm install
```

## 4) Start the app

```bash
npm run dev
```

Open: `http://localhost:3000`

## 5) Optional checks

```bash
npm run lint
npm run build
```

## Common Errors and Fixes

### Error: `npm: command not found`

Cause: Node.js/npm is not installed or not in PATH.

Fix:

1. Install Node.js LTS from https://nodejs.org/en/download
2. Close and reopen your terminal
3. Run:

```bash
node -v
npm -v
```

### Error: `node: command not found`

Cause: Node.js is missing from PATH.

Fix:

1. Reinstall Node.js LTS with default settings
2. Reopen terminal
3. Verify with `node -v`

### Error: `'next' is not recognized`

Cause: Dependencies are not installed in the current project directory.

Fix:

```bash
npm install
npm run dev
```

If still failing:

```bash
npx next dev
```

### Error: `ENOENT: no such file or directory, open '.../package.json'`

Cause: You are in the wrong directory.

Fix:

```bash
pwd
ls package.json
```

If `package.json` is missing, `cd` into the HornExchange repo root and retry.

### Error: Port 3000 already in use

Run on a different port:

```bash
npm run dev -- -p 3001
```

Then open: `http://localhost:3001`

### Dependency install failures

If install fails due to stale cache or lock state:

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

On Windows PowerShell:

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```

## Quick Verification Checklist

You are running correctly if:

- `npm run dev` starts without fatal error
- Browser loads `http://localhost:3000`
- You can type a prompt in the HornExchange UI
- Search returns recommendation cards