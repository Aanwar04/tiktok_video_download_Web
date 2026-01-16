// src/server.js - Best version with axios
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(express.static('public'));

// Helper to format file size
function formatSize(bytes) {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

// Method 1: tikwm.com API (Most reliable)
async function downloadViaTikwm(videoUrl) {
    try {
        console.log('🔄 Trying tikwm.com API...');

        const response = await axios.get('https://www.tikwm.com/api/', {
            params: {
                url: videoUrl,
                hd: 1
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 15000
        });

        if (response.data && response.data.code === 0) {
            const data = response.data.data;

            return {
                success: true,
                data: {
                    title: data.title || 'TikTok Video',
                    author: {
                        username: data.author?.unique_id || data.author?.nickname || 'Unknown',
                        avatar: data.author?.avatar || ''
                    },
                    video: {
                        noWatermark: data.hdplay || data.play || data.wmplay,
                        withWatermark: data.wmplay,
                        cover: data.origin_cover || data.cover,
                        duration: data.duration || 0,
                        size: data.hd_size || data.size || 0,
                        qualities: [
                            {
                                type: 'HD (High)',
                                url: data.hdplay,
                                size: formatSize(data.hd_size)
                            },
                            {
                                type: 'Standard (Low)',
                                url: data.play,
                                size: formatSize(data.size)
                            }
                        ].filter(q => q.url) // Only keep available qualities
                    },
                    music: {
                        title: data.music || data.music_info?.title || 'Original Sound',
                        author: data.music_info?.author || '',
                        url: data.music_info?.play || ''
                    },
                    statistics: {
                        plays: data.play_count || 0,
                        likes: data.digg_count || 0,
                        comments: data.comment_count || 0,
                        shares: data.share_count || 0
                    }
                }
            };
        }

        throw new Error('API returned invalid response');
    } catch (error) {
        console.error('❌ tikwm.com failed:', error.message);
        throw error;
    }
}

// Method 2: snaptik.app API
async function downloadViaSnaptik(videoUrl) {
    try {
        console.log('🔄 Trying snaptik API...');

        const response = await axios.post('https://snaptik.app/api/download', {
            url: videoUrl
        }, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 15000
        });

        if (response.data && response.data.success) {
            return {
                success: true,
                data: {
                    title: response.data.title || 'TikTok Video',
                    author: {
                        username: response.data.author || 'Unknown',
                        avatar: ''
                    },
                    video: {
                        noWatermark: response.data.url,
                        withWatermark: response.data.url,
                        cover: response.data.thumbnail || '',
                        duration: 0,
                        qualities: [{
                            type: 'Standard',
                            url: response.data.url,
                            size: 'Unknown'
                        }]
                    },
                    music: {
                        title: 'Original Sound',
                        author: '',
                        url: ''
                    },
                    statistics: {
                        plays: 0,
                        likes: 0,
                        comments: 0,
                        shares: 0
                    }
                }
            };
        }

        throw new Error('Snaptik API failed');
    } catch (error) {
        console.error('❌ snaptik failed:', error.message);
        throw error;
    }
}

// Method 3: tmate.cc API (backup)
async function downloadViaTmate(videoUrl) {
    try {
        console.log('🔄 Trying tmate.cc API...');

        const response = await axios.post('https://tmate.cc/download', {
            url: videoUrl
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 15000
        });

        if (response.data && response.data.video_url) {
            return {
                success: true,
                data: {
                    title: response.data.title || 'TikTok Video',
                    author: {
                        username: response.data.author || 'Unknown',
                        avatar: ''
                    },
                    video: {
                        noWatermark: response.data.video_url,
                        withWatermark: response.data.video_url,
                        cover: response.data.thumbnail || '',
                        duration: 0,
                        qualities: [{
                            type: 'Standard',
                            url: response.data.video_url,
                            size: 'Unknown'
                        }]
                    },
                    music: {
                        title: response.data.music || 'Original Sound',
                        author: '',
                        url: ''
                    },
                    statistics: {
                        plays: 0,
                        likes: 0,
                        comments: 0,
                        shares: 0
                    }
                }
            };
        }

        throw new Error('Tmate API failed');
    } catch (error) {
        console.error('❌ tmate.cc failed:', error.message);
        throw error;
    }
}

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'Server is running!',
        availableMethods: ['tikwm', 'snaptik', 'tmate']
    });
});

