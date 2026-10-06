"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
const CLASSES = [
    // ═══ LỚP 9A1 — GVCN: Trần Thị Tiên ═══
    {
        className: '9A1',
        classCode: 'LBT15-9A1-TQD',
        teacherName: 'Trần Thị Tiên',
        teacherUsername: 'tranthi.tien',
        students: [
            { name: 'Lê Ngọc Bảo An', maHS: '50952581' },
            { name: 'Lê Ngọc Châu Anh', maHS: '50952559' },
            { name: 'Võ Quý Anh', maHS: '50952556' },
            { name: 'Nguyễn Thị Ngọc Ánh', maHS: '50952569' },
            { name: 'Trần Gia Bảo', maHS: '50952572' },
            { name: 'Cao Nguyễn Bảo Châu', maHS: '50952565' },
            { name: 'Nguyễn Ngọc Bảo Châu', maHS: '50952571' },
            { name: 'Trần Võ Khánh Chi', maHS: '50952574' },
            { name: 'Du Chí Cường', maHS: '50952583' },
            { name: 'Đoàn Quốc Cường', maHS: '50952523' },
            { name: 'Võ Văn Danh', maHS: '50952591' },
            { name: 'Dương Tuấn Tú', maHS: '50952551' },
            { name: 'Lâm Hoàng Giang', maHS: '50952604' },
            { name: 'Bùi Thị Mạnh Hằng', maHS: '50952545' },
            { name: 'Lê Gia Hân', maHS: '50952545' },
            { name: 'H\'Huế Niê', maHS: '50952555' },
            { name: 'Bồi Quang Huy', maHS: '50952583' },
            { name: 'Nguyễn Gia Huy', maHS: '50952561' },
            { name: 'Trịnh Nhật Huy', maHS: '50952579' },
            { name: 'Lê Ngọc Huyền', maHS: '50952792' },
            { name: 'Phạm Thị Diệu Huyền', maHS: '50952548' },
            { name: 'Nguyễn Trọng Nguyên Khang', maHS: '50952560' },
            { name: 'Phạm Gia Khiêm', maHS: '50952588' },
            { name: 'Đặng Lê Gia Khôi', maHS: '50952580' },
            { name: 'Phạm Ngọc Minh Khôi', maHS: '53893302' },
            { name: 'Trần Gia Long', maHS: '53797949' },
            { name: 'Trương Quốc Mạnh', maHS: '50952578' },
            { name: 'Lê Hoàng Trà My', maHS: '50952604' },
            { name: 'Trần Hoàng My', maHS: '50952577' },
            { name: 'Trần Ngọc Diễm My', maHS: '50952573' },
            { name: 'Lê Thị Ny Na', maHS: '50952821' },
            { name: 'Lê Nhật Nam', maHS: '50952578' },
            { name: 'Lê Nguyễn Bảo Ngọc', maHS: '50952554' },
            { name: 'Trần Hoàng Bảo Ngọc', maHS: '50952587' },
            { name: 'Nguyễn Võ Thảo Nguyên', maHS: '50952388' },
            { name: 'Võ Ánh Nguyên', maHS: '50952567' },
            { name: 'Trần Thị Yên Nhi', maHS: '50952791' },
            { name: 'Cao Chính Pháp', maHS: '50952544' },
            { name: 'Hoàng Bảo Phong', maHS: '50952568' },
            { name: 'Trần Thái Nhật Quang', maHS: '50952547' },
            { name: 'Trần Võ Anh Quân', maHS: '50952550' },
            { name: 'Đoàn Thị Tú Quyên', maHS: '50952789' },
            { name: 'Nguyễn Ngọc Anh Thy', maHS: '50952574' },
            { name: 'Đoàn Công Tín', maHS: '50952590' },
            { name: 'Vũ Bùi Phương Trang', maHS: '50952552' },
            { name: 'Trần Quỳnh Trâm', maHS: '50952582' },
            { name: 'Nguyễn Thế Triều', maHS: '50952570' },
            { name: 'Đoạn Phạm Tổ Uyên', maHS: '50952546' },
            { name: 'Nguyễn Cao Thục Uyên', maHS: '50952566' },
            { name: 'HỒ NGỌC NHƯY', maHS: '51024381' },
            { name: 'Nguyễn Ngọc Như Ý', maHS: '50952575' },
        ],
    },
    // ═══ LỚP 9A2 — GVCN: Trần Thị Nguyệt ═══
    {
        className: '9A2',
        classCode: 'LBT15-9A2',
        teacherName: 'Trần Thị Nguyệt',
        teacherUsername: 'tranthi.nguyet',
        students: [
            { name: 'Mai Cát Anh', maHS: '50952599' },
            { name: 'Nguyễn Thị Phương Anh', maHS: '51130220' },
            { name: 'Phạm Bảo Anh', maHS: '50952595' },
            { name: 'Phạm Tuấn Anh', maHS: '50989067' },
            { name: 'Trần Tuấn Anh', maHS: '50952616' },
            { name: 'Trần Viết Tuấn Anh', maHS: '50952813' },
            { name: 'E Ban Lê Thảo Vy', maHS: '50952605' },
            { name: 'Ngô Thái Bảo', maHS: '50952787' },
            { name: 'Trần Văn Chí Bảo', maHS: '50952628' },
            { name: 'Vân Hữu Long Bảo', maHS: '50952627' },
            { name: 'Trần Thị Bích Duyên', maHS: '50952596' },
            { name: 'Nguyễn Ngọc Thùy Dương', maHS: '50952603' },
            { name: 'Nguyễn Tuấn Đạt', maHS: '50952818' },
            { name: 'Nguyễn Anh Đức', maHS: '50952608' },
            { name: 'Lương Đình Huy', maHS: '50952783' },
            { name: 'Hồ Khánh Huyền', maHS: '50952615' },
            { name: 'Cao Ngọc Thiên Hương', maHS: '50952782' },
            { name: 'Nguyễn Quốc Khánh', maHS: '50952620' },
            { name: 'Bùi Nguyễn Khoa', maHS: '50952619' },
            { name: 'Trần Anh Kiệt', maHS: '50952634' },
            { name: 'Nguyễn Hoàng Phương Lam', maHS: '50952609' },
            { name: 'Lại Vũ Lâm', maHS: '50952610' },
            { name: 'Trương Mẫu Lâm', maHS: '50952611' },
            { name: 'Phan Lê Thùy Linh', maHS: '50952609' },
            { name: 'Phạm Ngọc Thảo My', maHS: '50952817' },
            { name: 'Nguyễn Trọng Nhân', maHS: '50952601' },
            { name: 'Trần Thành Nhân', maHS: '50952633' },
            { name: 'Dương Ngọc Linh Nhi', maHS: '50952622' },
            { name: 'Nguyễn Thảo Nhi', maHS: '50952595' },
            { name: 'Nguyễn Kiều Oanh', maHS: '50952607' },
            { name: 'Nguyễn Phan Hoài Phong', maHS: '50952592' },
            { name: 'Phạm Viết Nhật Phong', maHS: '50952632' },
            { name: 'Nguyễn Thiện Phúc', maHS: '50952626' },
            { name: 'Nguyễn Lê Thảo Quyên', maHS: '50952443' },
            { name: 'Nguyễn Công Thành', maHS: '53797945' },
            { name: 'Hồ Diệu Thảo', maHS: '50952614' },
            { name: 'Đoàn Vũ Gia Thịnh', maHS: '50952635' },
            { name: 'Nguyễn Lê Quỳnh Thy', maHS: '50952637' },
            { name: 'Phạm Việt Thy', maHS: '50952643' },
            { name: 'Phạm Khánh Hoàng Tiên', maHS: '50952612' },
            { name: 'Đoàn Thị Thanh Trà', maHS: '50952612' },
            { name: 'Trần Nguyễn Uyên Trang', maHS: '50952598' },
            { name: 'Trần Nguyễn Ngọc Trâm', maHS: '50952640' },
            { name: 'Vũ Thị Ngọc Trâm', maHS: '50952642' },
            { name: 'Trần Thị Tiên Triền', maHS: '50952619' },
            { name: 'Trương Minh Trí', maHS: '50952636' },
            { name: 'Cao Thị Hải Triều', maHS: '50952604' },
            { name: 'Đoàn Quốc Vũ', maHS: '50952602' },
            { name: 'Lê Thảo Việt', maHS: '50952797' },
            { name: 'Hoàng Nguyễn Tường Vy', maHS: '50952624' },
            { name: 'Hồ Phạm Thảo Vy', maHS: '50952625' },
            { name: 'Nguyễn Đỗ Bảo Vy', maHS: '50952593' },
            { name: 'Nguyễn Phan Kiều Vy', maHS: '50952623' },
        ],
    },
    // ═══ LỚP 9A4 — GVCN: Hồ Thị Thu Hải ═══
    {
        className: '9A4',
        classCode: 'LBT15-9A4',
        teacherName: 'Hồ Thị Thu Hải',
        teacherUsername: 'hothi.thuhai',
        students: [
            { name: 'Nguyễn Tuấn Anh', maHS: '50952693' },
            { name: 'Huỳnh Ngọc Gia Bảo', maHS: '50952734' },
            { name: 'Y Bim Niê Kdăm', maHS: '50952722' },
            { name: 'Lê Nhật Bách Chinh', maHS: '50952710' },
            { name: 'Trần Ngọc Minh Châu', maHS: '53885309' },
            { name: 'Nguyễn Ngọc Diễm', maHS: '50952713' },
            { name: 'Phan Tiến Dũng', maHS: '55520419' },
            { name: 'Dương Trùng Dương', maHS: '50952732' },
            { name: 'Y Đôi Niê Êban', maHS: '50952733' },
            { name: 'Hoàng Thị Ngọc Hải', maHS: '50952643' },
            { name: 'Đỗ Thị Ngọc Hân', maHS: '50952692' },
            { name: 'Huỳnh Nguyễn Trung Hiếu', maHS: '50952725' },
            { name: 'Nguyễn Quang Hoàng', maHS: '50952694' },
            { name: 'Nguyễn Hoàng Huy', maHS: '50952715' },
            { name: 'Phạm Văn Huy', maHS: '50952702' },
            { name: 'Hồ Thị Khánh Huyền', maHS: '50952720' },
            { name: 'Trần Tuấn Khải', maHS: '50952781' },
            { name: 'Nguyễn Trần Mai Khanh', maHS: '50952690' },
            { name: 'Nguyễn Phan Tuấn Kiệt', maHS: '50952718' },
            { name: 'Phan Thanh Anh Kiệt', maHS: '50952709' },
            { name: 'Đặng Phương Linh', maHS: '50952705' },
            { name: 'Huỳnh Thị Mỹ Linh', maHS: '50952696' },
            { name: 'Hoàng Lê Phi Long', maHS: '50952722' },
            { name: 'Pham Phi Long', maHS: '50952801' },
            { name: 'Trịnh Lê Hữu Long', maHS: '50952800' },
            { name: 'Đỗ Trà My', maHS: '50952703' },
            { name: 'Nguyễn Trà My', maHS: '50952699' },
            { name: 'Nguyễn Trà My', maHS: '50952729' },
            { name: 'Trần Mỹ Mỹ', maHS: '50952721' },
            { name: 'Đỗ Hữu Nghĩa', maHS: '50952711' },
            { name: 'Nguyễn Thành Nguyên', maHS: '50952731' },
            { name: 'Phan Khánh Nguyên', maHS: '50952717' },
            { name: 'Phạm Thiên Nhân', maHS: '50952719' },
            { name: 'Vũ Lê Uyên Nhi', maHS: '50952686' },
            { name: 'Lê Võ Hoàng Ny', maHS: '50952728' },
            { name: 'Nguyễn Mai Chân Phong', maHS: '50952701' },
            { name: 'Hà Thị Thu Phương', maHS: '50952712' },
            { name: 'Nguyễn Huy Quỳnh', maHS: '50952706' },
            { name: 'H\'Tà Ra Êban', maHS: '50952699' },
            { name: 'Y Thái Êban', maHS: '50952714' },
            { name: 'Lâm Quang Thịnh', maHS: '50952695' },
            { name: 'Nguyễn Văn Thọ', maHS: '66043117' },
            { name: 'Hồ Phương Thùy', maHS: '50952697' },
            { name: 'Lê Minh Thư', maHS: '50952724' },
            { name: 'Nguyễn Minh Thư', maHS: '50952698' },
            { name: 'Võ Ánh Thư', maHS: '50952700' },
            { name: 'Lê Hoàng Quỳnh Trâm', maHS: '50952691' },
            { name: 'Trần Thị Bảo Trâm', maHS: '50952708' },
            { name: 'Phạm Nguyệt Anh Tuấn', maHS: '50952707' },
            { name: 'Y Tư Êban', maHS: '50952716' },
            { name: 'Dương Hà Vy', maHS: '50952723' },
        ],
    },
    // ═══ LỚP 9A6 — GVCN: Phạm Thị Nga ═══
    {
        className: '9A6',
        classCode: 'LBT15-9A6',
        teacherName: 'Phạm Thị Nga',
        teacherUsername: 'phamthi.nga',
        students: [
            { name: 'Nguyễn Hoài Anh', maHS: '50952847' },
            { name: 'Đinh Quốc Bảo', maHS: '50952830' },
            { name: 'H\'Hảo Adrông', maHS: '50952863' },
            { name: 'Cao Huy Gia Bình', maHS: '50952860' },
            { name: 'Y Chân Êban', maHS: '50952857' },
            { name: 'Nguyễn Ngọc Duy', maHS: '50952864' },
            { name: 'H\'Đoem Ênuôl', maHS: '50952794' },
            { name: 'H\'Dzuiñ Ênuôl', maHS: '50952824' },
            { name: 'Văn Đức Hải Đăng', maHS: '50952867' },
            { name: 'Ngô Gia Hân', maHS: '50952808' },
            { name: 'Y Hiệp Êban', maHS: '50952858' },
            { name: 'Nguyễn Quốc Huy', maHS: '50952833' },
            { name: 'Nã Khánh Hoàng Việt', maHS: '50952835' },
            { name: 'Y Khiêm Adrông', maHS: '50952861' },
            { name: 'Nguyễn Minh Khôi', maHS: '50952837' },
            { name: 'Nguyễn Thị Thanh Khuê', maHS: '50952832' },
            { name: 'Y Khum Mlô', maHS: '50952842' },
            { name: 'Võ Tuấn Kiệt', maHS: '50952815' },
            { name: 'H\'Linh Đan Niê', maHS: '50952818' },
            { name: 'Phan Ngọc Long', maHS: '50952803' },
            { name: 'Phạm Tấn Lộc', maHS: '50952793' },
            { name: 'Nguyễn Thị Trà My', maHS: '52514442' },
            { name: 'Y Nạm Mlô', maHS: '50952834' },
            { name: 'Nguyễn Lê Xuân Nhi', maHS: '50952839' },
            { name: 'Võ Hoàng Quỳnh Như', maHS: '50952805' },
            { name: 'Hồ Thị Yên Ny', maHS: '50952828' },
            { name: 'Phạm Gia Phát', maHS: '50952827' },
            { name: 'Phạm Thành Phát', maHS: '50952826' },
            { name: 'Đỗ Uy Phong', maHS: '50952825' },
            { name: 'Lê Nguyễn Chấn Phong', maHS: '50952849' },
            { name: 'H\'Phơi Êban', maHS: '50952862' },
            { name: 'Bùi Phạm Ngọc Phúc', maHS: '50952856' },
            { name: 'Phạm Thị Hà Phương', maHS: '50952796' },
            { name: 'Đỗ Minh Quân', maHS: '50952846' },
            { name: 'Vân Thị Diễm Quỳnh', maHS: '50952853' },
            { name: 'Trương Triều Sang', maHS: '50952865' },
            { name: 'Phạm Thị Thu Thảo', maHS: '50952780' },
            { name: 'Phạm Trung Thiện', maHS: '50952831' },
            { name: 'H\'Thu Niê', maHS: '51344288' },
            { name: 'H\'Thuận Kến', maHS: '50952836' },
            { name: 'Y Thuật Êban', maHS: '50952841' },
            { name: 'Trần Nguyễn Anh Thư', maHS: '50952859' },
            { name: 'Vân Thị Thùy Tiên', maHS: '50952866' },
            { name: 'H\'Tra Êban', maHS: '50952838' },
            { name: 'H\'Tra Êban 2', maHS: '50952843' },
            { name: 'H\'Tramy Byã', maHS: '50952844' },
            { name: 'H\'Triều Êban', maHS: '50952797' },
            { name: 'Châu Minh Trang', maHS: '50952854' },
            { name: 'Võ Lê Văn Trung', maHS: '50952850' },
            { name: 'Hồ Phúc Viên', maHS: '51353728' },
            { name: 'Vũ Thị Thảo Vy', maHS: '50952851' },
            { name: 'Trần Hưng Việt', maHS: '50952812' },
        ],
    },
    // ═══ LỚP 9A7 — GVCN: Nguyễn Thị Châu Thảo ═══
    {
        className: '9A7',
        classCode: 'LBT15-9A7',
        teacherName: 'Nguyễn Thị Châu Thảo',
        teacherUsername: 'nguyenthi.chauthao',
        students: [
            { name: 'Nguyễn Trần Văn Anh', maHS: '50952909' },
            { name: 'Phạm Thị Quỳnh Anh', maHS: '50952895' },
            { name: 'Trần Phương Anh', maHS: '53191529' },
            { name: 'Mai Cao Khả Di', maHS: '50952887' },
            { name: 'Phạm Tố Diễm', maHS: '50952892' },
            { name: 'Y Thục A Drơng', maHS: '50952912' },
            { name: 'Y Endrô Niê', maHS: '50952885' },
            { name: 'Nguyễn Đức Hiếu', maHS: '50952910' },
            { name: 'Dương Chí Huy', maHS: '50880088' },
            { name: 'Lương Quang Khải', maHS: '50952874' },
            { name: 'Ngô Lê Hoàng Khải', maHS: '50952875' },
            { name: 'Trần Minh Khang', maHS: '50952875' },
            { name: 'Trần Nguyên Khôi', maHS: '50952790' },
            { name: 'Trịnh Anh Khôi', maHS: '51085292' },
            { name: 'Võ Văn Kiệt', maHS: '50952816' },
            { name: 'Mai Xuân Quỳnh Lam', maHS: '50952896' },
            { name: 'Nguyễn Ngọc Phương Linh', maHS: '66043517' },
            { name: 'Ngô Gia Long', maHS: '50952901' },
            { name: 'Tú Minh Long', maHS: '66043517' },
            { name: 'Nguyễn Đức Lợi', maHS: '50952898' },
            { name: 'Hoàng Đức Trọng Luân', maHS: '50952904' },
            { name: 'Nguyễn Thị Trà My', maHS: '66043517' },
            { name: 'Nguyễn Thị Quỳnh Nga', maHS: '50952899' },
            { name: 'Kim Khôi Nguyên', maHS: '50952914' },
            { name: 'Đặng Thị Phương Nhi', maHS: '50952900' },
            { name: 'Lê Nguyễn Thùy Nhi', maHS: '50952876' },
            { name: 'Nguyễn Văn Phát', maHS: '50952871' },
            { name: 'Nguyễn Thành Phong', maHS: '50952872' },
            { name: 'Trần Quang Quá', maHS: '50952881' },
            { name: 'Nguyễn Ngọc Bảo Quyên', maHS: '50952907' },
            { name: 'Trần Trúc Quyên', maHS: '50952817' },
            { name: 'Nguyễn Thị Như Quỳnh', maHS: '50952883' },
            { name: 'H\'Suly Mlô', maHS: '50952882' },
            { name: 'Y Tân Ê Đuô', maHS: '50952866' },
            { name: 'Nguyễn Quý Ngọc Hoàng Thiên', maHS: '50952804' },
            { name: 'Hồ Công Thịnh', maHS: '50952897' },
            { name: 'Nguyễn Thị Thu Thủy', maHS: '52020867' },
            { name: 'Y Thức Ê Ban', maHS: '50952870' },
            { name: 'Võ Thị Hoài Thương', maHS: '51010901' },
            { name: 'Lê Thảo Thy', maHS: '50952880' },
            { name: 'Y Triệc Byã', maHS: '50952886' },
            { name: 'Lê Hoài Bảo Trâm', maHS: '50952877' },
            { name: 'Vũ Thị Bảo Trâm', maHS: '50952820' },
            { name: 'Nguyễn Ngọc Bảo Trân', maHS: '50952878' },
            { name: 'Mầu Thị Bùi Diễm Trúc', maHS: '50952795' },
            { name: 'Phạm Nhật Trường', maHS: '50952906' },
            { name: 'Bùi Anh Tú', maHS: '50952899' },
            { name: 'Bồ Quang Anh Tuấn', maHS: '50952873' },
            { name: 'Đinh Ngọc Viên', maHS: '50952902' },
            { name: 'Y Vĩnh Êban', maHS: '50952905' },
            { name: 'Trịnh Thị Bảo Vy', maHS: '50952908' },
            { name: 'Nguyễn Đỗ Bảo Yên', maHS: '50952903' },
            { name: 'H\'Za Liên Adrông', maHS: '50952814' },
        ],
    },
];
async function main() {
    console.log('🌱 Bắt đầu tạo tài khoản cho 5 lớp thực tế...');
    const demoHash = await bcryptjs_1.default.hash('Demo@123', 10);
    let totalStudents = 0;
    let totalTeachers = 0;
    for (const cls of CLASSES) {
        console.log(`\n📚 === Lớp ${cls.className} — GVCN: ${cls.teacherName} ===`);
        // --- Tạo tài khoản giáo viên ---
        const existingTeacherUser = await prisma.user.findUnique({ where: { username: cls.teacherUsername } });
        let teacher;
        if (existingTeacherUser) {
            teacher = await prisma.teacher.findUnique({ where: { userId: existingTeacherUser.id } });
            console.log(`  ✅ Giáo viên ${cls.teacherName} đã tồn tại (${cls.teacherUsername})`);
        }
        else {
            const teacherUser = await prisma.user.create({
                data: { username: cls.teacherUsername, passwordHash: demoHash, role: 'TEACHER' }
            });
            teacher = await prisma.teacher.create({
                data: { userId: teacherUser.id, fullName: cls.teacherName, subject: 'Chủ nhiệm', avatar: '👩‍🏫' }
            });
            totalTeachers++;
            console.log(`  👩‍🏫 Tạo GV: ${cls.teacherName} → đăng nhập: ${cls.teacherUsername}`);
        }
        // --- Tạo lớp ---
        const existingClass = await prisma.class.findUnique({ where: { classCode: cls.classCode } });
        let classRecord;
        if (existingClass) {
            classRecord = existingClass;
            console.log(`  ✅ Lớp ${cls.className} đã tồn tại (${cls.classCode})`);
        }
        else {
            classRecord = await prisma.class.create({
                data: {
                    name: cls.className,
                    year: 2025,
                    classCode: cls.classCode,
                    teacherId: teacher.id,
                }
            });
            console.log(`  🏫 Tạo lớp: ${cls.className} — Mã: ${cls.classCode}`);
        }
        // --- Tạo tài khoản học sinh ---
        let count = 0;
        for (const s of cls.students) {
            const username = s.maHS;
            const existing = await prisma.user.findUnique({ where: { username } });
            if (existing) {
                // Cập nhật lớp nếu chưa có
                const st = await prisma.student.findUnique({ where: { userId: existing.id } });
                if (st && !st.classId) {
                    await prisma.student.update({ where: { id: st.id }, data: { classId: classRecord.id } });
                }
                continue;
            }
            const user = await prisma.user.create({
                data: { username, passwordHash: demoHash, role: 'STUDENT' }
            });
            const student = await prisma.student.create({
                data: {
                    userId: user.id,
                    fullName: s.name,
                    classId: classRecord.id,
                    avatar: '🌱',
                }
            });
            await prisma.studentProfile.create({
                data: {
                    studentId: student.id,
                    xp: 0,
                    level: 1,
                    streak: 0,
                }
            });
            // Thông báo chào mừng
            await prisma.notification.create({
                data: {
                    userId: user.id,
                    type: 'WELCOME',
                    title: '🌱 Chào mừng đến với La Bàn Tuổi 15!',
                    content: `Chào ${s.name}! Hành trình khám phá bản thân bắt đầu từ đây. 🧭`,
                }
            });
            count++;
        }
        totalStudents += count;
        console.log(`  📋 Tạo ${count} tài khoản học sinh cho lớp ${cls.className}`);
    }
    console.log(`\n════════════════════════════════════════`);
    console.log(`✅ HOÀN TẤT!`);
    console.log(`   👩‍🏫 ${totalTeachers} giáo viên mới`);
    console.log(`   👨‍🎓 ${totalStudents} học sinh mới`);
    console.log(`\n📋 THÔNG TIN ĐĂNG NHẬP:`);
    console.log(`   Mật khẩu chung: Demo@123`);
    console.log(`   Giáo viên đăng nhập bằng tên (ví dụ: tranthi.tien)`);
    console.log(`   Học sinh đăng nhập bằng mã HS (ví dụ: 50952581)`);
    console.log(`════════════════════════════════════════\n`);
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
