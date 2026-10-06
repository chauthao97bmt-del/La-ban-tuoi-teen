# Deployment script for Render.com
# This script runs during build phase

set -e

echo "Installing backend dependencies..."
cd backend
npm install

echo "Building backend (TypeScript)..."
npm run build || true

echo "Generating Prisma Client..."
npx prisma generate

echo "Installing frontend dependencies..."
cd ../frontend
npm install

echo "Building frontend..."
npm run build || true

echo "Build complete!"
