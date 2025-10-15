TAQI HERBAL CLINIC - Ready-to-Build Package (Default: English, PDF Image mode)
-------------------------------------------------------------------------------

Contents:
- Full React + Electron project
- Default language: English (toggle to Urdu available in app)
- PDF mode: Image (pixel-perfect) by default
- Jameel Noori Nastaleeq font placeholder: public/fonts/JameelNooriNastaleeq.ttf
- Electron build config (electron-builder)
- GitHub Actions workflow can be added manually if desired

Important note:
I cannot produce a pre-built Windows .exe inside this environment. The ZIP includes the project and build scripts.
To get a ready-to-run .exe you must either:
A) Build locally on your Windows machine (instructions below)
B) Push the project to GitHub and use the included Actions workflow to build the installer on a Windows runner

Local build steps (Windows 10/11):
1. Install Node.js LTS and add to PATH.
2. Extract this ZIP to C:\Projects\taqi-herbal-clinic
3. Open PowerShell as Administrator and run:
   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
4. Open a normal PowerShell in the project folder:
   npm install
   npm run build
   npm run electron-dev   # to test the desktop app
5. To build installer:
   npm run dist
   After the build completes, find the installer in the 'dist' folder.

Replace font and icon:
- Put your actual Jameel Noori TTF into public/fonts/JameelNooriNastaleeq.ttf
- Replace public/icon.ico with your ICO (256x256) or convert your PNG to ICO using ImageMagick:
  magick convert public/logo.png -resize 256x256 public/icon.ico

If you want, I can:
- Create a GitHub repository and add the GitHub Actions workflow for you (instructions).
- Walk you step-by-step on your Windows PC to run the build and create the .exe.
