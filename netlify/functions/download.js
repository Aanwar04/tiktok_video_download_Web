const axios = require('axios');

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
                        cover: data.cover || data.origin_cover,
                        duration: data.duration || 0
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
                        duration: 0
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
                        duration: 0
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

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }

    try {
        const { url } = JSON.parse(event.body);

        // Validate URL
        if (!url) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
                body: JSON.stringify({
                    success: false,
                    error: 'Please provide a TikTok URL'
                })
            };
        }

        if (!url.includes('tiktok.com') && !url.includes('vt.tiktok.com')) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
                body: JSON.stringify({
                    success: false,
                    error: 'Invalid TikTok URL'
                })
            };
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
                return {
                    statusCode: 200,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type'
                    },
                    body: JSON.stringify(result)
                };
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

        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({
                success: false,
                error: 'Unable to download this video. The video might be private, deleted, or temporarily unavailable. Please try again later.'
            })
        };
    }
};