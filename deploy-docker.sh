#!/bin/bash

# Quick deployment script using Docker Compose
# This is an alternative to the manual deployment script

set -e

echo "=========================================="
echo "EchoWork Docker Deployment"
echo "=========================================="
echo

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env.prod exists
if [ ! -f ".env.prod" ]; then
    echo "Creating .env.prod from .env.prod.example..."
    cp .env.prod.example .env.prod
    echo
    echo "Please edit .env.prod with your configuration before continuing."
    echo "Press Enter after editing the file, or Ctrl+C to exit..."
    read
fi

# Build frontend
echo "Building frontend..."
if [ ! -f ".env" ]; then
    echo "VITE_API_URL=http://localhost/api" > .env
fi

npm install
npm run build

echo "Frontend built successfully!"
echo

# Start Docker services
echo "Starting Docker services..."
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

echo
echo "Waiting for services to be healthy..."
sleep 10

# Check service status
docker-compose -f docker-compose.prod.yml ps

echo
echo "=========================================="
echo "Deployment completed!"
echo "=========================================="
echo
echo "Application URLs:"
echo "  Frontend: http://localhost"
echo "  Backend API: http://localhost/api"
echo
echo "Useful commands:"
echo "  View logs:     docker-compose -f docker-compose.prod.yml logs -f"
echo "  Stop services: docker-compose -f docker-compose.prod.yml down"
echo "  Restart:       docker-compose -f docker-compose.prod.yml restart"
echo
echo "=========================================="
