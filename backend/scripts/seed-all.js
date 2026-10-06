const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const PASSWORD_HASH = bcrypt.hashSync('Demo@123', 10);

// ─── Danh sách học sinh theo lớp ───────────────────────────────────────────

const classes = [
  {
    name: '9A1', code: 'TQD-9A1', year: 2025,
    teacher: { fullName: 'Trần Thị Tiên', username: 'tranthi.tien' },
    students: [
      ['Bảo An','9A101'],['Châu Anh','9A102'],['Quý Anh','9A103'],['Ngọc Anh','9A104'],
      ['Trần Gia Bảo','9A105'],['Bảo Châu A','9A106'],['Bảo Châu B','9A107'],['Khánh Chi','9A108'],
      ['Chí Cương','9A109'],['Quốc Cường','9A110'],['Văn Danh','9A111'],['Tuấn Tú','9A112'],
      ['Hoàng Giang','9A113'],['Minh Hằng','9A114'],['Gia Hân','9A115'],['H\' Huê','9A116'],
      ['Quang Huy','9A117'],['Gia Huy','9A118'],['Nhật Huy','9A119'],['Ngọc Huyền','9A120'],
      ['Diệu Huyền','9A121'],['Nguyên Khang','9A122'],['Gia Khiêm','9A123'],['Đăng Lê','9A124'],
      ['Minh Khôi','9A125'],['Gia Long','9A126'],['Quốc Mạnh','9A127'],['Trà My','9A128'],
      ['Hoàng My','9A129'],['Diệm My','9A130'],['Ny Na','9A131'],['Nhật Nam','9A132'],
      ['Bảo Ngọc A','9A133'],['Bảo Ngọc B','9A134'],['Thái Nguyên','9A135'],['Anh Nguyên','9A136'],
      ['Yến Nhi','9A137'],['Chánh Pháp','9A138'],['Bảo Phong','9A139'],['Nhật Quang','9A140'],
      ['Anh Quân','9A141'],['Tú Quyền','9A142'],['Anh Thy','9A143'],['Công Tín','9A144'],
      ['Phương Trang','9A145'],['Quỳnh Trâm','9A146'],['Thể Triều','9A147'],['Tú Uyên','9A148'],
      ['Thục Uyên','9A149'],
    ]
  },
  {
    name: '9A2', code: 'TQD-9A2', year: 2025,
    teacher: { fullName: 'Trần Thị Nguyệt', username: 'tranthi.nguyet' },
    students: [
      ['Cát Anh','9A201'],['Phương Anh','9A202'],['Bảo Anh','9A203'],['Tuấn Anh A','9A204'],
      ['Tuấn Anh B','9A205'],['Tuấn Anh C','9A206'],['Thảo Vy','9A207'],['Thái Bảo','9A208'],
      ['Chí Bảo','9A209'],['Long Bảo','9A210'],['Bích Duyên','9A211'],['Thùy Dương','9A212'],
      ['Tuấn Đạt','9A213'],['Anh Đức','9A214'],['Đinh Huy','9A215'],['Khánh Huyền','9A216'],
      ['Thiên Hương','9A217'],['Quốc Khánh','9A218'],['Nguyên Khoa','9A219'],['Anh Kiệt','9A220'],
      ['Phương Lam','9A221'],['Vũ Lâm','9A222'],['Mưu Lâm','9A223'],['Thùy Linh','9A224'],
      ['Thảo My','9A225'],['Trọng Nhân','9A226'],['Thành Nhân','9A227'],['Linh Nhi','9A228'],
      ['Thảo Nhi','9A229'],['Kiều Oanh','9A230'],['Hoài Phong','9A231'],['Nhất Phong','9A232'],
      ['Thiên Phúc','9A233'],['Thảo Quyên','9A234'],['Công Thành','9A235'],['Diệu Thảo','9A236'],
      ['Gia Thịnh','9A237'],['Quỳnh Thy','9A238'],['Viết Thy','9A239'],['Hoàng Tiên','9A240'],
      ['Thành Trà','9A241'],['Uyên Trang','9A242'],['Ngọc Trâm A','9A243'],['Ngọc Trâm B','9A244'],
      ['Tiểu Trần','9A245'],['Minh Trí','9A246'],['Hải Triều','9A247'],['Quốc Vỹ','9A248'],
      ['Thảo Viên','9A249'],['Tương Vy','9A250'],['Thảo Vy','9A251'],['Bảo Vy','9A252'],
      ['Kiều Vy','9A253'],
    ]
  },
  {
    name: '9A4', code: 'TQD-9A4', year: 2025,
    teacher: { fullName: 'Thu Hà', username: 'thu.ha', isNew: true },
    students: [
      ['Tuấn Anh','9A401'],['Gia Bảo','9A402'],['Y Bim Niê','9A403'],['Bảo Châu','9A404'],
      ['Minh Châu','9A405'],['Ngọc Diễm','9A406'],['Tiến Dũng','9A407'],['Trùng Dương','9A408'],
      ['Y Đỗ Ni','9A409'],['Ngọc Hải','9A410'],['Ngọc Hân','9A411'],['Trung Hiếu','9A412'],
      ['Quang Hoàng','9A413'],['Hoàng Huy','9A414'],['Văn Huy','9A415'],['Khánh Huyền','9A416'],
      ['Tuấn Khải','9A417'],['Mai Khanh','9A418'],['Tuấn Kiệt','9A419'],['Anh Kiệt','9A420'],
      ['Phương Linh','9A421'],['Mỹ Linh','9A422'],['Phi Long A','9A423'],['Phi Long B','9A424'],
      ['Hữu Long','9A425'],['Trà My','9A426'],['Trà My A','9A427'],['Trà My B','9A428'],
      ['Mỹ My','9A429'],['Hiếu Nghĩa','9A430'],['Thanh Nguyên','9A431'],['Khánh Nguyên','9A432'],
      ['Thiện Nhân','9A433'],['Uyên Nhi','9A434'],['Hoàng Ny','9A435'],['Chân Phong','9A436'],
      ['Thu Phương','9A437'],['Huy Quỳnh','9A438'],['H\' Ta Ra','9A439'],['Y Thắt','9A440'],
      ['Quang Thịnh','9A441'],['Văn Thơ','9A442'],['Phương Thùy','9A443'],['Minh Thư A','9A444'],
      ['Minh Thư B','9A445'],['Anh Thư','9A446'],['Quỳnh Trâm','9A447'],['Bảo Trâm','9A448'],
      ['Anh Tuấn','9A449'],['Y Tu','9A450'],['Hà Vy','9A451'],
    ]
  },
  {
    name: '8A1', code: 'TQD-8A1', year: 2025,
    teacher: { fullName: 'Việt Phương', username: 'viet.phuong', isNew: true },
    students: [
      ['Kỳ Anh','8A101'],['Hoài Anh','8A102'],['Gia Bảo','8A103'],['Bích Châu','8A104'],
      ['Thùy Chi','8A105'],['Quỳnh Chi','8A106'],['Trí Dũng','8A107'],['Hải Đăng','8A108'],
      ['Ngọc Hân','8A109'],['Gia Hân','8A110'],['Ngọc Huân','8A111'],['Minh Huy','8A112'],
      ['Quỳnh Hương','8A113'],['H\' Ka Min','8A114'],['Phú Khang','8A115'],['Bảo Khang','8A116'],
      ['Anh Kiệt','8A117'],['Tuệ Linh','8A118'],['Thảo Ngân','8A119'],['Xuân Ngọc','8A120'],
      ['Đại Nguyên','8A121'],['Khôi Nguyên','8A122'],['Thảo Nguyên','8A123'],['Minh Nhân','8A124'],
      ['Thảo Nhu A','8A125'],['Thảo Nhu B','8A126'],['Tuyết Nhung','8A127'],['Tấn Phát','8A128'],
      ['Văn Phong','8A129'],['Nguyên Quang','8A130'],['Tiểu Quyên','8A131'],['Trung Sơn','8A132'],
      ['Phương Thảo','8A133'],['Đức Thắng','8A134'],['Bảo Thi','8A135'],['Khánh Thi','8A136'],
      ['Đức Thịnh','8A137'],['Nguyễn Thùy','8A138'],['Khánh Thu','8A139'],['Kim Thu','8A140'],
      ['Đức Tiến','8A141'],['Bảo Trâm','8A142'],['Nhà Trúc A','8A143'],['Nhà Trúc B','8A144'],
      ['Quang Tuấn','8A145'],['Minh Tuệ','8A146'],['Bảo Uyên','8A147'],['Lê Văn','8A148'],
      ['Thanh Vinh','8A149'],
    ]
  },
  {
    name: '8A6', code: 'TQD-8A6', year: 2025,
    teacher: { fullName: 'Thanh Truyền', username: 'thanh.truyen', isNew: true },
    students: [
      ['Bảo An','8A601'],['Phương Anh A','8A602'],['Phương Anh B','8A603'],['Văn Anh','8A604'],
      ['Hữu Châu','8A605'],['Ngọc Cường','8A606'],['Trường Giang','8A607'],['Gia Hân A','8A608'],
      ['Gia Hân B','8A609'],['Xuân Hiếu','8A610'],['Gia Huy','8A611'],['Gia Hy','8A612'],
      ['Y Juel','8A613'],['Bảo Khang','8A614'],['Quốc Khánh','8A615'],['Bảo Khoa','8A616'],
      ['Y Kiên','8A617'],['Y La Yan','8A618'],['Ngọc Lan','8A619'],['Y Lin','8A620'],
      ['Thúy My','8A621'],['Văn Nam','8A622'],['Kim Ngân','8A623'],['Khánh Ngân','8A624'],
      ['H\' Nghi','8A625'],['Thảo Nguyên','8A626'],['Anh Nhân','8A627'],['H\' Nhe','8A628'],
      ['Bằng Nhi','8A629'],['Hồ Nhiên','8A630'],['Y Niăm','8A631'],['Y Phiu','8A632'],
      ['Anh Phong','8A633'],['Hoàng Phong','8A634'],['Gia Phúc','8A635'],['Đăng Quỳnh','8A636'],
      ['Trung Sơn','8A637'],['Minh Thành','8A638'],['Hoàng Thành','8A639'],['H\' Thảo Anh','8A640'],
      ['Ngọc Thy','8A641'],['Quốc Toàn','8A642'],['Ngọc Trân','8A643'],['Bảo Trân','8A644'],
      ['Cẩm Tú','8A645'],['H\' Văn','8A646'],
    ]
  },
];

