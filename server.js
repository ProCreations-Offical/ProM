const fastify = require('fastify')();
const fs = require('fs');
const path = require('path');
const sharp = require('sharp'); // Using Sharp library

fastify.register(require('@fastify/multipart'));

fastify.post('/upload-image', async (req, reply) => {
  try {
    const data = await req.file();

    if (!data.mimetype.startsWith('image/')) {
      return reply.code(400).send('Invalid file type. Please upload an image.');
    }

    // Read uploaded image and iPhone 15 pro frame
    const uploadedImage = await sharp(data.file);
    const frameImage = await sharp(path.join(__dirname, 'iphone-15-pro-frame.jpg'));

    // Get image metadata (width and height)
    const uploadedMetadata = await uploadedImage.metadata();
    const frameMetadata = await frameImage.metadata();

    // Resize uploaded image to fit within the frame while maintaining aspect ratio
    let resizedImage;
    if (uploadedMetadata.width > uploadedMetadata.height) {
      resizedImage = await uploadedImage.resize({ width: frameMetadata.width });
    } else {
      resizedImage = await uploadedImage.resize({ height: frameMetadata.height });
    }

    // Composite resized image onto the frame with appropriate positioning
    const finalImage = await frameImage
      .composite([resizedImage], {
        top: (frameMetadata.height - resizedImage.height) / 2,
        left: (frameMetadata.width - resizedImage.width) / 2,
      })
      .toBuffer();

    fs.writeFileSync('output.jpg', finalImage);

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