import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

const prisma = new PrismaClient();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const imagesDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\df0fecd6-efae-4cde-ab80-eb940ae3df37\\.user_uploaded';

async function processImage(imagePath: string) {
  const fileBytes = fs.readFileSync(imagePath);
  const base64 = fileBytes.toString('base64');
  
  const prompt = `
  Đây là hình ảnh chụp danh sách học sinh. 
  Hãy trích xuất thông tin thành mảng JSON với cấu trúc:
  [
    { "class": "9A1", "studentCode": "9A101", "fullName": "Nguyễn Văn A" }
  ]
  Chỉ trả về JSON hợp lệ, không có markdown.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64,
                mimeType: 'image/jpeg'
              }
            }
          ]
        }
      ]
    });
    
    let text = response.text || '[]';
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(text);
    return data;
  } catch (err) {
    console.error('Lỗi đọc ảnh', imagePath, err);
    return [];
  }
}

async function main() {
  const files = fs.readdirSync(imagesDir).filter(f => f.endsWith('.jpg'));
  
  for (const file of files) {
    console.log(`Đang đọc ảnh ${file}...`);
    const data = await processImage(path.join(imagesDir, file));
    
    for (const item of data) {
      if (!item.studentCode || !item.fullName) continue;
      
      const username = item.studentCode.trim().toUpperCase();
      const user = await prisma.user.findUnique({ where: { username } });
      
      if (user) {
        await prisma.student.updateMany({
          where: { userId: user.id },
          data: { fullName: item.fullName }
        });
        console.log(`Đã cập nhật: ${username} -> ${item.fullName}`);
      }
    }
  }
  
  console.log('Hoàn tất cập nhật tên!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
