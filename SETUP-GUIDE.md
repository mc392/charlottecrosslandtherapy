# Launching charlottecrosslandtherapy.co.uk

This folder is the whole website. It is "static": plain files with no server or database, so it is free to host, fast and very hard to break. Allow about an hour for the first launch, most of it waiting for the domain settings to take effect.

## What's in the folder

| File | What it is |
|---|---|
| `index.html` | The website itself (all the words live here) |
| `styles.css` | The look: colours, fonts, spacing |
| `script.js` | The extras: scroll effects, the "Book" button on phones, sending the form |
| `privacy.html` | Privacy notice linked from the form |
| `404.html` | Friendly page if someone follows a broken or old link |
| `images/` | Charlotte's photos, resized for the web |
| `CNAME` | Tells GitHub which domain the site lives on. Don't rename or delete |
| `.nojekyll`, `robots.txt`, `sitemap.xml`, `favicon.svg` | Small housekeeping files. Leave them in |

---

## Step 1: Enquiry form (Formspree), already connected

The form is connected to Formspree form `mgaabpvq` (`https://formspree.io/f/mgaabpvq`), so enquiries are emailed to the address on that Formspree account. No code changes are needed. Two recommended settings in the Formspree dashboard:

1. **Settings → Restrict to domain:** add `charlottecrosslandtherapy.co.uk` so nobody else can post to the form.
2. Check the notification email address is Charlotte's practice inbox.

Each enquiry email arrives with first name, last name, email, location choice, availability, message (if given) and a **source** line (bacp, counselling-directory, search or direct). The first submission may ask you to confirm the form by email.

## Step 2: Put the site on GitHub Pages, 15 minutes

1. Sign in at **github.com** (or create a free account). Your username becomes part of the hosting address, e.g. `mattc.github.io`.
2. Click **+** (top right) → **New repository**.
   - Name: `charlottecrosslandtherapy`
   - Visibility: **Public**. GitHub Pages is free only for public repositories. That's fine: nothing private is in these files.
   - Click **Create repository**.
3. On the new empty repository page, click **uploading an existing file**.
4. Open the website folder on your Mac, select **everything inside it** (Cmd+A), and drag it into the browser. Drag the contents, not the folder itself. Mac hides `.nojekyll` by default; press Cmd+Shift+. in Finder to show hidden files so it comes too.
5. Click **Commit changes**.
6. Go to the repository's **Settings → Pages**.
   - Source: **Deploy from a branch**
   - Branch: **main**, folder **/ (root)** → **Save**
7. After a minute the page shows "Your site is live at https://yourusername.github.io/charlottecrosslandtherapy/". The custom domain won't work until Step 3.

## Step 3: Point the domain at GitHub, 10 minutes plus waiting

Log in where you bought **charlottecrosslandtherapy.co.uk** (e.g. GoDaddy, 123-reg, Namecheap, Squarespace Domains) and find **DNS settings**. Delete any existing "parking" A or CNAME records for `@` and `www`, then add:

| Type | Name / Host | Value |
|---|---|---|
| CNAME | `www` | `yourusername.github.io` |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |

The four A records make the address work without "www" too. Replace `yourusername` with your GitHub username.

Then, back in GitHub **Settings → Pages**:

1. Under **Custom domain**, enter `www.charlottecrosslandtherapy.co.uk` and **Save** (the CNAME file should have filled this in already).
2. Wait for the DNS check to go green. This takes from 10 minutes to a few hours.
3. Tick **Enforce HTTPS** (it can take up to an hour to become clickable). This gives the padlock in the browser.

Optional but recommended: in your GitHub account **Settings → Pages → Add a domain**, verify the domain so nobody else can claim it on GitHub.

## Step 4: Test it

- Open the site on your phone and on a laptop.
- Send a test enquiry. Each one arrives with the location choice, availability and message as separate lines, plus a **source** line.
- Tap an email link: it opens a new email with Charlotte's three questions already filled in.
- Send a test enquiry. The first one asks you to confirm the form in Charlotte's inbox. After that, they arrive directly.
- Check the email lands in her inbox, not spam (mark it "Not spam" once if needed).

## Step 5: Visitor statistics (Cloudflare Web Analytics), already set up

The Cloudflare snippet (with your token) is already in `index.html` and `privacy.html`, so statistics start as soon as the site is live. Log in at **dash.cloudflare.com** and open **Web Analytics** to see visitor numbers, where people came from (e.g. bacp.co.uk, counselling-directory.org.uk, Google), which pages they viewed, and phone vs computer. It uses no cookies, so no cookie banner is needed, and visitors see nothing. Data starts appearing within about 10 minutes of the first visit.

**Reading the numbers.** The dashboard's *Referers* list shows where visitors came from. Combine it with the **source** line on each enquiry email (bacp, counselling-directory, search or direct) to see which directory actually turns visitors into enquiries. For example, 120 visits from bacp.co.uk in a month and 6 enquiries marked "bacp" is a 5% conversion rate.

## Step 6: Move people across from the old site

1. **Directory profiles (most important).** Update the BACP and Counselling Directory profiles with Charlotte's new name and this exact website link:
   - BACP: `https://www.charlottecrosslandtherapy.co.uk/?ref=bacp`
   - Counselling Directory: `https://www.charlottecrosslandtherapy.co.uk/?ref=counselling-directory`

   The `?ref=` part is invisible to visitors, but every enquiry email includes a **source** line, so you can see which directory brings in clients.
2. **Redirect the old domain.** The old site appears to be on Squarespace (not Wix). Wherever `charlottebloortherapy.co.uk` is registered, set up **domain forwarding** (a "301 permanent" redirect) to `https://www.charlottecrosslandtherapy.co.uk`. Keep renewing the old domain for at least a year so old links and Google results still lead to Charlotte.
3. **Then** cancel the old website plan. Do this after the redirect works, and don't cancel the domain itself.
4. **Google.** Add the new site in Google Search Console (search.google.com/search-console) and submit `sitemap.xml`. If Charlotte has a Google Business Profile, update the name and website there.
5. Update email signatures, invoices and any printed material.

## Before going live: please check with Charlotte

- [ ] **Wording.** All copy is word-for-word from the old site (one typo corrected: "online or in-person therapy").
- [ ] **Privacy notice.** Read `privacy.html`, especially the six-month retention period for enquiries that don't go further.
- [ ] **ICO fee.** Therapists who hold client records usually need to pay the ICO data protection fee. The ICO's website has a quick self-assessment.
- [ ] **Photos.** Check the photographer is happy for the photos to be used on the website (usually yes for commissioned headshots).

## Making changes later

1. Open the repository on github.com and click the file (e.g. `index.html`).
2. Click the **pencil icon** to edit in the browser. Use Cmd+F to find the words you want to change.
3. Click **Commit changes**. The live site updates within about a minute.

To swap a photo, upload a new file with **exactly the same name** into the `images` folder (Add file → Upload files) and commit.
