document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const progressSection = document.getElementById('progressSection');
    const resultSection = document.getElementById('resultSection');
    const errorSection = document.getElementById('errorSection');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const transcriptionText = document.getElementById('transcriptionText');
    const errorText = document.getElementById('errorText');

    // Drag and drop functionality
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    uploadArea.addEventListener('click', function() {
        fileInput.click();
    });

    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    function handleFile(file) {
        // Validate file type
        const allowedTypes = ['audio/wav', 'audio/mp3', 'audio/m4a', 'audio/flac', 'audio/ogg', 'audio/aac'];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const allowedExtensions = ['wav', 'mp3', 'm4a', 'flac', 'ogg', 'aac'];
        
        if (!allowedExtensions.includes(fileExtension)) {
            showError('Please select a valid audio file (WAV, MP3, M4A, FLAC, OGG, AAC)');
            return;
        }

        // Validate file size (25MB max for API version)
        if (file.size > 25 * 1024 * 1024) {
            showError('File size must be less than 25MB');
            return;
        }

        uploadFile(file);
    }

    function uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        // Show progress
        showProgress();
        hideResults();
        hideError();

        // Simulate progress animation
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90;
            updateProgress(progress);
        }, 200);

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            clearInterval(progressInterval);
            updateProgress(100);
            
            setTimeout(() => {
                hideProgress();
                if (data.error) {
                    showError(data.error);
                } else {
                    showResult(data.transcription);
                }
            }, 500);
        })
        .catch(error => {
            clearInterval(progressInterval);
            hideProgress();
            showError('Network error. Please try again.');
            console.error('Error:', error);
        });
    }

    function showProgress() {
        progressSection.style.display = 'block';
        progressFill.style.width = '0%';
    }

    function hideProgress() {
        progressSection.style.display = 'none';
    }

    function updateProgress(percentage) {
        progressFill.style.width = percentage + '%';
        if (percentage < 30) {
            progressText.textContent = 'Uploading file...';
        } else if (percentage < 70) {
            progressText.textContent = 'Processing audio...';
        } else {
            progressText.textContent = 'Transcribing...';
        }
    }

    function showResult(transcription) {
        transcriptionText.textContent = transcription;
        resultSection.style.display = 'block';
    }

    function hideResults() {
        resultSection.style.display = 'none';
    }

    function showError(message) {
        errorText.textContent = message;
        errorSection.style.display = 'block';
    }

    function hideError() {
        errorSection.style.display = 'none';
    }

    // Copy to clipboard functionality
    window.copyToClipboard = function() {
        const text = transcriptionText.textContent;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                showCopySuccess();
            }).catch(() => {
                fallbackCopyTextToClipboard(text);
            });
        } else {
            fallbackCopyTextToClipboard(text);
        }
    };

    function fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            showCopySuccess();
        } catch (err) {
            showError('Failed to copy text');
        }
        
        document.body.removeChild(textArea);
    }

    function showCopySuccess() {
        const copyBtn = document.getElementById('copyBtn');
        const originalText = copyBtn.innerHTML;
        
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        copyBtn.style.background = '#28a745';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.style.background = '#28a745';
        }, 2000);
    }

    // Add some visual feedback for file selection
    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            const fileName = e.target.files[0].name;
            const uploadContent = uploadArea.querySelector('.upload-content');
            const originalContent = uploadContent.innerHTML;
            
            uploadContent.innerHTML = `
                <i class="fas fa-file-audio upload-icon"></i>
                <h3>Selected: ${fileName}</h3>
                <p>Processing...</p>
            `;
            
            setTimeout(() => {
                uploadContent.innerHTML = originalContent;
            }, 3000);
        }
    });
}); 