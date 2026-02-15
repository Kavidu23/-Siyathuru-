const nsfw = require('nsfwjs');
const tf = require('@tensorflow/tfjs');
const { createCanvas, loadImage } = require('canvas');

let model;

// Load NSFW model once
async function loadModel() {
  if (!model) {
    model = await nsfw.load();
    console.log('NSFW model loaded');
  }
}

const nsfwCheck = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided.',
      });
    }

    if (!req.file.mimetype || !req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        error: 'Only image files are allowed.',
      });
    }

    await loadModel();

    let image;
    try {
      image = await loadImage(req.file.buffer);
    } catch (imageErr) {
      console.error('NSFW image decode error:', imageErr.message);
      return res.status(400).json({
        success: false,
        error: 'Could not read image. Please upload a valid JPG or PNG image.',
      });
    }

    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);

    const predictions = await model.classify(canvas);

    const flagged = predictions.some(
      (p) => ['Porn', 'Hentai', 'Sexy'].includes(p.className) && p.probability > 0.7,
    );

    if (flagged) {
      return res.status(400).json({
        success: false,
        error: 'This image contains inappropriate content. Please upload another image.',
      });
    }

    next();
  } catch (err) {
    console.error('NSFW check error:', err);
    return res.status(500).json({
      success: false,
      error: 'Unable to analyze image content right now. Please try again.',
    });
  }
};

module.exports = nsfwCheck;
