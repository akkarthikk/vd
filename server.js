const express = require('express');
const path = require('path');
const multer = require('multer');
const pool = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to handle video uploads
app.post('/upload', upload.single('video'), async (req, res) => {
    const video = req.file.buffer;
    const { latitude, longitude } = req.body;

    try {
        const client = await pool.connect();
        const query = 'INSERT INTO videos (video, latitude, longitude) VALUES ($1, $2, $3) RETURNING id';
        const values = [video, latitude, longitude];
        const result = await client.query(query, values);
        client.release();

        res.status(200).send(`Video saved successfully with ID: ${result.rows[0].id}`);
    } catch (err) {
        console.error('Error saving video to database', err);
        res.status(500).send('Failed to save video');
    }
});

// Endpoint to fetch all videos
app.get('/videos', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT id, latitude, longitude, timestamp FROM videos');
        client.release();

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching videos from database', err);
        res.status(500).send('Failed to fetch videos');
    }
});
app.get('/download/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT video FROM videos WHERE id = $1', [id]);
        client.release();

        if (result.rows.length > 0) {
            const video = result.rows[0].video;
            res.writeHead(200, {
                'Content-Type': 'video/webm',
                'Content-Length': video.length,
                'Content-Disposition': `attachment; filename=video_${id}.webm`
            });
            res.end(video);
        } else {
            res.status(404).send('Video not found');
        }
    } catch (err) {
        console.error('Error fetching video from database', err);
        res.status(500).send('Failed to fetch video');
    }
});
// Endpoint to serve individual videos
app.get('/video/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT video FROM videos WHERE id = $1', [id]);
        client.release();

        if (result.rows.length > 0) {
            const video = result.rows[0].video;
            res.writeHead(200, {
                'Content-Type': 'video/webm',
                'Content-Length': video.length
            });
            res.end(video);
        } else {
            res.status(404).send('Video not found');
        }
    } catch (err) {
        console.error('Error fetching video from database', err);
        res.status(500).send('Failed to fetch video');
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/videos-page', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'videos.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
