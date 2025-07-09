# Audio Transcriber

A modern web application for transcribing audio files using OpenAI's Whisper API. Features a beautiful, responsive interface with drag-and-drop file upload support.

## Features

- 🎵 **Multiple Audio Formats**: Supports WAV, MP3, M4A, FLAC, OGG, and AAC
- 📁 **Drag & Drop Upload**: Modern interface with drag-and-drop functionality
- 🎨 **Responsive Design**: Works perfectly on desktop and mobile devices
- ⚡ **Fast Processing**: Uses OpenAI's Whisper API for accurate transcription
- 🔒 **Secure**: File cleanup after processing
- 🐳 **Docker Ready**: Easy deployment with Docker

## Prerequisites

- Docker and Docker Compose
- OpenAI API key (get one from [OpenAI Platform](https://platform.openai.com/api-keys))

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd audio_trasncriber
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env and add your OpenAI API key
   ```

3. **Deploy with Docker**
   ```bash
   ./deploy.sh
   ```

4. **Access the application**
   Open your browser and go to `http://localhost:5002`

## Configuration

### Environment Variables

Create a `.env` file based on `env.example`:

```bash
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Flask Configuration
FLASK_APP=app.py
FLASK_ENV=production

# Docker Configuration
DOCKER_IMAGE_NAME=audio-transcriber
DOCKER_CONTAINER_NAME=audio-transcriber-api
```

### OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add it to your `.env` file

## Usage

1. **Upload Audio**: Drag and drop an audio file or click to browse
2. **Wait for Processing**: The app will convert and transcribe your audio
3. **View Results**: The transcription will appear in the text area
4. **Copy or Download**: Use the copy button or download the transcription

## Supported Audio Formats

- WAV (.wav)
- MP3 (.mp3)
- M4A (.m4a)
- FLAC (.flac)
- OGG (.ogg)
- AAC (.aac)

**File Size Limit**: 25MB (OpenAI API limit)

## Development

### Local Development

1. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set environment variables**
   ```bash
   export OPENAI_API_KEY=your_api_key_here
   ```

3. **Run the application**
   ```bash
   python app.py
   ```

### Docker Development

1. **Build the image**
   ```bash
   docker build -t audio-transcriber .
   ```

2. **Run the container**
   ```bash
   docker run -p 5002:5000 -e OPENAI_API_KEY=your_api_key_here audio-transcriber
   ```

## Deployment

### Using the Deployment Script

The included `deploy.sh` script handles the complete deployment process:

```bash
./deploy.sh
```

This script will:
- Build the Docker image
- Stop any existing containers
- Start the new container
- Show the application URL

### Manual Deployment

1. **Build the image**
   ```bash
   docker build -t audio-transcriber .
   ```

2. **Run with Docker Compose**
   ```bash
   docker compose up -d
   ```

3. **Check the logs**
   ```bash
   docker compose logs -f
   ```

## API Endpoints

- `GET /` - Main application interface
- `POST /upload` - Upload and transcribe audio file
- `GET /health` - Health check endpoint

## Troubleshooting

### Common Issues

1. **"OpenAI API key not found"**
   - Ensure your `.env` file contains the `OPENAI_API_KEY`
   - Check that the environment variable is properly set

2. **"File too large"**
   - The OpenAI API has a 25MB file size limit
   - Compress your audio file or use a shorter recording

3. **"Invalid file type"**
   - Ensure your file is one of the supported formats
   - Check the file extension

4. **"Rate limit exceeded"**
   - Wait a moment and try again
   - Check your OpenAI API usage limits

### Logs

View application logs:
```bash
docker compose logs -f
```

## Security Notes

- Files are automatically deleted after processing
- No audio files are stored permanently
- API keys should be kept secure and not committed to version control

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 