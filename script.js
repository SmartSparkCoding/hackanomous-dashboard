// Single-file SPA: left sidebar, square pfp, no logo text, white background.
// Projects and shop items open a details modal. Background image helper included.

(() => {
  const state = {
    user: { id: 1, name: 'Jacob', points: 1240, pfpInitial: 'J' },
    projects: [
      { id: 1, title: 'Hack Club Site', description: 'Club website redesign with new theme and pages.', status: 'active', points_earned: 120, details: 'Full redesign, responsive layout, CMS integration.' },
      { id: 2, title: 'Robotics', description: 'Autonomous rover for competitions.', status: 'active', points_earned: 80, details: 'Chassis, sensors, PID control, ROS integration.' },
      { id: 3, title: 'AI Tutor', description: 'Study helper using ML.', status: 'archived', points_earned: 40, details: 'Prototype chatbot, dataset curation, evaluation.' }
    ],
    shop: [
      { id: 1, name: 'Sticker Pack', description: 'Vinyl stickers', cost_points: 100, stock: 50, more_info: 'High-quality vinyl stickers, weatherproof.' },
      { id: 2, name: 'T-Shirt', description: 'Club tee', cost_points: 500, stock: 10, more_info: 'Cotton tee, sizes S-XL.' },
      { id: 3, name: 'Laptop Sticker', description: 'Large sticker', cost_points: 200, stock: 20, more_info: 'Waterproof, matte finish.' }
    ],
    announcements: [
      { id: 1, title: 'Welcome to the club', body: 'Launch day! Join the kickoff.', created_at: new Date().toISOString() },
      { id: 2, title: 'Hack Night', body: 'Weekly hack night on Friday at 18:00.', created_at: new Date().toISOString() }
    ],
    orders: []
  };

  // DOM refs
  const pageContent = document.getElementById('pageContent');
  const sidebar = document.getElementById('sidebar');
  const profileNameEl = document.getElementById('profileName');
  const profilePointsEl = document.getElementById('profilePoints');
  const pfpEl = document.getElementById('pfp');
  const modal = document.getElementById('modal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalPanel = document.getElementById('modalPanel');
  const modalContent = document.getElementById('modalContent');
  const modalClose = document.getElementById('modalClose');

  // Templates
  const tpl = {
    dashboard: document.getElementById('dashboardTpl').content,
    projects: document.getElementById('projectsTpl').content,
    shop: document.getElementById('shopTpl').content,
    explore: document.getElementById('exploreTpl').content
  };

  // Background helper: setBackgroundImage(path, opacity)
  function setBackgroundImage(path, opacity = 0.08) {
    if (!path) {
      document.documentElement.style.removeProperty('--bg-image');
      document.documentElement.style.removeProperty('--bg-image-opacity');
      return;
    }
    // Use a safe CSS url value; if path contains single quotes, escape them
    const safePath = String(path).replace(/'/g, "\\'");
    document.documentElement.style.setProperty('--bg-image', `url('${safePath}')`);
    document.documentElement.style.setProperty('--bg-image-opacity', String(opacity));
  }

  // Initialize default background to hackanomous-bkg.png (same folder)
  setBackgroundImage('hackanomous-bkg.png', 0.08);

  // Init
  function init() {
    renderSidebar();
    updateProfileUI();
    attachSidebarNav();
    navigate('dashboard');
    attachModalHandlers();
    document.getElementById('logoutBtn').addEventListener('click', () => alert('Logged out (demo).'));
  }

  function renderSidebar() {
    pfpEl.textContent = state.user.pfpInitial || state.user.name[0] || 'U';
    profileNameEl.textContent = state.user.name;
    profilePointsEl.textContent = state.user.points;
  }

  function attachSidebarNav() {
    sidebar.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const route = btn.getAttribute('data-route');
        navigate(route);
      });
    });
  }

  function navigate(route) {
    pageContent.innerHTML = '';
    if (!tpl[route]) route = 'dashboard';
    const clone = tpl[route].cloneNode(true);
    pageContent.appendChild(clone);
    if (route === 'dashboard') renderDashboard();
    if (route === 'projects') renderProjects();
    if (route === 'shop') renderShop();
    if (route === 'explore') renderExplore();
    highlightNav(route);
    pageContent.querySelector('.page')?.focus();
  }

  function highlightNav(route) {
    sidebar.querySelectorAll('.nav-item').forEach(n => {
      n.classList.toggle('active', n.getAttribute('data-route') === route);
      if (n.getAttribute('data-route') === route) n.setAttribute('aria-current', 'page');
      else n.removeAttribute('aria-current');
    });
  }

  // Dashboard
  function renderDashboard() {
    const preview = document.getElementById('projectsPreview');
    preview.innerHTML = '';
    state.projects.slice(0, 4).forEach(p => {
      const el = createProjectPreview(p);
      preview.appendChild(el);
    });

    const gotoBtn = pageContent.querySelector('[data-action="gotoProjects"]');
    gotoBtn?.addEventListener('click', () => navigate('projects'));

    const annList = document.getElementById('announcementsList');
    annList.innerHTML = '';
    state.announcements.forEach(a => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center">
        <div><div style="font-weight:600">${escapeHtml(a.title)}</div><div class="muted" style="font-size:12px">${new Date(a.created_at).toLocaleDateString()}</div></div>
      </div><p class="muted" style="margin-top:8px">${escapeHtml(a.body)}</p>`;
      annList.appendChild(card);
    });
  }

  function createProjectPreview(p) {
    const el = document.createElement('div');
    el.className = 'project';
    el.tabIndex = 0;
    el.innerHTML = `<div style="display:flex;gap:10px;align-items:center">
      <div style="width:44px;height:44px;border-radius:6px;background:var(--teal-200);display:flex;align-items:center;justify-content:center;color:var(--teal-600);font-weight:700">${escapeHtml(p.title[0]||'P')}</div>
      <div><div style="font-weight:600">${escapeHtml(p.title)}</div><div class="muted" style="font-size:12px">${escapeHtml(p.status)}</div></div>
    </div><p class="muted" style="margin-top:8px">${escapeHtml(p.description)}</p>`;
    el.addEventListener('click', () => openModal('project', p));
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter') openModal('project', p); });
    return el;
  }

  // Projects page
  function renderProjects() {
    const list = document.getElementById('projectsList');
    const filter = document.getElementById('projectFilter');
    const createBtn = document.getElementById('createProjectBtn');

    function refresh() {
      const f = filter.value;
      list.innerHTML = '';
      const items = state.projects.filter(p => f === 'all' ? true : p.status === f);
      if (items.length === 0) {
        const c = document.createElement('div');
        c.className = 'card';
        c.textContent = 'No projects yet';
        list.appendChild(c);
        return;
      }
      items.forEach(p => list.appendChild(createProjectCard(p)));
    }

    filter.addEventListener('change', refresh);
    createBtn.addEventListener('click', () => {
      const title = prompt('Project title');
      if (!title) return;
      const newP = { id: Date.now(), title, description: 'New project', status: 'active', points_earned: 0, details: 'Created just now.' };
      state.projects.unshift(newP);
      refresh();
      updateProfileUI();
    });

    refresh();
  }

  function createProjectCard(p) {
    const el = document.createElement('div');
    el.className = 'card';
    el.tabIndex = 0;
    el.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center">
      <div style="display:flex;gap:12px;align-items:center">
        <div style="width:48px;height:48px;border-radius:6px;background:var(--teal-200);display:flex;align-items:center;justify-content:center;color:var(--teal-600);font-weight:700">${escapeHtml(p.title[0]||'P')}</div>
        <div><div style="font-weight:600">${escapeHtml(p.title)}</div><div class="muted" style="font-size:13px">${escapeHtml(p.description)}</div></div>
      </div>
      <div style="text-align:right">
        <div class="muted" style="font-size:13px">${escapeHtml(p.status)}</div>
        <div style="margin-top:8px"><button class="btn small" data-action="open" data-id="${p.id}">Open</button> <button class="btn small" data-action="delete" data-id="${p.id}">Delete</button></div>
      </div>
    </div>`;
    el.querySelector('[data-action="delete"]')?.addEventListener('click', (e) => {
      if (!confirm('Delete project?')) return;
      const id = Number(e.currentTarget.dataset.id);
      state.projects = state.projects.filter(x => x.id !== id);
      el.remove();
      updateProfileUI();
    });
    el.querySelector('[data-action="open"]')?.addEventListener('click', () => openModal('project', p));
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter') openModal('project', p); });
    return el;
  }

  // Shop page
  function renderShop() {
    document.getElementById('shopPoints').textContent = state.user.points;
    const itemsWrap = document.getElementById('shopItems');
    itemsWrap.innerHTML = '';
    state.shop.forEach(it => itemsWrap.appendChild(createShopItem(it)));
    document.getElementById('yourOrdersBtn').addEventListener('click', () => {
      if (state.orders.length === 0) return alert('No orders yet.');
      alert('Orders:\n' + state.orders.map(o => `#${o.id} ${o.name}`).join('\n'));
    });
  }

  function createShopItem(item) {
    const el = document.createElement('div');
    el.className = 'card item';
    el.tabIndex = 0;
    el.innerHTML = `<div style="height:120px;background:#f0fffb;border-radius:8px;display:flex;align-items:center;justify-content:center">${escapeHtml(item.name)}</div>
      <div style="margin-top:10px"><div style="font-weight:600">${escapeHtml(item.name)}</div><div class="muted" style="font-size:13px">${escapeHtml(item.description)}</div></div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
        <div class="muted">Cost: <strong>${item.cost_points}</strong></div>
        <div style="display:flex;gap:8px">
          <button class="btn small info">More info</button>
          <button class="btn buy" style="background:var(--teal-600);color:white">Buy</button>
        </div>
      </div>`;
    el.querySelector('.info').addEventListener('click', () => openModal('shop', item));
    el.querySelector('.buy').addEventListener('click', () => attemptBuy(item));
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter') openModal('shop', item); });
    return el;
  }

  function attemptBuy(item) {
    if (item.stock <= 0) return alert('Out of stock');
    if (state.user.points < item.cost_points) return alert('Not enough points');
    if (!confirm(`Buy ${item.name} for ${item.cost_points} points?`)) return;
    state.user.points -= item.cost_points;
    item.stock -= 1;
    const order = { id: state.orders.length + 1, name: item.name, created_at: new Date().toISOString() };
    state.orders.push(order);
    updateProfileUI();
    renderShop();
    alert('Order placed: #' + order.id);
  }

  // Explore
  function renderExplore() {
    // placeholder for future content
  }

  // Modal
  function attachModalHandlers() {
    modalBackdrop.addEventListener('click', closeModal);
    modalClose.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
  }

  function openModal(type, data) {
    modal.setAttribute('aria-hidden', 'false');
    modalContent.innerHTML = '';
    if (type === 'project') {
      modalContent.innerHTML = `<h2 style="margin-top:0">${escapeHtml(data.title)}</h2>
        <div class="muted" style="font-size:13px">Status: ${escapeHtml(data.status)} • Points: ${escapeHtml(String(data.points_earned))}</div>
        <p style="margin-top:12px">${escapeHtml(data.description)}</p>
        <div style="margin-top:8px" class="muted">${escapeHtml(data.details || '')}</div>
        <div style="margin-top:12px"><button class="btn" id="modalEdit">Edit</button> <button class="btn danger" id="modalDelete">Delete</button></div>`;
      document.getElementById('modalEdit').addEventListener('click', () => {
        const newTitle = prompt('Edit title', data.title);
        if (!newTitle) return;
        data.title = newTitle;
        closeModal();
        const current = document.querySelector('.nav-item.active')?.getAttribute('data-route') || 'dashboard';
        navigate(current);
      });
      document.getElementById('modalDelete').addEventListener('click', () => {
        if (!confirm('Delete project?')) return;
        state.projects = state.projects.filter(p => p.id !== data.id);
        closeModal();
        navigate('projects');
        updateProfileUI();
      });
    } else if (type === 'shop') {
      modalContent.innerHTML = `<h2 style="margin-top:0">${escapeHtml(data.name)}</h2>
        <div class="muted" style="font-size:13px">Cost: ${escapeHtml(String(data.cost_points))} • Stock: ${escapeHtml(String(data.stock))}</div>
        <p style="margin-top:12px">${escapeHtml(data.description)}</p>
        <div style="margin-top:8px" class="muted">${escapeHtml(data.more_info || '')}</div>
        <div style="margin-top:12px"><button class="btn" id="modalBuy">Buy</button></div>`;
      document.getElementById('modalBuy').addEventListener('click', () => {
        attemptBuy(data);
        closeModal();
      });
    }
    setTimeout(() => modalPanel.querySelector('button')?.focus(), 0);
  }

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    modalContent.innerHTML = '';
  }

  // Profile UI update
  function updateProfileUI() {
    profileNameEl.textContent = state.user.name;
    profilePointsEl.textContent = state.user.points;
    pfpEl.textContent = state.user.pfpInitial || state.user.name[0] || 'U';
  }

  // Utilities
  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  // Start
  init();

  // Expose background helper to global for quick testing in console if needed
  window.setBackgroundImage = setBackgroundImage;
})();