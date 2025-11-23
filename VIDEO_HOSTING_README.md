# Video Hosting Solution for Vendetta.mp4

The `Vendetta.mp4` file (205MB) is too large for GitHub's 100MB file limit and has been added to `.gitignore`.

## Options for Hosting the Video:

### Option 1: Use Git LFS (Recommended for GitHub Pages)
If you want to keep the video in your repository:

1. Install Git LFS:
   ```bash
   brew install git-lfs  # macOS
   # or download from https://git-lfs.github.com/
   ```

2. Initialize Git LFS in your repo:
   ```bash
   git lfs install
   ```

3. Track the video file:
   ```bash
   git lfs track "public/assets/Vendetta.mp4"
   ```

4. Add the .gitattributes file:
   ```bash
   git add .gitattributes
   ```

5. Add and commit the video:
   ```bash
   git add public/assets/Vendetta.mp4
   git commit -m "Add Vendetta video via Git LFS"
   ```

**Note:** GitHub Pages supports Git LFS, so this will work for your deployment.

### Option 2: Host on External CDN
Host the video on a CDN and update the import in `src/main.js`:

1. Upload to a service like:
   - Cloudinary (free tier available)
   - AWS S3 + CloudFront
   - Vimeo/YouTube (unlisted)
   - GitHub Releases (as a release asset)

2. Update `src/main.js`:
   ```javascript
   // Change from:
   import vendettaVideoURL from '/assets/Vendetta.mp4';
   
   // To:
   const vendettaVideoURL = 'https://your-cdn-url.com/Vendetta.mp4';
   ```

### Option 3: Compress the Video
Reduce the file size to under 100MB:

```bash
# Using ffmpeg (if installed)
ffmpeg -i public/assets/Vendetta.mp4 \
  -c:v libx264 \
  -crf 28 \
  -preset slow \
  -c:a aac \
  -b:a 128k \
  public/assets/Vendetta_compressed.mp4
```

Then rename and commit the compressed version.

## Current Status
The video file is currently ignored by git and won't be committed. You'll need to choose one of the options above to make it available in your deployed application.

