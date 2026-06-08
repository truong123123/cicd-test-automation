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

async function testLogin(page, username, password, shouldSucceed) {
  const stepName = shouldSucceed ? 'success' : 'fail';
  console.log(`\n🔑 [TEST CASE] Đăng nhập với tài khoản: ${username} | Mong muốn: ${shouldSucceed ? 'THÀNH CÔNG' : 'THẤT BẠI'}`);

  const url = 'https://sinhvien1.tlu.edu.vn/#/login';
  console.log(`🌐 Điều hướng tới ${url}...`);
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  } catch (err) {
    console.warn('⚠️ Cảnh báo: Tải trang lâu, đang tiếp tục...');
  }

  // Chờ hiển thị giao diện Angular
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Định vị các ô nhập tài khoản và mật khẩu
  await page.waitForSelector('input', { timeout: 10000 });
  const inputs = await page.$$('input');
  
  let usernameInput = null;
  let passwordInput = null;

  for (const input of inputs) {
    const type = await page.evaluate(el => el.type, input);
    const placeholder = await page.evaluate(el => el.placeholder || '', input);
    const name = await page.evaluate(el => el.name || '', input);

    if (type === 'password') {
      passwordInput = input;
    } else if (type === 'text' || placeholder.toLowerCase().includes('mã') || placeholder.toLowerCase().includes('tên') || name.toLowerCase().includes('user')) {
      if (!usernameInput) usernameInput = input;
    }
  }

  // Dự phòng nếu không tìm thấy selector cụ thể
  if (!usernameInput && inputs.length > 0) usernameInput = inputs[0];
  if (!passwordInput && inputs.length > 1) passwordInput = inputs[1];

  if (!usernameInput || !passwordInput) {
    throw new Error('❌ Không phát hiện thấy ô nhập tài khoản/mật khẩu trên trang.');
  }

  // Xóa trắng và điền thông tin
  await usernameInput.click({ clickCount: 3 });
  await page.keyboard.press('Backspace');
  await usernameInput.type(username);
  console.log(`✍️ Điền tài khoản: ${username}`);

  await passwordInput.click({ clickCount: 3 });
  await page.keyboard.press('Backspace');
  await passwordInput.type(password);
  console.log('✍️ Điền mật khẩu.');

  // Chụp hình trước khi bấm gửi
  const beforeImg = path.join(__dirname, `tlu_login_${stepName}_before.png`);
  await page.screenshot({ path: beforeImg });
  console.log(`📸 Chụp ảnh trước đăng nhập: ${beforeImg}`);

  // Nhấn Enter gửi form
  console.log('⌨️ Nhấn Enter gửi yêu cầu...');
  await page.keyboard.press('Enter');

  // Chờ phản hồi hệ thống
  await new Promise(resolve => setTimeout(resolve, 4000));

  // Chụp hình sau khi nhận phản hồi
  const afterImg = path.join(__dirname, `tlu_login_${stepName}_after.png`);
  await page.screenshot({ path: afterImg });
  console.log(`📸 Chụp ảnh kết quả phản hồi: ${afterImg}`);

  // Kiểm thử kết quả dựa trên URL hiện tại
  const currentUrl = page.url();
  console.log(`📍 URL hiện tại: ${currentUrl}`);

  if (shouldSucceed) {
    // Trường hợp Đăng nhập đúng: URL nên chuyển đổi (không còn ở trang #/login)
    if (currentUrl.includes('/login')) {
      // Xem trang có hiển thị thông báo lỗi nào không
      const errorTextVisible = await page.evaluate(() => {
        return document.body.innerText.includes('không chính xác') || 
               document.body.innerText.includes('tài khoản không tồn tại') ||
               document.body.innerText.includes('Lỗi');
      });
      if (errorTextVisible) {
        throw new Error('❌ Đăng nhập THẤT BẠI mặc dù thông tin tài khoản là ĐÚNG.');
      }
    }
    console.log('🎉 Đăng nhập THÀNH CÔNG đúng như mong muốn.');
  } else {
    // Trường hợp Đăng nhập sai: URL vẫn phải ở trang #/login
    if (!currentUrl.includes('/login')) {
      throw new Error('❌ Đăng nhập THÀNH CÔNG mặc dù mật khẩu nhập là SAI.');
    }
    console.log('🎉 Đăng nhập THẤT BẠI đúng như mong muốn (hệ thống chặn thành công).');
  }
}

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

  try {
    // TEST CASE 1: Đăng nhập SAI (Tài khoản đúng, Mật khẩu sai để kiểm tra chặn lỗi)
    await testLogin(page, '2351067118', 'wrong_password_123', false);

    // TEST CASE 2: Đăng nhập ĐÚNG (Tài khoản đúng, Mật khẩu đúng để kiểm tra thành công)
    await testLogin(page, '2351067118', '077205009740', true);

    console.log('\n🏁 [SUCCESS] Tất cả kịch bản kiểm thử TLU Login đều ĐẠT!');
  } catch (err) {
    console.error('\n❌ [FAILURE] Kịch bản kiểm thử thất bại:', err.message);
    await browser.close();
    process.exit(1);
  }

  await browser.close();
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Lỗi hệ thống:', err);
  process.exit(1);
});
