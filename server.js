const fastify = require('fastify')();
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp'); // Using Jimp library
const frame = "https://cdn.glitch.global/5d54f1e6-35d9-44f0-a734-53c477b5a9ba/unnamed.jpg?v=1709498791560"
fastify.register(require('@fastify/multipart'));

fastify.post('/upload-image', async (req, reply) => {
  try {
    const data = await req.file();


    // Read uploaded image and iPhone 15 pro frame
    const uploadedImage = await Jimp.read(data.file);
    const frameImage = await Jimp.read(path.join(__dirname, frame));

    // Get image dimensions
    const uploadedWidth = uploadedImage.bitmap.width;
    const uploadedHeight = uploadedImage.bitmap.height;
    const frameWidth = frameImage.bitmap.width;
    const frameHeight = frameImage.bitmap.height;

    // Resize uploaded image to fit within the frame while maintaining aspect ratio
    let resizedImage;
    if (uploadedWidth / uploadedHeight > frameWidth / frameHeight) {
      resizedImage = await uploadedImage.resize(frameWidth, Jimp.AUTO);
    } else {
      resizedImage = await uploadedImage.resize(Jimp.AUTO, frameHeight);
    }

    // Composite resized image onto the frame with appropriate positioning
    const compositeImage = new Jimp(frameWidth, frameHeight);
    const xOffset = (frameWidth - resizedImage.bitmap.width) / 2;
    const yOffset = (frameHeight - resizedImage.bitmap.height) / 2;
    await compositeImage.composite(resizedImage, xOffset, yOffset);

    // Convert composite image to buffer and save
    const buffer = await compositeImage.getBufferAsync(Jimp.MIME_JPEG);
    fs.writeFileSync('output.jpg', buffer);

    reply.code(200).send({ message: 'Image processed and frame integrated successfully!' });
  } catch (error) {
    console.error(error);
    reply.code(500).send('Internal server error.');
  }
});

fastify.listen({ port: 3000 }, (err) => {
  if (err) throw err;
  console.log(`Server listening on port ${fastify.server.address().port}`);
});
