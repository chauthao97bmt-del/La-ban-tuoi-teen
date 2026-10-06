# Deployment script for Render.com
# This script runs during build phase

set -e

echo "Installing backend dependencies..."
cd backend
npm install --include=dev

echo "Building backend (TypeScript)..."
npm run build

echo "Generating Prisma Client..."
npx prisma generate

echo "Installing frontend dependencies..."
cd ../frontend
npm install --include=dev

echo "Building frontend..."
npm run build

echo "Build complete!"
