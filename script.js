// Get the video element from the HTML document by its ID
const video = document.getElementById('video');

// Load the models needed for face detection, landmarks, recognition, and expressions
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'), // Load Tiny Face Detector model
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'), // Load Face Landmark model
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'), // Load Face Recognition model
  faceapi.nets.faceExpressionNet.loadFromUri('/models') // Load Face Expression model
]).then(startVideo); // Once models are loaded, start the video

// Function to start video stream from the user's webcam
function startVideo() {
  navigator.mediaDevices.getUserMedia(
    { video: {} } // Request video stream
  ).then(stream => {
    video.srcObject = stream; // On success, set the video element's source to the stream
  }).catch(err => {
    console.error(err); // On error, log the error
  });
}

// Add an event listener to the video element for the 'play' event
video.addEventListener('play', () => {
  // Create a canvas element from the video stream
  const canvas = faceapi.createCanvasFromMedia(video);
  // Append the canvas to the document body
  document.body.append(canvas);
  // Set display size to match the video dimensions
  const displaySize = { width: video.width, height: video.height };
  // Adjust the canvas size to match the display size
  faceapi.matchDimensions(canvas, displaySize);
  
  // Run detection and drawing at regular intervals
  setInterval(async () => {
    // Detect faces, landmarks, and expressions in the video
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
    // Resize the detected results to match the display size
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    // Clear the canvas before drawing new results
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    // Draw the detections, landmarks, and expressions on the canvas
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
  }, 100); // Run every 100 milliseconds
});
