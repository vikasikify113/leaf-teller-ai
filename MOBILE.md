# Run PlantaSpeak AI as a native iOS / Android app

This project is wired up with [Capacitor](https://capacitorjs.com) so you can ship the same web app as a real native iOS and Android binary (App Store / Play Store).

## 1. Export to GitHub

In Lovable: top-right → **GitHub → Export to GitHub** → clone the repo locally.

```bash
git clone <your-repo>
cd <your-repo>
npm install   # or bun install
```

## 2. Add a native platform

You need [Xcode](https://apps.apple.com/us/app/xcode/id497799835) for iOS (macOS only) and/or [Android Studio](https://developer.android.com/studio) for Android.

```bash
# iOS (macOS only)
npx cap add ios
npx cap update ios

# Android
npx cap add android
npx cap update android
```

## 3. Build & sync

```bash
npm run build
npx cap sync
```

`capacitor.config.ts` already points to the live Lovable preview URL, so the native shell loads the latest published version of the app automatically — no extra deploy step needed.

## 4. Run on device / emulator

```bash
# Open the native project in Xcode
npx cap open ios

# Or open in Android Studio
npx cap open android
```

Then hit ▶️ Run from Xcode / Android Studio on a simulator or a physical device (USB debugging enabled).

## 5. Hot reload during development

Edit code in Lovable → it auto-deploys to the preview URL → relaunch the app on your device. No rebuild needed unless you change native config.

## Going to production

When you're ready to ship to the App Store / Play Store, replace the `server.url` in `capacitor.config.ts` with your custom domain (or remove it entirely to bundle the static build) and rebuild:

```bash
npm run build && npx cap sync
```

More: [Capacitor docs](https://capacitorjs.com/docs) · [Lovable mobile guide](https://lovable.dev/blog/mobile-development-with-lovable).
