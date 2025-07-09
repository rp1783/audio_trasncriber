#!/bin/bash

# Audio Transcriber API Deployment Script

set -e

echo "🎵 Audio Transcriber API Deployment Script"
echo "=========================================="

# Function to check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    echo "✅ Docker is installed"
}

# Function to check OpenAI API key
check_api_key() {
    if [ -z "$OPENAI_API_KEY" ]; then
        echo "❌ OPENAI_API_KEY environment variable is not set."
        echo "Please set your OpenAI API key:"
        echo "export OPENAI_API_KEY='your-api-key-here'"
        echo ""
        echo "Or create a .env file with:"
        echo "OPENAI_API_KEY=your-api-key-here"
        exit 1
    fi
    
    echo "✅ OpenAI API key is configured"
}

# Function to create necessary directories
create_directories() {
    echo "📁 Creating necessary directories..."
    mkdir -p uploads logs
    echo "✅ Directories created"
}

# Function to build and start the application
deploy() {
    local environment=${1:-development}
    
    echo "🚀 Deploying Audio Transcriber API in $environment mode..."
    
    if [ "$environment" = "production" ]; then
        echo "🏭 Using production configuration..."
        # Set production environment variables
        export FLASK_ENV=production
        export FLASK_DEBUG=0
    else
        echo "🔧 Using development configuration..."
        export FLASK_ENV=development
        export FLASK_DEBUG=1
    fi
    
    docker compose -f docker-compose.api.yml up --build -d
    
    echo "✅ Application deployed successfully!"
    echo "🌐 Open your browser and navigate to: http://localhost:5000"
    echo "🔑 Using OpenAI API for transcription"
}

# Function to stop the application
stop() {
    echo "🛑 Stopping Audio Transcriber API..."
    docker compose -f docker-compose.api.yml down
    echo "✅ Application stopped"
}

# Function to show logs
logs() {
    echo "📋 Showing logs..."
    docker compose -f docker-compose.api.yml logs -f
}

# Function to show status
status() {
    echo "📊 Application Status:"
    docker compose -f docker-compose.api.yml ps
}

# Function to show help
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  deploy [env]    Deploy the application (env: development|production, default: development)"
    echo "  stop            Stop the application"
    echo "  logs            Show application logs"
    echo "  status          Show application status"
    echo "  help            Show this help message"
    echo ""
    echo "Environment Setup:"
    echo "  export OPENAI_API_KEY='your-api-key-here'"
    echo "  # or create a .env file with OPENAI_API_KEY=your-api-key-here"
    echo ""
    echo "Examples:"
    echo "  $0 deploy              # Deploy in development mode"
    echo "  $0 deploy production   # Deploy in production mode"
    echo "  $0 stop               # Stop the application"
    echo "  $0 logs               # Show logs"
}

# Main script logic
case "${1:-help}" in
    "deploy")
        check_docker
        check_api_key
        create_directories
        deploy "${2:-development}"
        ;;
    "stop")
        stop
        ;;
    "logs")
        logs
        ;;
    "status")
        status
        ;;
    "help"|*)
        show_help
        ;;
esac 