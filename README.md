# DESIGN CTRL_ v4.1

GitHub Pages website with Firebase Authentication and Cloud Firestore for **editable settings only**. No Firebase Storage, no in-browser file uploads, no billing required within Spark free-tier limits. Brand assets remain bundled in the GitHub repository.

## Deploy to GitHub Pages
Extract the ZIP, then upload the **contents of `design-ctrl-v4.1/`** to the root of your GitHub Pages repository. Keep `index.html`, `js/`, `css/`, `outlets/`, and `firebase/` at the same level. Commit and wait for deployment.

## Firebase setup (project `design-ctrl`)
1. Firebase Console > Authentication > Sign-in method: enable Google. Set support email.
2. Authentication > Settings > Authorized domains: add `devatomicgeek.github.io` (the hostname, not the full URL).
3. Firestore Database: create the default database if not already created.
4. Firestore Database > Rules: replace rules with `firebase/firestore.rules` and click **Publish**. Do not enable public writes.
5. On the deployed website, open an outlet > Settings > **Admin sign in**. Sign in using Google. The interface will show your UID while read-only. You can also copy the UID from Firebase Authentication > Users.
6. In Firestore Database > Data, create collection `admins`, document ID equal to your **exact UID**, field `role` (string) = `admin`. This bootstrap record is created manually in Firebase Console by the project owner, not through the website.
7. Refresh the outlet page and sign in again if needed. The interface should display Administrator and allow editing. Change a color name, click **Save to Firebase**, and verify in another browser/device.

## Access
Public users can view and download files without login. Google login alone **does not** grant editing. Only a UID with `admins/{uid}.role == 'admin'` may write brand settings, as enforced by Firestore security rules.

## Asset workflow
To add, replace, or remove a logo/font/icon file, update the packaged outlet assets and its `data/brand.json` and outlet HTML through ChatGPT, then manually deploy the changed website files to GitHub. Cloud settings can rename/reorder existing asset entries but cannot upload or create assets. Firestore holds only editable metadata; it does not store file bytes or base64.

**Note:** Firebase SDK modules load from Google's CDN and require internet access. The website has not been live-tested against your Firebase account; publish the rules and test authentication and permissions before relying on it. Firebase free-tier quotas apply.