// Main download endpoint with multiple fallbacks
app.post('/api/download', async (req, res) => {
    try {
        const { url } = req.body;

        // Validate URL
        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a TikTok URL'
            });
        }

        if (!url.includes('tiktok.com') && !url.includes('vt.tiktok.com')) {
            return res.status(400).json({
                success: false,
                error: 'Invalid TikTok URL'
            });
        }

        console.log('\n' + '='.repeat(50));
        console.log('📥 New download request');
        console.log('🔗 URL:', url);
        console.log('='.repeat(50) + '\n');

        // Try methods in order
        const methods = [
            { name: 'tikwm', func: downloadViaTikwm },
            { name: 'snaptik', func: downloadViaSnaptik },
            { name: 'tmate', func: downloadViaTmate }
        ];

        let lastError = null;

        for (const method of methods) {
            try {
                const result = await method.func(url);
                console.log(`✅ Success with ${method.name}!\n`);
                return res.json(result);
            } catch (error) {
                lastError = error;
                console.log(`⚠️  ${method.name} failed, trying next method...\n`);
            }
        }

        // All methods failed
        throw lastError || new Error('All download methods failed');

    } catch (error) {
        console.error('❌ All methods failed');
        console.error('Error:', error.message);
        console.log('='.repeat(50) + '\n');

        res.status(500).json({
            success: false,
            error: 'Unable to download this video. The video might be private, deleted, or temporarily unavailable. Please try again later.'
        });
    }
});

// Test endpoint
app.get('/api/test', async (req, res) => {
    const testUrl = 'https://www.tiktok.com/@zachking/video/7139337044015959342';

    try {
        const result = await downloadViaTikwm(testUrl);
        res.json({
            message: '✅ API is working!',
            testUrl,
            result
        });
    } catch (error) {
        res.json({
            message: '❌ API test failed',
            error: error.message
        });
    }
});

// Proxy endpoint to download files (bypasses CORS)
app.get('/api/proxy', async (req, res) => {
    try {
        const { url, play } = req.query;

        if (!url) {
            return res.status(400).json({ error: 'URL parameter required' });
        }

        console.log('📥 Proxying download:', url);

        // Stream the file through our server
        const response = await axios({
            method: 'GET',
            url: url,
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        // Set headers for download
        res.setHeader('Content-Type', response.headers['content-type'] || 'video/mp4');

        if (play === 'true') {
            res.setHeader('Content-Disposition', 'inline');
        } else {
            res.setHeader('Content-Disposition', 'attachment; filename="tiktok_video.mp4"');
        }

        // Pipe the stream
        response.data.pipe(res);

    } catch (error) {
        console.error('Proxy error:', error.message);
        res.status(500).json({ error: 'Failed to proxy download' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log('\n' + '='.repeat(50));
    console.log('🚀 TikTok Downloader Server Started!');
    console.log('='.repeat(50));
    if (process.env.RENDER) {
        console.log(`\n📡 Server running on Render`);
    } else {
        console.log(`\n📡 Server: http://localhost:${PORT}`);
    }
    console.log(`\n📝 Endpoints:`);
    console.log(`   • POST /api/download - Download videos`);
    console.log(`   • GET  /api/health   - Server status`);
    console.log(`   • GET  /api/test     - Test API`);
    console.log(`\n🌐 Open http://localhost:${PORT} in your browser`);
    console.log(`🧪 Test: http://localhost:${PORT}/api/test`);
    console.log('\n' + '='.repeat(50) + '\n');
});