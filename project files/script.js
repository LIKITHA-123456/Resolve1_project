const API = 'http://127.0.0.1:5000/api';

function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
    document.getElementById(page).classList.add('active');
    document.querySelector(`nav a[data-page="${page}"]`).classList.add('active');
    if (page === 'home') loadHome();
    if (page === 'admin') loadAdmin();
}

function showFlash(msg) {
    const el = document.getElementById('flash');
    el.textContent = msg;
    el.className = 'flash flash-success';
    setTimeout(() => el.className = 'flash', 4000);
}

async function loadHome() {
    const [statsRes, recentRes] = await Promise.all([
        fetch(`${API}/stats`), fetch(`${API}/complaints/recent`)
    ]);
    const stats = await statsRes.json();
    const recent = await recentRes.json();

    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-pending').textContent = stats.pending;
    document.getElementById('stat-resolved').textContent = stats.resolved;
    document.getElementById('stat-rejected').textContent = stats.rejected;

    const tbody = document.getElementById('recent-body');
    if (recent.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">No complaints yet.</td></tr>';
    } else {
        tbody.innerHTML = recent.map(r => `<tr>
            <td>#${r.id}</td><td>${r.subject}</td><td>${r.category}</td>
            <td><span class="badge b-${r.status.toLowerCase()}">${r.status}</span></td>
            <td>${r.created.slice(0,10)}</td></tr>`).join('');
    }
}

document.getElementById('submit-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
        name: form.name.value,
        email: form.email.value,
        category: form.category.value,
        subject: form.subject.value,
        description: form.description.value
    };
    const res = await fetch(`${API}/complaints`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    const result = await res.json();
    form.reset();
    showFlash(result.message);
    showPage('home');
});

document.getElementById('track-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = document.getElementById('track-query').value.trim();
    const res = await fetch(`${API}/complaints/search`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({query})
    });
    const results = await res.json();
    const div = document.getElementById('track-results');

    if (results.length === 0) {
        div.innerHTML = '<div class="card"><h2>Results</h2><p>No complaints found.</p></div>';
    } else {
        div.innerHTML = `<div class="card"><h2>Results</h2><table>
            <tr><th>ID</th><th>Subject</th><th>Category</th><th>Status</th><th>Date</th></tr>
            ${results.map(r => `<tr><td>#${r.id}</td><td>${r.subject}</td><td>${r.category}</td>
            <td><span class="badge b-${r.status.toLowerCase()}">${r.status}</span></td>
            <td>${r.created.slice(0,10)}</td></tr>`).join('')}</table></div>`;
    }
});

async function loadAdmin() {
    const res = await fetch(`${API}/complaints`);
    const complaints = await res.json();
    const tbody = document.getElementById('admin-body');

    if (complaints.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">No complaints.</td></tr>';
    } else {
        tbody.innerHTML = complaints.map(r => `<tr>
            <td>#${r.id}</td><td>${r.name}</td><td>${r.subject}</td><td>${r.category}</td>
            <td><span class="badge b-${r.status.toLowerCase()}">${r.status}</span></td>
            <td>${r.created.slice(0,10)}</td>
            <td>${r.status === 'Pending' ?
                `<button class="btn-sm resolve" onclick="updateStatus(${r.id},'Resolved')">Resolve</button>
                 <button class="btn-sm reject" onclick="updateStatus(${r.id},'Rejected')">Reject</button>`
                : '&mdash;'}</td></tr>`).join('');
    }
}

async function updateStatus(id, action) {
    const res = await fetch(`${API}/complaints/${id}/update`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({action})
    });
    const result = await res.json();
    showFlash(result.message);
    loadAdmin();
}

showPage('home');
