# Deployment script for Render.com

set -e

echo "Installing backend dependencies..."
cd backend
npm install --production

echo "Generating Prisma Client..."
npx prisma generate

echo "Build complete!"
