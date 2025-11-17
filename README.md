# WebXR Digital Business Card

An augmented reality (AR) business card built with A-Frame, MindAR, and WebXR. Users can scan a target image with their mobile camera to view an interactive 3D business card experience.

## 🚀 Live Demo

Once deployed to GitHub Pages, your app will be available at:
**https://abdullah-at.github.io/webxr-digital-business-card/**

## 📱 How It Works

Your MindAR target image **IS your QR code** - it's the trigger that activates the AR experience!

1. **Print the Target Image**: Print `public/assets/tracker.png` directly on your business card (this replaces a QR code)
2. **Open the Web App**: Users visit your GitHub Pages URL on their mobile browser
3. **Scan the Target**: Point the camera at the printed target image (just like scanning a QR code)
4. **AR Experience**: The AR content automatically appears overlaid on the target image

## 🎯 Target Image (Your "AR QR Code")

The target image for AR tracking is located at:
- `public/assets/tracker.png` - **This is your AR trigger image (like a QR code)**

**How to Use:**
- ✅ Print this image directly on your business card (front or back)
- ✅ It works just like a QR code - users scan it with their camera
- ✅ The image should be at least 2-3 inches (5-7 cm) in size
- ✅ Ensure good contrast and lighting for best tracking
- ✅ Keep the target flat and clearly visible when scanning

**Difference from QR Code:**
- QR Code: Opens a website URL
- MindAR Target: Triggers AR content directly (no URL needed once app is open)

## 🛠️ Setup & Deployment

### Prerequisites
- Node.js 18+ installed
- Git configured

### Local Development
```bash
npm install
npm run dev
```

### Deploy to GitHub Pages

1. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**
   - Save

2. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Setup GitHub Pages deployment"
   git push origin main
   ```

3. **Automatic Deployment**:
   - GitHub Actions will automatically build and deploy your site
   - Check the **Actions** tab to see the deployment progress
   - Your site will be live at: `https://abdullah-at.github.io/webxr-digital-business-card/`

## 📋 Features

- ✅ AR image tracking with MindAR
- ✅ 3D UFO animation
- ✅ Interactive 3D cube with social media buttons
- ✅ About Me section with animated waves
- ✅ Responsive design for mobile devices
- ✅ No server required - works directly in browser

## 📦 Project Structure

```
├── public/
│   ├── assets/          # Images, models, textures
│   └── targets.mind     # MindAR target file
├── src/
│   ├── main.js          # Main application logic
│   ├── cubeController.js
│   └── cubeFaces.js
├── index.html
├── style.css
└── vite.config.js

```

## 🔧 Technologies Used

- **A-Frame** - WebXR framework
- **MindAR** - Image tracking library
- **Three.js** - 3D graphics (via A-Frame)
- **Vite** - Build tool
- **GitHub Pages** - Hosting

## 📝 Notes

- The app requires HTTPS (GitHub Pages provides this automatically)
- Best viewed on mobile devices with modern browsers
- Camera permissions are required for AR functionality
- Works offline after initial load (service worker recommended for PWA)

## 🐛 Troubleshooting

**AR not working?**
- Ensure camera permissions are granted
- Check that the target image is well-lit and clearly visible
- Try refreshing the page
- Make sure you're using a modern mobile browser (Chrome, Safari, Firefox)

**Assets not loading?**
- Check browser console for errors
- Verify all asset paths are correct
- Ensure GitHub Pages deployment completed successfully

## 📄 License

ISC
