import express from 'express';
import multer  from 'multer';
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs  from 'fs';

// Initialize express app
const app = express();
const port = 3000;

// Multer setup for handling image upload
const upload = multer({ dest: 'uploads/' });

// Route for image analysis
app.post('/analyze-image', upload.single('image'), async (req, res) => {
    const imagePath = req.file.path;

    // Create a FormData object to send the image to DALL·E API
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));

    try {
        // Send the image to DALL·E's image analysis API
        const apiResponse = await fetch('https://api.dalle.ai/analyze', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer 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`
            },
            body: formData
        });

        const result = await apiResponse.json();
        const description = result.description || "No description available.";

        // Send the description back to the frontend
        res.json({ description });

    } catch (error) {
        console.error("Error during DALL·E API request", error);
        res.status(500).json({ description: "Error analyzing image." });
    } finally {
        // Clean up the uploaded image
        fs.unlink(imagePath, (err) => {
            if (err) console.error("Error deleting uploaded image", err);
        });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Backend server running on port ${port}`);
});
