// ============================================
// 状态管理
// ============================================
const state = {
  activeTab: 'print',
  print: {
    size: 'A4',        // 纸张尺寸: A4 / A3
    color: 'bw',       // 打印类型: bw(黑白) / color(彩色)
    sides: 'single',   // 单双面: single(单面) / double(双面)
    pages: 0,          // 打印页数
    fileUploaded: false // 文件是否已上传
  }
};

// ============================================
// 开屏动画
// ============================================
const splash = document.getElementById('splash');
const splashImg = document.querySelector('.splash-img');

/**
 * 启动开屏动画
 * 动画流程: 图片放大 -> 移动到左上角 -> 淡出
 */
function startSplash() {
  if (!splash || !splashImg) return;

  // 第一阶段: 图片放大
  requestAnimationFrame(() => {
    splashImg.classList.add('zoom-in');
  });

  // 第二阶段: 2.5秒后移动到角落
  setTimeout(() => {
    splashImg.classList.add('move-to-corner');
  }, 2500);

  // 第三阶段: 4秒后动画结束
  setTimeout(() => {
    splash.classList.add('done');
  }, 4000);
}

// 页面加载完成后启动动画
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startSplash);
} else {
  startSplash();
}

// ============================================
// 导航切换
// ============================================
const navBtns = document.querySelectorAll('.nav-btn');
const mobileTabs = document.querySelectorAll('.mobile-tab');
const tabContents = document.querySelectorAll('.tab-content');

/**
 * 切换标签页
 * @param {string} tabName - 标签页名称
 */
function switchTab(tabName) {
  state.activeTab = tabName;
  
  // 更新桌面端导航按钮状态
  navBtns.forEach(btn => {
    if (btn.dataset.tab === tabName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // 更新移动端标签状态
  mobileTabs.forEach(tab => {
    const span = tab.querySelector('span');
    if (tab.dataset.tab === tabName) {
      tab.classList.add('active');
      if (span) {
        span.classList.remove('hidden');
      }
    } else {
      tab.classList.remove('active');
      if (span) {
        span.classList.add('hidden');
      }
    }
  });
  
  // 显示对应内容区域
  tabContents.forEach(content => {
    content.classList.add('hidden');
  });
  
  const activeContent = document.getElementById(`${tabName}-section`);
  if (activeContent) {
    activeContent.classList.remove('hidden');
  }
}

// 绑定导航点击事件
navBtns.forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

mobileTabs.forEach(tab => {
  tab.addEventListener('click', () => switchTab(tab.dataset.tab));
});

// ============================================
// 打印服务逻辑
// ============================================
const sizeBtns = document.querySelectorAll('.size-btn');
const colorBtns = document.querySelectorAll('.color-btn');
const sidesBtns = document.querySelectorAll('.sides-btn');
const pagesInput = document.getElementById('pages-input');
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const uploadPlaceholder = document.getElementById('upload-placeholder');
const uploadSuccess = document.getElementById('upload-success');
const uploadFilename = document.getElementById('upload-filename');
const totalPriceEl = document.getElementById('total-price');
const bwDiscountEl = document.getElementById('bw-discount');
const bwDiscountAmountEl = document.getElementById('bw-discount-amount');
const finalsDiscountEl = document.getElementById('finals-discount');
const submitOrderBtn = document.getElementById('submit-order');

// 纸张尺寸选择
sizeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    state.print.size = btn.dataset.size;
    
    // A3不支持双面打印,自动切换为单面
    if (state.print.size === 'A3') {
      state.print.sides = 'single';
    }
    
    updatePrintUI();
    calculatePrice();
  });
});

// 黑白/彩色选择
colorBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    state.print.color = btn.dataset.color;
    updatePrintUI();
    calculatePrice();
  });
});

// 单双面选择
sidesBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // A3不支持双面打印
    if (state.print.size === 'A3') return;
    state.print.sides = btn.dataset.sides;
    updatePrintUI();
    calculatePrice();
  });
});

// 页数输入
pagesInput.addEventListener('input', (e) => {
  state.print.pages = parseInt(e.target.value) || 0;
  calculatePrice();
});

