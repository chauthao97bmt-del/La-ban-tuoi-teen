set -e

echo "Installing backend dependencies..."
cd backend
npm install

echo "Generating Prisma Client..."
npx prisma generate

echo "Building backend..."
npm run build

echo "Backend build complete!"
