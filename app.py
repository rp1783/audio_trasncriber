import os
import openai
from openai import OpenAI, OpenAIError, AuthenticationError, RateLimitError, APIError
from flask import Flask, request, jsonify, render_template, send_from_directory
from werkzeug.utils import secure_filename
from pydub import AudioSegment
import tempfile
import json
import traceback

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 25 * 1024 * 1024  # 25MB max file size (OpenAI limit)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ALLOWED_EXTENSIONS'] = {'wav', 'mp3', 'm4a', 'flac', 'ogg', 'aac'}

# Create uploads directory if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize OpenAI client
def init_openai():
    """Initialize OpenAI client with API key"""
    try:
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")
        
        # Clear any proxy-related environment variables that might interfere
        proxy_vars = ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy']
        for var in proxy_vars:
            if var in os.environ:
                print(f"Warning: {var} environment variable found: {os.environ[var]}")
        
        client = OpenAI(api_key=api_key)
        print("✅ OpenAI client initialized successfully!")
        return client
    except Exception as e:
        print(f"❌ Error initializing OpenAI client: {str(e)}")
        print(f"Full traceback: {traceback.format_exc()}")
        raise

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def convert_audio_to_mp3(file_path):
    """Convert audio file to MP3 format for OpenAI API"""
    try:
        audio = AudioSegment.from_file(file_path)
        mp3_path = file_path.rsplit('.', 1)[0] + '.mp3'
        audio.export(mp3_path, format='mp3')
        return mp3_path
    except Exception as e:
        print(f"Error converting audio: {e}")
        return file_path

def transcribe_audio_api(client, audio_path):
    """Transcribe audio file using OpenAI API"""
    try:
        with open(audio_path, "rb") as audio_file:
            transcript = client.audio.transcriptions.create(
                file=audio_file,
                model="whisper-1",
                response_format="text"
            )
        return transcript.strip(), None
    except AuthenticationError:
        return None, "Invalid OpenAI API key. Please check your API key."
    except RateLimitError:
        return None, "Rate limit exceeded. Please try again later."
    except APIError as e:
        return None, f"OpenAI API error: {str(e)}"
    except Exception as e:
        return None, f"Error during transcription: {str(e)}"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            
            try:
                # Convert to MP3 for better API compatibility
                mp3_path = convert_audio_to_mp3(file_path)
                
                # Initialize OpenAI client
                print("🔄 Initializing OpenAI client...")
                client = init_openai()
                
                # Transcribe the audio using OpenAI API
                print("🔄 Starting transcription...")
                transcription, error = transcribe_audio_api(client, mp3_path)
                
                # Clean up temporary files
                if mp3_path != file_path and os.path.exists(mp3_path):
                    os.remove(mp3_path)
                os.remove(file_path)
                
                if error:
                    print(f"❌ Transcription error: {error}")
                    return jsonify({'error': error}), 400
                
                print("✅ Transcription completed successfully!")
                return jsonify({
                    'transcription': transcription,
                    'filename': filename
                })
                
            except Exception as e:
                # Clean up on error
                if os.path.exists(file_path):
                    os.remove(file_path)
                print(f"❌ Error during processing: {str(e)}")
                print(f"Full traceback: {traceback.format_exc()}")
                return jsonify({'error': f'Error processing file: {str(e)}'}), 500
        
        return jsonify({'error': 'Invalid file type'}), 400
    except Exception as e:
        print(f"❌ Unexpected error in upload_file: {str(e)}")
        print(f"Full traceback: {traceback.format_exc()}")
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500

@app.route('/health')
def health():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 