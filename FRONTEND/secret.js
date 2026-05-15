import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { auth, db } from "./db.js";

window.CEAS_USER = { name: '', role: 'student', email: '', uid: '' };

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = 'auth.html';
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

    window.CEAS_USER = { name: displayName, role, email: user.email, uid: user.uid };

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
    window.location.href = 'auth.html';
});

async function deleteItemFromBackend(postId, card) {
    if (!confirm('Delete this post?')) return;
    try {
        const email = encodeURIComponent(window.CEAS_USER.email || '');
        const uid   = encodeURIComponent(window.CEAS_USER.uid   || '');
        const res = await fetch(
            `http://localhost:3000/item/${postId}?requesterEmail=${email}&requesterUid=${uid}`,
            { method: 'DELETE' }
        );
        if (!res.ok) throw new Error(await res.text());
        card.style.transition = 'opacity 0.3s';
        card.style.opacity = '0';
        setTimeout(() => card.remove(), 300);
    } catch (err) {
        alert('Delete failed: ' + err.message);
    }
}

function injectDeleteButton(statusSpan, postId, card) {
    if (card.querySelector('.delete-post-btn')) return;
    const IS_ADMIN  = window.CEAS_USER.role === 'admin';
    const postEmail = card.dataset.reporterEmail || '';
    const canDelete = IS_ADMIN || (postEmail && postEmail === window.CEAS_USER.email);
    if (!canDelete) return;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-post-btn';
    deleteBtn.title = IS_ADMIN ? 'Admin: Delete post' : 'Delete your post';
    deleteBtn.innerHTML = '<span class="material-symbols-outlined">delete</span> Delete';
    deleteBtn.onclick = () => deleteItemFromBackend(postId, card);
    statusSpan.insertAdjacentElement('afterend', deleteBtn);
}

function applyBadgeClass(span) {
    const txt = span.textContent.trim();
    span.classList.remove(
        'status-badge-unclaimed', 'status-badge-claimed',
        'status-badge-pending',   'status-badge-synced'
    );
    if      (txt === 'Unclaimed') span.classList.add('status-badge-unclaimed');
    else if (txt === 'Claimed')   span.classList.add('status-badge-claimed');
    else if (txt === 'Pending')   span.classList.add('status-badge-pending');
    else if (txt === 'Synced')    span.classList.add('status-badge-synced');
}

function applyRoleFeatures() {
    document.querySelectorAll('[id^="status-"]').forEach(applyBadgeClass);

    const observer = new MutationObserver(mutations => {
        mutations.forEach(m => {
            m.addedNodes.forEach(node => {
                if (node.nodeType !== 1) return;
                const spans = [node, ...node.querySelectorAll('[id^="status-"]')]
                    .filter(el => el.id && el.id.startsWith('status-'));
                spans.forEach(span => {
                    applyBadgeClass(span);
                    const postId = span.id.replace('status-', '');
                    const card = span.closest('.post-card, .history-card, .saved-card, .preview-card');
                    if (!card) return;
                    injectDeleteButton(span, postId, card);
                });
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    document.querySelectorAll('[id^="status-"]').forEach(statusSpan => {
        const postId = statusSpan.id.replace('status-', '');
        const card = statusSpan.closest('.post-card, .history-card, .saved-card, .preview-card');
        if (!card) return;
        injectDeleteButton(statusSpan, postId, card);
    });
}