// ─── Chuyên gia tâm lý (Cô Hà - GVCN 8A7 được nâng cấp) ──────────────────
const PSYCHOLOGIST = {
  fullName: 'Hà Thị Mai',
  username: 'co.ha',
  role: 'PSYCHOLOGIST',
};

async function main() {
  console.log('\n🌱 Bắt đầu seed dữ liệu...\n');
  let totalStudents = 0;
  let newTeachers = 0;

  for (const cls of classes) {
    const t = cls.teacher;

    // ── Tìm hoặc tạo User giáo viên ──
    let teacherUser = await prisma.user.findUnique({ where: { username: t.username } });
    if (!teacherUser) {
      teacherUser = await prisma.user.create({
        data: {
          username: t.username,
          passwordHash: PASSWORD_HASH,
          role: 'TEACHER',
        }
      });
      await prisma.teacher.create({
        data: { userId: teacherUser.id, fullName: t.fullName }
      });
      console.log(`  ✅ Tạo giáo viên mới: ${t.fullName} (${t.username})`);
      newTeachers++;
    }

    let teacherRecord = await prisma.teacher.findUnique({ where: { userId: teacherUser.id } });

    // ── Tìm hoặc tạo lớp ──
    let classRecord = await prisma.class.findFirst({ where: { classCode: cls.code } });
    if (!classRecord) {
      classRecord = await prisma.class.create({
        data: {
          name: cls.name,
          year: cls.year,
          classCode: cls.code,
          teacherId: teacherRecord.id,
        }
      });
      console.log(`  📚 Tạo lớp: ${cls.name}`);
    }

    // ── Tạo học sinh ──
    let count = 0;
    for (const [fullName, username] of cls.students) {
      const existing = await prisma.user.findUnique({ where: { username } });
      if (existing) continue;

      const userStudent = await prisma.user.create({
        data: { username, passwordHash: PASSWORD_HASH, role: 'STUDENT' }
      });
      const student = await prisma.student.create({
        data: { userId: userStudent.id, fullName, classId: classRecord.id }
      });
      await prisma.studentProfile.create({
        data: { studentId: student.id }
      });
      count++;
    }
    console.log(`  👩‍🎓 Lớp ${cls.name}: ${count} học sinh`);
    totalStudents += count;
  }

  // ── Tạo tài khoản chuyên gia tâm lý ──
  const existingPsych = await prisma.user.findUnique({ where: { username: PSYCHOLOGIST.username } });
  if (!existingPsych) {
    const psychUser = await prisma.user.create({
      data: {
        username: PSYCHOLOGIST.username,
        passwordHash: PASSWORD_HASH,
        role: 'PSYCHOLOGIST',
      }
    });
    // Chuyên gia cũng có teacher record để có thông tin
    await prisma.teacher.create({
      data: {
        userId: psychUser.id,
        fullName: PSYCHOLOGIST.fullName,
        subject: 'Tâm lý học đường',
        avatar: '🧠',
      }
    });
    console.log(`\n  🧠 Tạo chuyên gia tâm lý: ${PSYCHOLOGIST.fullName} (${PSYCHOLOGIST.username})`);
  } else {
    // Nâng cấp role nếu cần
    if (existingPsych.role !== 'PSYCHOLOGIST') {
      await prisma.user.update({
        where: { id: existingPsych.id },
        data: { role: 'PSYCHOLOGIST' }
      });
      console.log(`\n  🧠 Nâng cấp ${PSYCHOLOGIST.username} thành PSYCHOLOGIST`);
    }
  }

  console.log(`\n✅ Hoàn thành! Tổng cộng: ${totalStudents} học sinh, ${newTeachers} giáo viên mới.`);
  console.log(`📋 Mật khẩu tất cả tài khoản: Demo@123\n`);
}

main()
  .catch(e => { console.error('Lỗi:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
