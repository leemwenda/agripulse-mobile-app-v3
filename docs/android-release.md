# AgriPulse Mobile — Android Release Guide

No release build or signed APK/AAB was produced as part of this change set
(no Android SDK in this environment — see `docs/android-build.md`). This
document specifies the process to follow once a real Android toolchain is
available, so release signing is done correctly and credentials are never
exposed.

Reference: https://developer.android.com/studio/publish/app-signing

## 1. Generate an upload/signing key (once, by the app owner)

```bash
keytool -genkeypair -v \
  -keystore agripulse-release.keystore \
  -alias agripulse \
  -keyalg RSA -keysize 2048 -validity 10000
```

You will be prompted for a keystore password and key password — use strong,
unique values and store them in a password manager, **not** in any file
committed to git.

## 2. Protect the key

- Store `agripulse-release.keystore` outside the repository (e.g. a secrets
  manager, encrypted drive, or CI secret storage).
- Add it to `.gitignore` if it is ever placed inside the project directory
  during a build, to guarantee it is never committed.
- Keep at least one secure, access-controlled backup. **Losing this key
  means you cannot publish updates to an app already installed from it** —
  back it up before the first release.
- Never paste the keystore password or key password into source code,
  `capacitor.config.ts`, or any `docs/*.md` file.

## 3. Configure Gradle signing (local, not committed)

Create `android/keystore.properties` (add to `.gitignore`):

```properties
storeFile=/absolute/path/to/agripulse-release.keystore
storePassword=********
keyAlias=agripulse
keyPassword=********
```

In `android/app/build.gradle`, reference it instead of hardcoding secrets:

```groovy
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
        }
    }
}
```

In CI, inject these values as encrypted secrets/environment variables and
write `keystore.properties` at build time — never store it in the repository
history.

## 4. Build the release artifact

```bash
npm run build
npx cap sync android
cd android
./gradlew assembleRelease     # → app/build/outputs/apk/release/app-release.apk
# or, for Google Play (recommended):
./gradlew bundleRelease       # → app/build/outputs/bundle/release/app-release.aab
```

## 5. Verify the artifact before distribution

```bash
# Confirm it is signed (not debug-signed):
apksigner verify --print-certs app/build/outputs/apk/release/app-release.apk

# Confirm the package identifier:
aapt dump badging app/build/outputs/apk/release/app-release.apk | grep package
# expect: package: name='me.agripulse.app'
```

Do not distribute a debug-signed APK (from `assembleDebug`) as a release.
Do not announce the app as "published" until it has actually been uploaded
to the intended distribution channel (Play Console internal testing track,
direct APK distribution, etc.) and installation has been verified on a real
device.

## 6. Versioning

Bump `versionCode` (integer, always increasing) and `versionName` (semantic,
user-facing) in `android/app/build.gradle` for every release. Keep a
changelog entry per release describing user-facing and backend-compatibility
changes.

## 7. Current status

- Signing key: **not generated** (requires the app owner to run step 1 in a
  secure environment).
- Release build: **not produced** (requires Android SDK, not available in
  this session).
- Play Store listing: **not created**; do not claim Play Store availability
  until a listing actually exists and has passed review.
