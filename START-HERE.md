# Hi Tasneem! 🎀 Start here

This folder is your own website: a little museum for your projects. These
steps put it online for free and let you edit it from the website itself.
You don't need to write any code.

**Time needed:** about 30 minutes, once.

**What you'll end up with:**
- A site at `https://YOUR-USERNAME.github.io/tasneem-museum/`
- A private editor (the 🔑 in the top bar) where you add projects, photos,
  your story and more. Every change goes live in about a minute.
- A guestbook where visitors can leave you notes (you approve them first).

---

## Part 1: Put the site online (≈ 10 min)

> **Already done for you:** your repository
> [tsneem6/digital-museum](https://github.com/tsneem6/digital-museum) has
> the site in it and `site.config.js` already has your username. **Skip to
> step 5** below. Your site will be at
> **https://tsneem6.github.io/digital-museum/**
>
> Steps 1–4 are here in case you ever need to set it up again from scratch.

### 1. Make a GitHub account
Go to [github.com/signup](https://github.com/signup) and sign up. Your
**username** becomes part of your website address, so pick a nice one
(for example `tasneem-mhairat`).

### 2. Install GitHub Desktop
Download it from [desktop.github.com](https://desktop.github.com) and sign
in with your new account. It uploads the whole folder for you, including a
hidden folder (`.github`) that the website needs.

### 3. Tell the site your username
Open the file **`site.config.js`** in this folder with any text editor
(Notepad or TextEdit is fine). Change this line:

```js
githubOwner: 'your-github-username',
```

to your real username, keeping the quotes:

```js
githubOwner: 'tasneem-mhairat',
```

Save the file. While you're in there, you can also change the categories,
the emoji next to each one, and the year in `established`.

### 4. Upload the folder
In GitHub Desktop:
1. **File → Add local repository…** and choose this `tasneem-museum` folder.
2. It will say it isn't a repository yet. Click **create a repository**,
   keep the name `tasneem-museum`, and click **Create repository**.
3. Click **Publish repository** (top right). **Untick "Keep this code
   private"**, then click **Publish**.

### 5. Switch on the website
1. Open your repository on github.com:
   `https://github.com/YOUR-USERNAME/tasneem-museum`
2. Go to **Settings → Pages**.
3. Under **Build and deployment → Source**, pick **GitHub Actions**.
4. Go to the **Actions** tab. Click **Deploy to GitHub Pages** on the left,
   then **Run workflow → Run workflow**.
5. Wait for the green tick (about 1–2 minutes). Your site is live at
   `https://YOUR-USERNAME.github.io/tasneem-museum/` 🎉

It shows sample projects for now. You'll replace them in Part 3.

---

## Part 2: Turn on your login and guestbook (≈ 15 min)

The Editor login and the guestbook use **Supabase**, a free service.

### 1. Create a Supabase project
1. Sign up at [supabase.com](https://supabase.com) and click **New project**.
2. Pick any name (for example `tasneem-museum`) and a database password
   (you won't need it again). Choose the region closest to you.
3. Wait a minute while it finishes setting up.

### 2. Create your login
1. In Supabase, go to **Authentication → Users → Add user → Create new user**.
2. Enter **your email** and a **strong password**. This is the password
   you'll type on your website. Tick **Auto Confirm User**.
3. Go to **Authentication → Sign In / Providers** and turn **off**
   **"Allow new users to sign up"**, so nobody else can make an account.

### 3. Create the guestbook
1. Open `supabase/migrations/guestbook_entries.sql` from this folder in a
   text editor.
2. Replace every `you@example.com` with **the same email** as step 2, then
   copy the whole file.
3. In Supabase, open the **SQL Editor**, paste, and click **Run**. It
   should say *Success*.

### 4. Connect Supabase to your site
1. In Supabase, go to **Project Settings → API** (or **Data API**). Keep
   this page open; you need two values from it.
2. In a new tab, open your GitHub repository → **Settings → Secrets and
   variables → Actions → New repository secret**, and add two secrets:

   | Name | Value |
   | --- | --- |
   | `VITE_SUPABASE_URL` | the **Project URL** from Supabase |
   | `VITE_SUPABASE_ANON_KEY` | the **anon / public** key from Supabase |

3. Go to the **Actions** tab and run **Deploy to GitHub Pages** again.

---

## Part 3: Make it yours (as long as you like 💕)

### 1. Log in
On your site, click the little **🔑 key** in the top bar and type the
password from Part 2.

Once you're in, you'll see:
- a floating **editing bar** at the bottom of the page (*Open editor*,
  *＋ Project*, and 👋 to log out), and
- small **✎ Edit** buttons on each section of your site. Click one to jump
  straight to the right place in the editor.

The editor has a menu down the side: 🖼️ Projects, 📌 Working on, ⏳ My
story, 🤝 Giving back, 💬 Kind words, 📖 Guestbook, 🙋‍♀️ About me and
🚀 Publishing. Every page has a **Save changes** button at the bottom that
tells you when something isn't saved yet.

### 2. About me (do this first)
Open **🙋‍♀️ About me**. Set **Email** to **the same email you log in
with**, because the login checks it. Add your profile photo (it goes on your
museum pass), your CV link, and your social links, then **Save changes**.

### 3. Turn on publishing
Open **🚀 Publishing** and follow the three steps on screen: make a key on
GitHub (the page links straight to the right GitHub screen and tells you
what to tick), paste it in, then press **Test connection**. When it says
*Connected!*, the pill at the top turns green: **● Publishing is on**.

You paste the key again each time you open the editor in a new browser tab.
Keep it secret, like a password. While publishing is off, your edits are
only saved in that browser and don't go live.

### 4. Replace the samples
- **🖼️ Projects:** click a project tile to edit it, or **＋ Add a
  project**. Everything is on one page: name, category, the story, photos,
  links and teammates. Flip **Make this my favourite ♡** on the project you
  want shown big near the top. The arrows under each tile change the order.
- **📌 Working on:** the sticky note under your intro. Pick an emoji and
  slide the progress bar.
- **⏳ My story:** your studies, teams, internships and awards. Put the
  newest at the top; the site shows them as a road, oldest first.
- **🤝 Giving back** and **💬 Kind words:** add, reorder with ↑ ↓, or
  remove with 🗑.
- **📖 Guestbook:** approve or remove visitors' notes.

Each save goes live in about a minute. Refresh your site to see it.

---

## Little things you can change later

| I want to… | Where |
| --- | --- |
| Change the welcome text, buttons or section titles | `src/i18n/en.json` (English) and `src/i18n/ar.json` (Arabic) |
| Change the colours | `src/index.css`, the top part. Light mode first, dark mode right below it |
| Change the categories or their emoji | `site.config.js` |
| Change the picture shown when you share the link | replace `public/og-image.png` (1200 × 630) |
| Turn off Hello Kitty 😿 | in `src/App.jsx`, delete the line `<HelloKitty />` |

To change a file on your computer:
1. In GitHub Desktop, click **Fetch origin**, then **Pull origin** if it
   appears. Your edits from the website live on GitHub, so this brings them
   down first.
2. Edit the file and save it.
3. Back in GitHub Desktop, write a short note in **Summary**, click
   **Commit to main**, then **Push origin**. The site updates by itself.

## If something goes wrong

- **The site shows a 404 page:** check Part 1, step 5. Pages must be set to
  *GitHub Actions*, and the deploy needs a green tick.
- **"That didn't work" when logging in:** the Email in 🙋‍♀️ About me must
  match your Supabase user's email, and that user must be confirmed.
- **The guestbook says "not configured yet":** re-check the two secrets in
  Part 2, step 4, then run the deploy again.
- **Edits disappear after a while:** turn on 🚀 Publishing (Part 3,
  step 3). Without it, edits are only saved in your browser.
- **A deploy has a red ✗:** open it in the Actions tab to read what failed,
  or ask whoever gave you this site 💌
