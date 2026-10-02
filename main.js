const SUPABASE_URL = 'https://tpfmwydlqfvwmftqdtwl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwZm13eWRscWZ2d21mdHFkdHdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1OTU5NzEsImV4cCI6MjA5NjE3MTk3MX0.a2AmD207J7EzljbvYDf7Vfh77Sb6CTV-wWLKcMhHReg';

const db = {
  async getLikes(entry_id) {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/likes?entry_id=eq.${entry_id}&select=count`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    const d = await r.json();
    return d[0]?.count ?? 0;
  },

  async incrementLikes(entry_id) {
    // Usa una función RPC para incrementar atómicamente
    const current = await this.getLikes(entry_id);
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/likes?entry_id=eq.${entry_id}`,
      {
        method: 'PATCH',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify({ count: current + 1 })
      }
    );
    const d = await r.json();
    return d[0]?.count ?? current + 1;
  },

  async decrementLikes(entry_id) {
    const current = await this.getLikes(entry_id);
    const newCount = Math.max(0, current - 1);
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/likes?entry_id=eq.${entry_id}`,
      {
        method: 'PATCH',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify({ count: newCount })
      }
    );
    const d = await r.json();
    return d[0]?.count ?? newCount;
  }
};

// CONTADOR DE VISITAS
async function loadVisitorCount() {
  try {
    const r = await fetch('https://api.counterapi.dev/v1/oilworkerpantheon/visits/up');
    const d = await r.json();
    const value = d.count !== undefined ? d.count : d.Count;
    document.getElementById('visitor-count').textContent =
      parseInt(value).toLocaleString('en-US');
  } catch (e) {
    document.getElementById('visitor-count').textContent = '—';
  }
}

// SISTEMA DE LIKES
function initLikes() {
  document.querySelectorAll('.like-btn').forEach(btn => {
    const id = btn.dataset.id;
    const countEl = btn.querySelector('.count');
    const key = 'liked_' + id;

    // Cargar count global al iniciar
    db.getLikes(id).then(count => {
      countEl.textContent = count;
    }).catch(() => {
      countEl.textContent = '0';
    });

    if (localStorage.getItem(key)) {
      btn.classList.add('liked');
    }

    btn.addEventListener('click', async () => {
      btn.disabled = true;

      try {
        if (localStorage.getItem(key)) {
          const newCount = await db.decrementLikes(id);
          countEl.textContent = newCount;
          localStorage.removeItem(key);
          btn.classList.remove('liked');
        } else {
          const newCount = await db.incrementLikes(id);
          countEl.textContent = newCount;
          localStorage.setItem(key, '1');
          btn.classList.add('liked');
        }
      } catch {
        // Fallback visual si falla la red
        const current = parseInt(countEl.textContent) || 0;
        if (localStorage.getItem(key)) {
          countEl.textContent = Math.max(0, current - 1);
          localStorage.removeItem(key);
          btn.classList.remove('liked');
        } else {
          countEl.textContent = current + 1;
          localStorage.setItem(key, '1');
          btn.classList.add('liked');
        }
      } finally {
        btn.disabled = false;
      }
    });
  });
}

// INICIALIZACIÓN GLOBAL
document.addEventListener('DOMContentLoaded', () => {
  loadVisitorCount();
  initLikes();
});
