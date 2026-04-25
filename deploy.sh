#!/bin/bash

# Baking Shop - Docker Quick Deploy Script
# Usage: ./deploy.sh [dev|prod]

set -e

ENVIRONMENT=${1:-dev}

if [ "$ENVIRONMENT" = "dev" ]; then
    echo "🚀 Starting development environment..."
    docker-compose up --build
    
elif [ "$ENVIRONMENT" = "prod" ]; then
    echo "🚀 Starting production environment..."
    if [ ! -f .env.prod ]; then
        echo "❌ Error: .env.prod file not found!"
        echo "Please create .env.prod with production secrets"
        exit 1
    fi
    docker-compose -f docker-compose.prod.yml up -d
    echo "✅ Production environment started"
    docker-compose -f docker-compose.prod.yml ps
    
else
    echo "Usage: ./deploy.sh [dev|prod]"
    echo "  dev  - Start development environment with docker-compose"
    echo "  prod - Start production environment"
    exit 1
fi
