import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
 
const firebaseConfig = {
  apiKey: "AIzaSyAxpj-v5W9YN_onrP-P_meEJVoMwJUsopA",
  authDomain: "ceasfind.firebaseapp.com",
  projectId: "ceasfind",
  storageBucket: "ceasfind.firebasestorage.app",
  messagingSenderId: "721673444524",
  appId: "1:721673444524:web:5e7dfed9375b5dbed0d309",
  measurementId: "G-1FHYW39Z56"
};
 
const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);
 
window.CEAS_USER = { name: '', role: 'student' };
 
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = '/FRONTEND/auth.html';
        return;
    }
 
    let displayName = user.displayName || user.email || 'User';
    let role        = 'student';
 
    try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
            const d = snap.data();
            if (d.displayName) displayName = d.displayName;
            if (d.role)        role        = d.role;
        }
    } catch (e) {
        console.warn('Firestore fetch failed, using Auth defaults:', e);
    }
 
    window.CEAS_USER = { name: displayName, role };
 
    const nameEl = document.getElementById('sidebar-username');
    if (nameEl) {
        nameEl.textContent = displayName;
        if (role === 'admin') {
            nameEl.insertAdjacentHTML('afterend',
                '<span class="admin-badge">Admin</span>');
        }
    }
 
    applyRoleFeatures();
});
 
document.getElementById('logout-icon')?.addEventListener('click', async () => {
    await signOut(auth);
    window.location.href = '/FRONTEND/auth.html';
});
 
function applyRoleFeatures() {
    const IS_ADMIN = window.CEAS_USER.role === 'admin';
 
    document.querySelectorAll('[id^="status-"]').forEach(span => {
        const txt = span.textContent.trim();
        span.classList.remove(
            'status-badge-unclaimed','status-badge-claimed',
            'status-badge-pending','status-badge-synced'
        );
        if      (txt === 'Unclaimed') span.classList.add('status-badge-unclaimed');
        else if (txt === 'Claimed')   span.classList.add('status-badge-claimed');
        else if (txt === 'Pending')   span.classList.add('status-badge-pending');
        else if (txt === 'Synced')    span.classList.add('status-badge-synced');
    });
 
    const observer = new MutationObserver(mutations => {
        mutations.forEach(m => {
            m.addedNodes.forEach(node => {
                if (node.nodeType !== 1) return;
                const spans = [node, ...node.querySelectorAll('[id^="status-"]')]
                    .filter(el => el.id && el.id.startsWith('status-'));
                spans.forEach(span => {
                    const txt = span.textContent.trim();
                    span.classList.remove(
                                'status-badge-unclaimed','status-badge-claimed',
                                'status-badge-pending','status-badge-synced'
                            );
                            if      (txt === 'Unclaimed') span.classList.add('status-badge-unclaimed');
                            else if (txt === 'Claimed')   span.classList.add('status-badge-claimed');
                            else if (txt === 'Pending')   span.classList.add('status-badge-pending');
                            else if (txt === 'Synced')    span.classList.add('status-badge-synced');
                        });
 
                        node.querySelectorAll('[id^="status-"]').forEach(statusSpan => {
                            const postId = statusSpan.id.replace('status-', '');
                            const card = statusSpan.closest('.post-card, .history-card, .saved-card, .preview-card');
                            if (!card) return;
                            const userLink = card.querySelector('.username-link, a[href*="pfp.html"]');
                            const postUser = userLink ? (userLink.textContent.trim()) : '';
                            const canDelete = IS_ADMIN || (postUser === window.CEAS_USER.name);
                            if (!canDelete) return;
                            if (card.querySelector('.delete-post-btn')) return;
 
                            const deleteBtn = document.createElement('button');
                            deleteBtn.className = 'delete-post-btn';
                            deleteBtn.title = IS_ADMIN ? 'Admin: Delete post' : 'Delete your post';
                            deleteBtn.innerHTML = '<span class="material-symbols-outlined">delete</span> Delete';
                            deleteBtn.onclick = () => {
                                if (!confirm('Delete this post?')) return;
                                let posts = JSON.parse(localStorage.getItem('ceas_posts') || '[]');
                                posts = posts.filter(p => String(p.id) !== String(postId));
                                localStorage.setItem('ceas_posts', JSON.stringify(posts));
                                card.style.transition = 'opacity 0.3s';
                                card.style.opacity = '0';
                                setTimeout(() => card.remove(), 300);
                            };
 
                            statusSpan.insertAdjacentElement('afterend', deleteBtn);
                        });
                    });
                });
            });
 
            observer.observe(document.body, { childList: true, subtree: true });
 
            document.querySelectorAll('[id^="status-"]').forEach(statusSpan => {
                const postId = statusSpan.id.replace('status-', '');
                const card = statusSpan.closest('.post-card, .history-card, .saved-card, .preview-card');
                if (!card) return;
                if (card.querySelector('.delete-post-btn')) return;
                const userLink = card.querySelector('.username-link, a[href*="pfp.html"]');
                const postUser = userLink ? userLink.textContent.trim() : '';
                const canDelete = IS_ADMIN || (postUser === window.CEAS_USER.name);
                if (!canDelete) return;
 
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-post-btn';
                deleteBtn.title = IS_ADMIN ? 'Admin: Delete post' : 'Delete your post';
                deleteBtn.innerHTML = '<span class="material-symbols-outlined">delete</span> Delete';
                deleteBtn.onclick = () => {
                    if (!confirm('Delete this post?')) return;
                    let posts = JSON.parse(localStorage.getItem('ceas_posts') || '[]');
                    posts = posts.filter(p => String(p.id) !== String(postId));
                    localStorage.setItem('ceas_posts', JSON.stringify(posts));
                    card.style.transition = 'opacity 0.3s';
                    card.style.opacity = '0';
                    setTimeout(() => card.remove(), 300);
                };
 
                statusSpan.insertAdjacentElement('afterend', deleteBtn);
            });
        }