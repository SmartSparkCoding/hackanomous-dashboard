// Minimal SPA logic and sample data for the Hackanomous dashboard.
// No backend required — state is stored in-memory for demo purposes.

(() => {
  // Sample data
  const state = {
    sidebarSide: 'right', // 'right' or 'left'
    user: { id: 1, name: 'Jacob', points: 1240, pfpInitial: 'J' },
    projects: [
      { id: 1, title: 'Hack Club Site', description: 'Club website redesign', status: 'active', points_earned: 120 },
      { id: 2, title: 'Robotics', description: 'Autonomous rover', status: 'active', points_earned: 80 },
      { id: 3, title: 'AI Tutor', description: 'Study helper', status: 'archived', points_earned: 40 }
    ],
    shop: [
      { id: 1, name: 'Sticker Pack', description: 'Vinyl stickers', cost_points: 100, stock: 50, more_info: 'High-quality vinyl stickers' },
      { id: 2, name: 'T-Shirt', description: 'Club tee', cost_points: 500, stock: 10, more_info: 'Cotton tee, sizes S-XL' },
      { id: 3, name: 'Laptop Sticker', description: 'Large sticker', cost_points: 200, stock: 20, more_info: 'Waterproof' }
    ],
    announcements: [
      { id: 1, title: 'Welcome to Hackanomous', body: 'Launch day! Join the kickoff.', created_at: new Date().toISOString() },
      { id: 2, title: 'Hack Night', body: 'Weekly hack night on Friday at 6pm.', created_at: new Date().toISOString() }
    ],
    orders: []
  };

  // DOM refs
  const sidebar = document.getElementById('sidebar');
  const mainArea = document.getElementById('mainArea');
  const pageContent = document.getElementById('pageContent');
  const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
  const profileNameEl = document.getElementById('profileName');
  const profilePointsEl = document.getElementById('profilePoints');
  const pfpEl = document.getElementById('pfp');

  // Templates
  const tpl = {
    dashboard: document.getElementById('dashboardTpl').content,
    projects: document.getElementById('projectsTpl').content,
    shop: document.getElementById('shopTpl').content,
    explore: document.getElementById('exploreTpl').content
  };

  // Initialize UI
  function init() {
    renderSidebar();
    attachGlobalHandlers();
    navigate('dashboard');
    updateProfileUI();
  }

  function renderSidebar() {
    // set sidebar side class
    sidebar.classList.toggle('sidebar-left', state.sidebarSide === 'left');
    sidebar.classList.toggle('sidebar-right', state.sidebarSide === 'right');

    // nav item active states
    Array.from(sidebar.querySelectorAll('.nav-item')).forEach(btn => {
      btn.addEventListener('click', () => {
        const route = btn.getAttribute('data-route');
        navigate(route);
      });
    });

    // logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
      alert('Logged out (demo).');
    });
  }

  function attachGlobalHandlers() {
    // top nav quick links
    document.querySelectorAll('.mini-nav .link').forEach(b => {
      b.addEventListener('click', () => navigate(b.getAttribute('data-route')));
    });

    // toggle sidebar side
    toggleSidebarBtn.addEventListener('click', () => {
      state.sidebarSide = state.sidebarSide === 'right' ? 'left' : 'right';
      renderSidebar();
    });
  }

  // Navigation
  function navigate(route) {
    // clear content
    pageContent.innerHTML = '';
    if (!tpl[route]) route = 'dashboard';
    const clone = tpl[route].cloneNode(true);
    pageContent.appendChild(clone);
    // after render hooks
    if (route === 'dashboard') renderDashboard();
    if (route === 'projects') renderProjects();
    if (route === 'shop') renderShop();
    if (route === 'explore') renderExplore();
    // highlight active nav
    highlightNav(route);
    // focus main for accessibility
    pageContent.querySelector('.page')?.focus();
  }

  function highlightNav(route) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.getAttribute('data-route') === route));
    document.querySelectorAll('.mini-nav .link').forEach(l => l.classList.toggle('font-weight', l.getAttribute('data-route') === route));
  }

  // Dashboard render
  function renderDashboard() {
    // projects preview
    const preview = document.getElementById('projectsPreview');
    preview.innerHTML = '';
    const previewProjects = state.projects.slice(0, 4);
    previewProjects.forEach(p => preview.appendChild(createProjectPreview(p)));

    // Go to full list button
    pageContent.querySelector('[data-action="gotoProjects"]')?.addEventListener('click', () => navigate('projects'));

    // announcements
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
    el.innerHTML = `<div style="display:flex;gap:10px;align-items:center">
      <div style="width:44px;height:44px;border-radius:8px;background:var(--teal-200);display:flex;align-items:center;justify-content:center;color:var(--teal-600);font-weight:700">${escapeHtml(p.title[0]||'P')}</div>
      <div><div class="title">${escapeHtml(p.title)}</div><div class="muted" style="font-size:12px">${escapeHtml(p.status)}</div></div>
    </div><p class="muted" style="margin-top:8px">${escapeHtml(p.description)}</p>`;
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
      const newP = { id: Date.now(), title, description: 'New project', status: 'active', points_earned: 0 };
      state.projects.unshift(newP);
      refresh();
    });

    refresh();
  }

  function createProjectCard(p) {
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center">
      <div style="display:flex;gap:12px;align-items:center">
        <div style="width:48px;height:48px;border-radius:8px;background:var(--teal-200);display:flex;align-items:center;justify-content:center;color:var(--teal-600);font-weight:700">${escapeHtml(p.title[0]||'P')}</div>
        <div><div style="font-weight:600">${escapeHtml(p.title)}</div><div class="muted" style="font-size:13px">${escapeHtml(p.description)}</div></div>
      </div>
      <div style="text-align:right">
        <div class="muted" style="font-size:13px">${escapeHtml(p.status)}</div>
        <div style="margin-top:8px"><button class="btn small" data-action="open" data-id="${p.id}">Open</button> <button class="btn small" data-action="delete" data-id="${p.id}">Delete</button></div>
      </div>
    </div>`;
    // actions
    el.querySelector('[data-action="delete"]')?.addEventListener('click', (e) => {
      if (!confirm('Delete project?')) return;
      const id = Number(e.currentTarget.dataset.id);
      state.projects = state.projects.filter(x => x.id !== id);
      el.remove();
      updateProfileUI();
    });
    el.querySelector('[data-action="open"]')?.addEventListener('click', () => alert(`Open project: ${p.title}`));
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
    el.innerHTML = `<div style="height:120px;background:#f0fffb;border-radius:8px;display:flex;align-items:center;justify-content:center">${escapeHtml(item.name)}</div>
      <div style="margin-top:10px"><div style="font-weight:600">${escapeHtml(item.name)}</div><div class="muted" style="font-size:13px">${escapeHtml(item.description)}</div></div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
        <div class="muted">Cost: <strong>${item.cost_points}</strong></div>
        <div style="display:flex;gap:8px">
          <button class="btn small info">More info</button>
          <button class="btn buy" style="background:var(--teal-600);color:white">Buy</button>
        </div>
      </div>`;
    el.querySelector('.info').addEventListener('click', () => alert(item.more_info || 'No extra info'));
    el.querySelector('.buy').addEventListener('click', () => attemptBuy(item));
    return el;
  }

  function attemptBuy(item) {
    if (item.stock <= 0) return alert('Out of stock');
    if (state.user.points < item.cost_points) return alert('Not enough points');
    if (!confirm(`Buy ${item.name} for ${item.cost_points} points?`)) return;
    // process order (in-memory)
    state.user.points -= item.cost_points;
    item.stock -= 1;
    const order = { id: state.orders.length + 1, name: item.name, created_at: new Date().toISOString() };
    state.orders.push(order);
    updateProfileUI();
    renderShop(); // refresh shop UI
    alert('Order placed: #' + order.id);
  }

  // Explore
  function renderExplore() {
    // nothing dynamic for now
  }

  // Profile UI update
  function updateProfileUI() {
    profileNameEl.textContent = state.user.name;
    profilePointsEl.textContent = state.user.points;
    pfpEl.textContent = state.user.pfpInitial || state.user.name[0] || 'U';
  }

  // Utility
  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  // Start
  init();
})();