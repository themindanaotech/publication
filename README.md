# The Mindanao Tech

The official student publication website of Mindanao Tech. A modern digital news and media site with stories on campus news, explainers, opinion, student life and multimedia.

## Visit the website

**https://themindanaotech.github.io/publication/**

Follow us on Facebook for updates and new stories.

## What you can find on the site

- **News:** campus updates and announcements
- **Explainers:** clear guides to topics that matter to students
- **Opinion:** editorials and columns from our writers
- **Life:** student life, culture and features
- **Sorted:** tips and practical advice
- **Multimedia:** photo essays and visual stories

You can also switch between light and dark mode, browse by page, and subscribe with your email to get notified of new stories.

## Instructions

### For readers
1. Open the link above in any browser on your phone or computer.
2. Use the menu at the top to pick a category, or scroll the homepage for the latest stories.
3. Click a story to read it. Use the page numbers at the bottom to see older stories.
4. To **like** a story or **comment** on it, scroll to the bottom of the story and click **Continue with Google**. Only Gmail accounts (@gmail.com) are accepted. Your name and photo come from your Google account. You can delete your own comments at any time.
5. To get updates, enter your email in the subscribe box and click **Subscribe**.

### For editors
Editors publish and manage content through a private control panel (`admin.html`). Sign in with your **name and passkey**, given to you by the publication head. Please don't share the link or your passkey.

Once signed in you can:
1. **Write a story:** go to Posts, click **New post**, fill in the title, category, author, short description, cover image and article text, then save.
   Use the **Date posted** field to back-date a story (for example, one you forgot to post on time). The date shown on the site and the order of stories follow it.
2. **Save a draft:** untick **Published** to keep a story hidden until it's ready.
3. **Feature a story:** tick **Featured on homepage** to show it in the top spotlight.
4. **Edit or remove a story:** use the **Edit** and **Delete** buttons next to each post.
5. **Change the look:** go to Appearance to update the logo, name, motto, colors, menu categories and Facebook link.
6. **Moderate comments:** go to Comments to read the latest comments on every story and delete any that break your rules.
7. **See subscribers:** go to Subscribers to view or download the email list.
8. **Edit the team:** go to Team to add groups (Adviser, Executive Board, Board Members, Developer, or your own), then add people with a name, position and photo. Use the arrows to reorder. Everyone appears on the public **Our Team** page, and the people in the **Developer** group are also credited in the site footer. Whenever a team member's full name appears in a story, it is automatically highlighted and links to their picture on the Our Team page.
9. **Manage admins:** go to Admins to add a new editor (name + passkey), change a passkey, or remove someone. The control panel and login page automatically use the same theme as the live website.

### For developers
This repository contains the whole site. No build step is needed.

| File | Purpose |
| --- | --- |
| `index.html` | The public website |
| `admin.html` | The editors' control panel |
| `config.js` | Supabase project URL and public (anon) key |
| `supabase-setup.sql` | Database tables, storage, security rules, comments and likes |
| `scripts/sync-facebook.mjs` | Copies new Facebook Page posts to the site |
| `.github/workflows/sync-facebook.yml` | Runs the sync every 15 minutes |

To set up your own copy:
1. Create a project at [supabase.com](https://supabase.com) and run `supabase-setup.sql` in the SQL Editor.
2. In Supabase **Authentication**, keep **Allow new users to sign up** switched ON (readers need it to sign in with Google; the database makes sure only the admins you create can use the control panel). Then in the SQL Editor run `select _make_admin('Your Name', 'a-strong-passkey');` to create the first admin. More admins can be added later from **Admin > Admins**. (An older admin created with an email can still sign in by typing that email in the Name box.)
3. Put your Project URL and **anon** key in `config.js`. Never use the `service_role` key.
4. Upload the files to a GitHub repository and turn on **Settings > Pages** (deploy from the `main` branch, `/(root)` folder).

### Comments and likes (Google sign-in, Gmail only)
Readers sign in with Google to comment and like. The database only accepts comments and likes from a Google account whose address ends in `@gmail.com`, and it fills in the commenter's name and photo itself, so nobody can fake them.

If you already have a live site, do these once:
1. In Supabase SQL Editor, run the **whole** "COMMENTS + LIKES" section at the bottom of `supabase-setup.sql` **before** letting readers sign in. It also locks the control panel to real admins only (otherwise any signed-in reader could edit posts). Your current admins keep their access.
2. Create Google credentials: [Google Cloud Console](https://console.cloud.google.com/) > APIs & Services > Credentials > **Create credentials > OAuth client ID** > Web application. Under **Authorized redirect URIs** add `https://YOUR-PROJECT.supabase.co/auth/v1/callback` (Supabase shows the exact link on the Google provider page). If asked to set up the consent screen, choose **External** and add your site name.
3. In Supabase **Authentication > Sign In / Providers > Google**: switch it on and paste the Google **Client ID** and **Client secret**.
4. In Supabase **Authentication > URL Configuration**: set **Site URL** to `https://themindanaotech.github.io/publication/` and add the same link under **Redirect URLs**.
5. Open any story on the site, click **Continue with Google**, and post a test comment.

### Auto-post from Facebook
New posts on the Facebook Page are copied to the website automatically (checked every 15 minutes) by `scripts/sync-facebook.mjs`, run by GitHub Actions (`.github/workflows/sync-facebook.yml`).

How each post is converted:
- The first line of the Facebook post becomes the **title**; the full text becomes the article body.
- A hashtag matching a category (for example `#opinion`) sets the category. Otherwise it goes to **News**.
- The photo is copied into the site's own storage. Posts with no text (photo or video only) are skipped.
- To hide or fix an imported story, **edit it or untick Published** in the control panel. Don't delete it, or it may be imported again.

One-time setup:
1. In Supabase SQL Editor, run the "Facebook auto-posting" lines at the bottom of `supabase-setup.sql`.
2. Get a **Page access token** (see below) and your Facebook **Page ID**.
3. In GitHub: **Settings > Secrets and variables > Actions > New repository secret**. Add:
   - `FB_PAGE_ID`: the numeric Page ID (Page > About > Page transparency, or Meta Business Suite settings)
   - `FB_PAGE_TOKEN`: the long-lived Page access token
   - `SUPABASE_URL`: same as in `config.js`
   - `SUPABASE_SERVICE_KEY`: the Supabase **service_role** key (Project Settings > API). Keep it only in GitHub Secrets, never in `config.js`.
4. Open the **Actions** tab, choose **Sync Facebook posts to website**, and click **Run workflow** to test. The first run imports the latest 10 posts.

Getting a token that doesn't expire:
1. Go to developers.facebook.com, create an app (type Business), and add yourself as an admin of the Page.
2. In the Graph API Explorer, pick your app, choose **Get User Access Token**, and tick `pages_show_list`, `pages_read_engagement` and `pages_read_user_content`. Copy the token.
3. Exchange it for a long-lived user token: `GET https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=APP_ID&client_secret=APP_SECRET&fb_exchange_token=SHORT_TOKEN`
4. Then call `GET https://graph.facebook.com/v21.0/me/accounts?access_token=LONG_USER_TOKEN`. The `access_token` shown for your Page is the never-expiring Page token to save as `FB_PAGE_TOKEN`.

Note: GitHub pauses scheduled workflows if a repository has no activity for 60 days. If posts stop syncing, open the Actions tab and re-enable the workflow.

## Built with

HTML, CSS, JavaScript, [Supabase](https://supabase.com) and GitHub Pages.

## Contact

Message us on our Facebook page for questions, story tips or to join the publication.

&copy; Mindanao Tech. All rights reserved.
