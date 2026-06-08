const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Common installation paths for Google Chrome on Windows
const chromePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'),
];

const getChromePath = () => {
  for (const p of chromePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return null;
};

async function run() {
  const isCI = process.env.CI === 'true';
  let launchOptions = {};

  if (isCI) {
    console.log('☁️ Đang chạy trên GitHub Actions (CI Mode)...');
    launchOptions = {
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    };
  } else {
    const chromePath = getChromePath();
    if (!chromePath) {
      console.error('❌ Không tìm thấy Google Chrome cài đặt trên hệ thống của bạn.');
      console.error('Vui lòng cài đặt Google Chrome để chạy kiểm thử này.');
      process.exit(1);
    }
    console.log(`🚀 Đang khởi chạy Chrome từ: ${chromePath}...`);
    launchOptions = {
      executablePath: chromePath,
      headless: false,
      defaultViewport: { width: 1280, height: 800 },
    };
  }

  const browser = await puppeteer.launch(launchOptions);

  const page = await browser.newPage();
  const url = 'https://sinhvien1.tlu.edu.vn/#/login';
  
  console.log(`🌐 Đang điều hướng tới: ${url}...`);
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  } catch (gotoErr) {
    console.warn('⚠️ Cảnh báo: Trang tải lâu hoặc không thể dùng networkidle2. Đang thử tiếp tục...');
  }

  // Chờ 2 giây để chắc chắn các thành phần Angular/React được hiển thị
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Chụp ảnh màn hình trang đăng nhập ban đầu
  const initialScreenshot = path.join(__dirname, 'tlu_login_initial.png');
  await page.screenshot({ path: initialScreenshot });
  console.log(`📸 Đã chụp ảnh màn hình giao diện ban đầu: ${initialScreenshot}`);

  console.log('✍️ Đang dò tìm và điền thông tin đăng nhập thử nghiệm...');
  
  try {
    // Chờ selector ô nhập tài khoản (thường là thẻ input)
    // Tự động tìm ô nhập có placeholder hoặc thuộc tính phù hợp
    await page.waitForSelector('input', { timeout: 10000 });
    
    // Tìm các thẻ input trên trang
    const inputs = await page.$$('input');
    console.log(`🔍 Tìm thấy ${inputs.length} ô nhập liệu.`);

    let usernameInput = null;
    let passwordInput = null;

    for (const input of inputs) {
      const type = await page.evaluate(el => el.type, input);
      const placeholder = await page.evaluate(el => el.placeholder || '', input);
      const name = await page.evaluate(el => el.name || '', input);

      if (type === 'password') {
        passwordInput = input;
      } else if (type === 'text' || placeholder.toLowerCase().includes('mã') || placeholder.toLowerCase().includes('tên') || name.toLowerCase().includes('user')) {
        if (!usernameInput) usernameInput = input; // Lấy ô text đầu tiên hoặc ô khớp
      }
    }

    if (!usernameInput && inputs.length > 0) {
      usernameInput = inputs[0]; // Dự phòng lấy ô đầu tiên
    }
    if (!passwordInput && inputs.length > 1) {
      passwordInput = inputs[1]; // Dự phòng lấy ô thứ hai
    }

    if (usernameInput && passwordInput) {
      // Click và nhập liệu
      await usernameInput.click({ clickCount: 3 });
      await usernameInput.type('123456789'); // Tài khoản giả lập
      console.log('✅ Đã điền mã sinh viên giả lập: 123456789');

      await passwordInput.click({ clickCount: 3 });
      await passwordInput.type('wrong_password_test'); // Mật khẩu giả lập
      console.log('✅ Đã điền mật khẩu giả lập.');

      // Nhấn Enter để gửi biểu mẫu
      console.log('⌨️ Đang gửi biểu mẫu bằng cách nhấn Enter...');
      await page.keyboard.press('Enter');

      // Chờ 4 giây để hệ thống kiểm tra và hiển thị thông báo lỗi đăng nhập
      await new Promise(resolve => setTimeout(resolve, 4000));

      // Chụp ảnh kết quả hiển thị (thông báo lỗi, v.v.)
      const resultScreenshot = path.join(__dirname, 'tlu_login_result.png');
      await page.screenshot({ path: resultScreenshot });
      console.log(`📸 Đã chụp ảnh màn hình kết quả: ${resultScreenshot}`);
    } else {
      console.error('❌ Không tìm thấy đầy đủ ô nhập tài khoản và mật khẩu.');
    }

  } catch (err) {
    console.error('❌ Có lỗi xảy ra trong quá trình điền thông tin hoặc click:', err.message);
  }

  console.log('🔌 Đang đóng trình duyệt...');
  await browser.close();
  console.log('🏁 Hoàn thành kiểm thử!');
}

run().catch(err => {
  console.error('❌ Lỗi thực thi kịch bản:', err);
});
