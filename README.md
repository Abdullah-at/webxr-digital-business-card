# WebXR Digital Business Card

An augmented reality (AR) business card built with A-Frame, MindAR, and WebXR. Users can scan a target image with their mobile camera to view an interactive 3D business card experience.

## 🚀 Live Demo

Once deployed to GitHub Pages, your app will be available at:
**https://abdullah-at.github.io/webxr-digital-business-card/**

## 📱 How It Works

1. **Print the Target Image**: Print the target image (`public/assets/tracker.png`) on your business card or any physical surface
2. **Scan with Mobile**: Users open the GitHub Pages URL on their mobile browser
3. **Point Camera**: Point the camera at the printed target image
4. **AR Experience**: The AR content appears overlaid on the target image

## 🎯 Target Image

The target image for AR tracking is located at:
- `public/assets/tracker.png` - This is the image users need to scan

**Important**: 
- Print this image on your business card
- Ensure good lighting when scanning
- Keep the target image flat and visible
- The image should be at least 2-3 inches in size for best tracking

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
