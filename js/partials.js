/**
 * Partial Loader Script
 * Dynamically loads modular HTML sections into their designated slots.
 */

async function loadPartials() {
  const partials = document.querySelectorAll("template[data-partial]");
  if (!partials.length) return;

  // Check if opened via file:// protocol
  if (window.location.protocol === "file:") {
    showFileProtocolNotice();
    return;
  }

  try {
    // Fetch all partials in parallel
    const loadedData = await Promise.all(
      [...partials].map(async (partial) => {
        const response = await fetch(partial.dataset.partial);
        if (!response.ok) {
          throw new Error(`Failed to load ${partial.dataset.partial}: ${response.status}`);
        }
        const markup = await response.text();
        return { partial, markup };
      }),
    );

    // Insert into DOM
    loadedData.forEach(({ partial, markup }) => {
      partial.insertAdjacentHTML("beforebegin", markup);
      partial.remove();
    });

    // Handle initial anchor link if present (e.g. #about, #skills, #projects)
    if (window.location.hash) {
      const targetId = decodeURIComponent(window.location.hash.slice(1));
      requestAnimationFrame(() => {
        document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
      });
    }

    // Importing script.js initializes the portfolio after the partials exist.
    await import("./script.js");
  } catch (error) {
    console.error("Gagal memuat partial portofolio:", error);

    const message = document.createElement("div");
    message.style.cssText =
      "margin: 40px auto; max-width: 600px; padding: 20px; border-radius: 12px; background: #fee2e2; border: 1px solid #f87171; color: #991b1b; text-align: center; font-family: sans-serif;";
    message.innerHTML = `
      <p style="font-weight: 700; margin-bottom: 8px;">Beberapa bagian halaman gagal dimuat.</p>
      <p style="font-size: 0.9rem; line-height: 1.5;">Periksa koneksi web server lokal atau muat ulang halaman.</p>
    `;
    document.querySelector("main")?.prepend(message);
  }
}

function showFileProtocolNotice() {
  const notice = document.createElement("div");
  notice.style.cssText =
    "margin: 40px auto; max-width: 640px; padding: 24px; border-radius: 16px; background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; text-align: left; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; box-shadow: 0 10px 25px -5px rgba(37,99,235,0.1);";
  notice.innerHTML = `
    <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 8px; color: #1d4ed8;">ℹ️ Butuh Web Server Lokal (CORS Restriction)</h3>
    <p style="font-size: 0.95rem; line-height: 1.6; margin-bottom: 12px; color: #1e3a8a;">
      Halaman ini dibuka langsung menggunakan protokol <code>file:///</code>. Karena halaman telah dipisah menjadi beberapa modul partial (<code>partials/*.html</code>), kebijakan keamanan browser memblokir <code>fetch()</code> lokal.
    </p>
    <div style="background: #ffffff; padding: 12px 16px; border-radius: 8px; font-size: 0.9rem; border: 1px solid #dbeafe;">
      <strong>Cara menjalankan:</strong>
      <ol style="margin: 8px 0 0 20px; line-height: 1.6;">
        <li>Buka folder proyek ini di <strong>VS Code</strong> lalu klik kanan <code>index.html</code> &rarr; <em>Open with Live Server</em>.</li>
        <li>Atau jalankan perintah terminal: <code>npx serve .</code> / <code>python -m http.server</code>.</li>
        <li>Atau jalankan <code>node build.js</code> untuk menggabungkan partials menjadi satu file <code>index.html</code> mandiri tanpa server.</li>
      </ol>
    </div>
  `;
  document.querySelector("main")?.prepend(notice);
}

loadPartials();
