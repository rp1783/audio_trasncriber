#!/bin/bash

# Audio Transcriber Deployment Script
# This script builds and deploys the audio transcription application

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from template..."
    cp env.example .env
    print_error "Please edit .env file and add your OpenAI API key before running this script again."
    print_error "You can get an API key from: https://platform.openai.com/api-keys"
    exit 1
fi

# Load environment variables
source .env

# Check if OPENAI_API_KEY is set
if [ -z "$OPENAI_API_KEY" ] || [ "$OPENAI_API_KEY" = "your_openai_api_key_here" ]; then
    print_error "OPENAI_API_KEY is not set in .env file"
    print_error "Please edit .env file and add your OpenAI API key"
    print_error "You can get an API key from: https://platform.openai.com/api-keys"
    exit 1
fi

print_status "Starting deployment..."

# Stop any existing containers
print_status "Stopping existing containers..."
docker compose down 2>/dev/null || true

# Remove old images to ensure clean build
print_status "Removing old images..."
docker rmi audio-transcriber:latest 2>/dev/null || true

# Build the new image
print_status "Building Docker image..."
docker compose build --no-cache

# Start the application
print_status "Starting the application..."
docker compose up -d

# Wait a moment for the container to start
sleep 5

# Check if the container is running
if docker compose ps | grep -q "Up"; then
    print_success "Application deployed successfully!"
    print_success "Access the application at: http://localhost:5002"
    print_status "To view logs, run: docker compose logs -f"
    print_status "To stop the application, run: docker compose down"
else
    print_error "Failed to start the application"
    print_status "Checking logs..."
    docker compose logs
    exit 1
fi

# Show container status
print_status "Container status:"
docker compose ps 