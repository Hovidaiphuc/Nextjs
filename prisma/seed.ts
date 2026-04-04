import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('123456', 10);

  // Tạo User Admin
  await prisma.user.upsert({
    where: { email: 'boss@luxcosmetics.com' },
    update: { password: passwordHash, role: 'ADMIN' },
    create: {
      email: 'boss@luxcosmetics.com',
      name: 'CEO Lux Derma',
      password: passwordHash,
      role: 'ADMIN'
    },
  });

  // Tạo User Khách hàng
  const user = await prisma.user.upsert({
    where: { email: 'customer@luxcosmetics.com' },
    update: { password: passwordHash, role: 'USER' },
    create: {
      email: 'customer@luxcosmetics.com',
      name: 'Vị Khách Hàng Xịn',
      password: passwordHash,
      role: 'USER'
    },
  });

  // Tạo User Bác sĩ
  const docUser = await prisma.user.upsert({
    where: { email: 'doctor@luxcosmetics.com' },
    update: { password: passwordHash, role: 'DOCTOR' },
    create: {
      email: 'doctor@luxcosmetics.com',
      name: 'Dr. Trần Vân Anh',
      password: passwordHash,
      role: 'DOCTOR'
    },
  });

  // Tạo Category
  const catAcne = await prisma.category.upsert({
    where: { slug: 'tri-mun' },
    update: {},
    create: { name: 'Đặc trị mụn', slug: 'tri-mun' }
  });
  
  const catAging = await prisma.category.upsert({
    where: { slug: 'chong-lao-hoa' },
    update: {},
    create: { name: 'Chống lão hóa', slug: 'chong-lao-hoa' }
  });

  // Cấp dọn toàn bộ rác nếu run nhiều lần
  await prisma.product.deleteMany({});
  await prisma.doctor.deleteMany({});
  
  // Tạo Products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Serum Phục Hồi B5 La Roche-Posay',
        description: 'Tinh chất phục hồi màng bảo vệ da cực mạnh dành cho da nhạy cảm.',
        price: 850000,
        categoryId: catAcne.id,
        imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
      }
    }),
    prisma.product.create({
      data: {
        name: 'Kem dưỡng Retinol 1.0 Obagi',
        description: 'Đặc trị nếp nhăn và đốm nâu hiệu quả cao.',
        price: 1550000,
        categoryId: catAging.id,
        imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800&q=80',
      }
    })
  ]);

  // Tạo Profile Bác sĩ (public profile mapping với User DOCTOR)
  const doctorProfile = await prisma.doctor.create({
    data: {
      name: 'Dr. Trần Vân Anh',
      specialty: 'Da liễu thẩm mỹ kỹ thuật cao',
      experienceYr: 10,
      avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
      rating: 4.9
    }
  });

  // Tạo Ticket ảo
  await prisma.consultationTicket.deleteMany({});
  await prisma.consultationTicket.create({
      data: {
          userId: user.id,
          doctorId: doctorProfile.id,
          skinIssue: 'Dạo này da tôi đổ dầu rất nhiều quanh vùng chữ T, mụn viêm đỏ sưng tấy 2 bên má.',
          status: 'PENDING'
      }
  });

  console.log('Seeding completed! Login accounts:\ncustomer@luxcosmetics.com - 123456\ndoctor@luxcosmetics.com - 123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
