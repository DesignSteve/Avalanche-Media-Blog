# Avalanche Media Android App

This is a WebView-based Android app for Avalanche Media blog.

## How to Build the App

### Prerequisites
1. Download and install [Android Studio](https://developer.android.com/studio)
2. Make sure you have Java JDK 11 or higher installed

### Steps to Build

1. **Open Android Studio**

2. **Open the Project**
   - Click "Open" or "File > Open"
   - Navigate to this `AvalancheMediaApp` folder
   - Click "OK"

3. **Wait for Gradle Sync**
   - Android Studio will automatically download dependencies
   - This may take a few minutes on first run

4. **Add Your App Icon**
   - Replace the icon files in `app/src/main/res/mipmap-*` folders
   - Use [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html) to generate icons from your logo

5. **Build the APK**
   - Click "Build > Build Bundle(s) / APK(s) > Build APK(s)"
   - Or for release: "Build > Generate Signed Bundle / APK"

6. **Find the APK**
   - Debug APK: `app/build/outputs/apk/debug/app-debug.apk`
   - Release APK: `app/build/outputs/apk/release/app-release.apk`

### Publishing to Play Store

1. **Create Google Play Developer Account**
   - Go to [Google Play Console](https://play.google.com/console)
   - Pay one-time $25 fee

2. **Generate Signed APK/Bundle**
   - In Android Studio: Build > Generate Signed Bundle / APK
   - Create a new keystore (SAVE THIS FILE AND PASSWORD!)
   - Choose "Android App Bundle" for Play Store

3. **Upload to Play Store**
   - Create new app in Play Console
   - Fill in app details, screenshots, description
   - Upload the .aab file
   - Submit for review

### App Features
- Full website access
- Offline caching
- Back button navigation
- External links open in browser
- Progress bar while loading
- Share functionality works
- YouTube/Facebook links open in their apps

### Customization

**Change Website URL:**
Edit `MainActivity.java` line 20:
```java
private static final String WEBSITE_URL = "https://your-website-url.com/";
```

**Change App Colors:**
Edit `app/src/main/res/values/colors.xml`

**Change App Name:**
Edit `app/src/main/res/values/strings.xml`

## Support
For issues, contact Avalanche Media.

© 2026 Avalanche Media. All rights reserved.
