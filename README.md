# DESIGN CTRL_ v4.0

Accenture Investment Group · Brand Library · 10 outlets.

## IMPORTANT: Firebase connection is not activated yet

The website includes working Firebase Authentication, Firestore listeners, Storage uploads, and a Save to Firebase action, but **you must connect your own Firebase project** before cross-device syncing will work. Do not claim that uploaded files are shared until this setup is completed and tested.

1. In Firebase Console, create or select your project, register a **Web app**, and copy its web configuration into `js/firebase-config.js`. The web config is public, but NEVER commit service-account credentials or private keys.
2. Enable **Authentication > Sign-in method > Google**. Under Authentication > Settings > Authorized domains, add your GitHub Pages domain (e.g. `devatomicgeek.github.io`). Localhost may need to be added explicitly for development.
3. Create a **Cloud Firestore** database, then publish the rules from `firebase/firestore.rules` in Firestore > Rules.
4. Enable **Cloud Storage**. Firebase Storage may require the Blaze billing plan even for usage within no-cost allowances. Publish `firebase/storage.rules` in Storage > Rules. Check your actual Storage bucket ID from Firebase Console.
5. Sign in to the deployed site once using the **Admin sign in** button. Get your account's UID in Firebase Authentication > Users. In Firestore Console, create a document at `admins/YOUR_UID` (any field such as `enabled: true`). The document ID must be the exact UID. Sign out and back in. **Only administrators with a document in `admins` can save**. The security rules prevent other users from writing even if they manipulate the UI.
6. Deploy the **contents** of this folder to GitHub Pages. Open each outlet's Settings, sign in, and click **Save to Firebase** once to publish its initial data. This is needed once per outlet to seed the cloud. After that, uploads and settings saved by an editor appear on other devices via live Firestore listeners. Original assets from the ZIP remain locally hosted unless replaced/uploaded.
7. Test with a second browser/device. Confirm one account can edit, a non-admin cannot, uploads persist after reload, and downloads work.

### How synchronization works

Editors upload or edit content in Settings, then press **Save to Firebase**. New files are uploaded to Firebase Storage, and Firestore stores references and metadata, not large base64 file contents. Every open outlet page subscribes to that outlet's Firestore document and updates when the document changes. Uploads are **not** shared until Save completes. The website can remain on GitHub Pages. Public assets and brand data are readable without sign-in; do not upload confidential material. The first deployment requires internet connectivity for Firebase's official JavaScript SDK.

**Limitations:** This is a v4.0 integration package, not a configured live backend. There is no automatic conflict resolution for simultaneous editors: last successful save wins. Deleting an asset removes it from the library but does not automatically delete older Storage objects, so Storage cleanup should be done periodically. Existing local export/import remains as a backup. The site does not manage Firebase projects or billing automatically.

### Other v4.0 changes

- Homepage company heading: ACCENTURE INVESTMENT GROUP on one line, Brand Library below. Footer: DESIGN CTRL_ · V4.0.
- Full brand-color cards for Fuze Cafe and Babiole; other outlets retain placeholders pending official palettes.
- Sun/moon icon-only toggle fixed to the bottom-right; decorative hero circles aligned to the right edge.
- Text-only outlet headings, safe-area reference-width pixel guidance, responsive color/typography/icon editors.
- Original font ZIP retained as a single downloadable package; extracted fonts support previews. Icon download opens a format chooser.
- Layout uses responsive breakpoints for mobile/tablet/desktop. Verify in actual browsers before production use.

### Local testing

Use a local server rather than `file://`:

```bash
python -m http.server 8000
```

Open `http://localhost:8000`. Without a real Firebase config, the library still displays its bundled brand assets, but the cloud save buttons remain disabled.