// 文件选择处理
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  
  if (file) {
    // 检查文件大小 (50MB = 50 * 1024 * 1024 bytes)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('文件大小超过50MB限制，请选择更小的文件。');
      fileInput.value = '';
      return;
    }
    
    // 更新状态
    state.print.fileUploaded = true;
    
    // 显示文件名
    uploadFilename.textContent = file.name;
    
    // 切换显示状态
    uploadPlaceholder.classList.add('hidden');
    uploadSuccess.classList.remove('hidden');
    
    calculatePrice();
  }
});

// 点击已上传区域可重新选择文件
uploadSuccess.addEventListener('click', () => {
  fileInput.click();
});

/**
 * 更新打印选项UI状态
 */
function updatePrintUI() {
  // 更新尺寸按钮状态
  sizeBtns.forEach(btn => {
    if (btn.dataset.size === state.print.size) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // 更新颜色按钮状态
  colorBtns.forEach(btn => {
    if (btn.dataset.color === state.print.color) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // 更新单双面按钮状态
  sidesBtns.forEach(btn => {
    const isActive = btn.dataset.sides === state.print.sides;
    const isDisabled = state.print.size === 'A3';
    
    if (isActive) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
    
    btn.disabled = isDisabled;
  });
}

/**
 * 计算打印价格
 * 
 * 价格表:
 * A4 黑白单面: 1-10张 0.4 MOP, 11张+ 0.35 MOP
 * A4 黑白双面: 1-10张 0.7 MOP, 11张+ 0.5 MOP
 * A4 彩色单面: 1-10张 1.8 MOP, 11张+ 1.5 MOP
 * A4 彩色双面: 1-10张 3.2 MOP, 11张+ 2.8 MOP
 * A3 黑白单面: 1-10张 1.0 MOP, 11张+ 0.9 MOP
 * A3 彩色单面: 1-10张 3.8 MOP, 11张+ 3.3 MOP
 * 
 * 优惠:
 * - 黑白打印满50张,每张减0.1 MOP
 * - 期末优惠:满10张返现3 MOP
 */
function calculatePrice() {
  const { size, color, sides, pages } = state.print;
  let pricePerPage = 0;
  
  // 根据条件确定单价
  if (size === 'A4') {
    if (color === 'bw') {
      if (sides === 'single') {
        pricePerPage = pages <= 10 ? 0.4 : 0.35;
      } else {
        pricePerPage = pages <= 10 ? 0.7 : 0.5;
      }
    } else {
      if (sides === 'single') {
        pricePerPage = pages <= 10 ? 1.8 : 1.5;
      } else {
        pricePerPage = pages <= 10 ? 3.2 : 2.8;
      }
    }
  } else {
    // A3 只支持单面
    if (color === 'bw') {
      pricePerPage = pages <= 10 ? 1.0 : 0.9;
    } else {
      pricePerPage = pages <= 10 ? 3.8 : 3.3;
    }
  }
  
  // 计算总价
  let total = pricePerPage * pages;
  
  // 优惠1: 黑白打印满50张,每张减0.1 MOP
  let bwDiscount = 0;
  if (color === 'bw' && pages >= 50) {
    bwDiscount = pages * 0.1;
    total -= bwDiscount;
  }
  
  // 优惠2: 期末月特惠,满10张返现3 MOP
  let cashback = 0;
  if (pages >= 10) {
    cashback = 3;
  }
  
  total = Math.max(0, total);
  
  // 更新价格显示
  totalPriceEl.textContent = total.toFixed(2);
  
  // 显示/隐藏优惠信息
  if (color === 'bw' && pages >= 50) {
    bwDiscountEl.classList.remove('hidden');
    bwDiscountAmountEl.textContent = `- ${bwDiscount.toFixed(2)} MOP`;
  } else {
    bwDiscountEl.classList.add('hidden');
  }
  
  if (pages >= 10) {
    finalsDiscountEl.classList.remove('hidden');
  } else {
    finalsDiscountEl.classList.add('hidden');
  }
  
  // 控制提交按钮状态:需要页数>0且已上传文件
  submitOrderBtn.disabled = pages === 0 || !state.print.fileUploaded;
}

// 提交订单
submitOrderBtn.addEventListener('click', () => {
  alert('打印订单已提交！我们会尽快处理您的订单。');
});

// ============================================
// 初始化
// ============================================
updatePrintUI();
calculatePrice();

// ============================================
// 平滑滚动
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
});

// ============================================
// 滚动动画效果
// ============================================
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// 为服务卡片和套餐卡片添加滚动动画
document.querySelectorAll('.service-card, .package-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
  observer.observe(el);
});
