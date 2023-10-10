function openSettings() {
    const settings = document.getElementById('settings');
    settings.classList.toggle('hidden');
  }
  
  function applySettings() {
    const titleInput = document.getElementById('title');
    const logoInput = document.getElementById('logo');
    const title = titleInput.value;
    const logo = logoInput.value;
    document.title = title;
    const logoImg = document.querySelector('.topnavbuttons img');
    logoImg.src = logo;
    localStorage.setItem('tabTitle', title);
    openSettings();
  }
  
  function loadSettings() {
    const tabTitle = localStorage.getItem('tabTitle');
    if (tabTitle) {
      document.title = tabTitle;
    }
  }
  
  loadSettings();