# DESIGN CTRL_ v4.2

## What changed
- File uploads and file import controls are removed from the website. Assets are maintained in the GitHub repository and updated via future ChatGPT-built ZIP releases.
- The existing outlet logos, fonts, icons, guidelines and downloadable assets are retained.
- Authorized administrators can edit brand colors (including add, remove and reorder), logo variation labels/order, clear-space guidance, incorrect-use settings, typography labels/hierarchy, and icon order. File bytes cannot be edited or uploaded in the website.
- Public visitors can browse and download without signing in.
- Firestore real-time subscription loads published settings for all visitors, and admin Save to Firebase publishes updates. Settings are saved to **`outlets/{outlet-slug}`**. The previous v4.1 client used `brands/{outlet-slug}`, which did not match the rules provided in the conversation and could cause failed synchronization.

## Deploy
1. Extract the ZIP and upload the **contents** of `design-ctrl-v4.2/` to the root of your GitHub Pages repository, replacing v4.1. `index.html` must be at the root.
2. In Firebase Console for project `design-ctrl`, open **Firestore Database > Rules**. Compare the existing rules with `firebase/firestore.rules` in this ZIP. Publish the supplied rules if they differ. They allow public read of `outlets` and restrict writes to authorized admins.
3. In **Authentication > Settings > Authorized domains**, confirm your GitHub Pages hostname is listed. Google provider must be enabled.
4. Confirm your Firestore `admins/{YOUR_AUTH_UID}` document contains the exact field `role` (string) = `admin`.
5. Open the deployed Fuze Cafe page, open Settings, sign in as Admin, edit a color name and click **Save to Firebase**. Confirm the success status, then check **Firestore Database > Data > outlets > fuze-cafe** for the saved `settings.colors` value. Refresh in a private browser or on a coworker's device to verify the change appears without sign-in.
6. Restore the original test value and save again.

## Important about previous edits
v4.2 reads and writes `outlets/{slug}`. If a previous v4.1 deployment successfully wrote settings to `brands/{slug}`, those old documents are **not automatically migrated**. Copy needed metadata manually before editing in v4.2. Files and artwork are unaffected.

## Security and limitations
- Firebase web config is public by design. Firestore rules, not hidden API keys, enforce permissions.
- Google sign-in alone does not grant editing. Only users in `admins` with `role: admin` may write.
- GitHub Pages and asset files are public to anyone with the website URL.
- Firebase SDK requires internet. Firestore updates depend on network access and project quotas.
- Code syntax and bundled asset references can be checked locally; **live Firebase sign-in and cross-device synchronization must be tested on the deployed site**.
