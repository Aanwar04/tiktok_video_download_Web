# 🎵 TikTok Video Downloader

A powerful and user-friendly web application that allows you to download TikTok videos without watermarks. Built with Node.js, Express, and vanilla JavaScript.

## ✨ Features

- **No Watermark Downloads**: Download TikTok videos in high quality without any watermarks
- **Multiple Download Methods**: Uses multiple APIs for maximum reliability
- **Audio Extraction**: Download just the audio from TikTok videos
- **Fast & Reliable**: Optimized for speed and stability
- **User-Friendly Interface**: Clean, modern design that works on all devices
- **Real-time Statistics**: View video stats like likes, comments, and shares
- **Cross-Platform**: Works on desktop and mobile browsers

## 🚀 Quick Start

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd tiktok-download
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the server**

   ```bash
   # Development mode (with auto-restart)
   npm run dev

   # Production mode
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 📋 Usage

1. **Copy TikTok URL**: Open the TikTok app, find a video, tap "Share" → "Copy Link"
2. **Paste URL**: Paste the copied link into the input field on the website
3. **Download**: Click "Download Video" to process the video
4. **Choose Format**: Download either the video (no watermark) or just the audio

## 🔧 API Endpoints

### Main Endpoints

- **`POST /api/download`** - Download TikTok video

  - Request body: `{ "url": "https://www.tiktok.com/..." }`
  - Returns: Video metadata and download URLs

- **`GET /api/health`** - Server status check

  - Returns: Server status and available methods

- **`GET /api/test`** - Test API functionality

  - Returns: Test results with sample video data

- **`GET /api/proxy`** - Proxy downloads (bypasses CORS)
  - Query parameter: `url` - The video URL to proxy
  - Returns: Streamed video file

### Download Methods

The application uses multiple fallback methods for maximum reliability:

1. **tikwm.com API** (Primary) - Most reliable method
2. **snaptik.app API** (Secondary) - Alternative method
3. **tmate.cc API** (Backup) - Fallback method

## 🛠️ Project Structure

```
tiktok-download/
├── src/
│   └── server.js          # Main server file with API endpoints
├── public/
│   └── index.html         # Frontend interface
├── package.json           # Project dependencies and scripts
├── package-lock.json      # Locked dependency versions
└── README.md             # This file
```

## 📦 Dependencies

### Backend (Node.js)

- **express** - Web framework
- **cors** - Cross-origin resource sharing
- **axios** - HTTP client for API requests
- **dotenv** - Environment variable management

### Frontend (Vanilla JS)

- **No frameworks** - Pure HTML, CSS, and JavaScript
- **Modern CSS** - Flexbox, Grid, and CSS animations
- **Responsive Design** - Works on all screen sizes

## 🎨 Design Features

- **Gradient Background**: Beautiful purple gradient theme
- **Card-based Layout**: Clean, organized interface
- **Loading Animations**: Smooth spinners and transitions
- **Progress Indicators**: Real-time download progress
- **Mobile Responsive**: Optimized for phones and tablets
- **Step-by-step Instructions**: Clear usage guide

## ⚙️ Configuration

The server runs on port 3000 by default. To change this:

1. Set the `PORT` environment variable:

   ```bash
   export PORT=8080
   npm start
   ```

2. Or modify the `PORT` variable in `src/server.js`

## 🔒 Security & Limitations

- **URL Validation**: Only accepts valid TikTok URLs
- **Error Handling**: Graceful fallbacks when APIs fail
- **Rate Limiting**: Built-in timeout and retry mechanisms
- **CORS Support**: Handles cross-origin requests properly

**Note**: This tool is for educational purposes. Please respect TikTok's terms of service and content creators' rights.

## 🐛 Troubleshooting

### Common Issues

1. **"Invalid TikTok URL"**

   - Ensure the URL is from tiktok.com or vt.tiktok.com
   - Make sure the URL is complete and not truncated

2. **"Unable to download this video"**

   - The video might be private, deleted, or age-restricted
   - Try a different TikTok video
   - Check your internet connection

3. **Download fails**
   - Try refreshing the page
   - Check if the server is running (`npm start`)
   - Verify the API endpoints are accessible

### Development Tips

- Use `npm run dev` for automatic server restarts during development
- Check the browser console for frontend errors
- Check the terminal for server-side errors
- Test with the `/api/test` endpoint to verify functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to the API providers (tikwm.com, snaptik.app, tmate.cc) for their services
- Inspired by the need for a simple, reliable TikTok downloader

## 📞 Support

If you encounter issues or have suggestions:

- Create an issue on GitHub
- Check the troubleshooting section above
- Ensure you're using the latest version

---

**Made with ❤️ for TikTok enthusiasts everywhere!**
