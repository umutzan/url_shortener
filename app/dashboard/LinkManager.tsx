"use client";

import { useState, useEffect, useCallback } from "react";

interface Link {
  id: number;
  code: string;
  original: string;
  hits: number;
  created_at: string;
}

interface Settings {
  site_url: string;
  default_redirect: string;
}

interface Props {
  username: string;
  baseUrl: string;
  initialSettings: Settings;
}

export default function LinkManager({ username, baseUrl, initialSettings }: Props) {
  const [links, setLinks] = useState<Link[]>([]);
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [useCustomCode, setUseCustomCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const [siteUrl, setSiteUrl] = useState(initialSettings.site_url);
  const [defaultRedirect, setDefaultRedirect] = useState(initialSettings.default_redirect);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsError, setSettingsError] = useState("");

  const fetchLinks = useCallback(async () => {
    const res = await fetch("/api/links");
    if (res.ok) setLinks(await res.json());
    setFetching(false);
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        customCode: useCustomCode ? customCode.trim() || undefined : undefined,
      }),
    });

    if (res.ok) {
      const link: Link = await res.json();
      setLinks((prev) => [link, ...prev]);
      setUrl("");
      setCustomCode("");
    } else {
      const data = await res.json();
      setError(data.error ?? "Oluşturulamadı");
    }
    setLoading(false);
  }

  async function handleDelete(code: string) {
    if (!confirm(`"${code}" kodunu silmek istediğinizden emin misiniz?`)) return;
    const res = await fetch(`/api/links/${code}`, { method: "DELETE" });
    if (res.ok) setLinks((prev) => prev.filter((l) => l.code !== code));
  }

  async function handleCopy(code: string) {
    await navigator.clipboard.writeText(`${baseUrl}/${code}`);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSettingsSaving(true);
    setSettingsError("");
    setSettingsSaved(false);

    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ site_url: siteUrl.trim(), default_redirect: defaultRedirect.trim() }),
    });

    if (res.ok) {
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } else {
      setSettingsError("Ayarlar kaydedilemedi");
    }
    setSettingsSaving(false);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  function truncate(str: string, n: number) {
    return str.length > n ? str.slice(0, n) + "…" : str;
  }

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-200">
      {/* Header */}
      <header className="bg-[#1a1d27] border-b border-[#2a2d3a]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LinkIcon />
            <span className="text-base font-bold text-white">Link Kısaltıcı</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">
              Merhaba, <strong className="text-slate-300">{username}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Settings panel */}
        <section className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Site Ayarları</h2>
          <form onSubmit={handleSaveSettings} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500">Site URL</label>
                <input
                  type="url"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  placeholder="https://kendi-domainin.com"
                  className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                />
                <p className="text-xs text-slate-600">Boş bırakılırsa env veya localhost:3000 kullanılır</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500">Ana Sayfa Yönlendirme <span className="text-slate-600">(/ adresi)</span></label>
                <input
                  type="url"
                  value={defaultRedirect}
                  onChange={(e) => setDefaultRedirect(e.target.value)}
                  placeholder="https://hedef-site.com"
                  className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                />
                <p className="text-xs text-slate-600">Boş bırakılırsa / → giriş sayfasına yönlendirir</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={settingsSaving}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:text-blue-500 text-white font-medium px-5 py-2 rounded-lg text-sm transition-colors"
              >
                {settingsSaving ? "Kaydediliyor…" : "Kaydet"}
              </button>
              {settingsSaved && (
                <span className="text-xs text-emerald-400">Ayarlar kaydedildi</span>
              )}
              {settingsError && (
                <span className="text-xs text-red-400">{settingsError}</span>
              )}
            </div>
          </form>
        </section>

        {/* Create form */}
        <section className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Yeni Link Oluştur</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            {/* URL + Kısalt butonu */}
            <div className="flex gap-3">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/uzun-bir-url-adresi"
                required
                className="flex-1 min-w-0 bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:text-blue-500 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap"
              >
                {loading ? "Oluşturuluyor…" : "Kısalt"}
              </button>
            </div>

            {/* Özel kod toggle */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setUseCustomCode((v) => !v);
                  setCustomCode("");
                  setError("");
                }}
                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                  useCustomCode ? "bg-blue-600" : "bg-[#2a2d3a]"
                }`}
                role="switch"
                aria-checked={useCustomCode}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
                    useCustomCode ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
              <span className="text-xs text-slate-500 select-none">
                Özel kod kullan
              </span>
            </div>

            {/* Özel kod input — yalnızca toggle açıkken */}
            {useCustomCode && (
              <div className="flex gap-2 items-center">
                <span className="text-xs text-slate-500 font-mono whitespace-nowrap">
                  {baseUrl}/
                </span>
                <input
                  type="text"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  placeholder="ornek-kod"
                  pattern="[a-zA-Z0-9_-]+"
                  title="Harf, rakam, - ve _ kullanabilirsiniz"
                  autoFocus
                  className="flex-1 bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                />
              </div>
            )}

            {!useCustomCode && (
              <p className="text-xs text-slate-600">
                Kod belirtilmezse 5 haneli rastgele bir hex kod oluşturulur{" "}
                <span className="font-mono text-slate-500">(örn: a3f9c)</span>
              </p>
            )}

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
          </form>
        </section>

        {/* Links table */}
        <section className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a2d3a] flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-300">Tüm Linkler</h2>
            <span className="text-xs text-slate-600">{links.length} link</span>
          </div>

          {fetching ? (
            <div className="py-16 text-center text-slate-600 text-sm">Yükleniyor…</div>
          ) : links.length === 0 ? (
            <div className="py-16 text-center text-slate-600 text-sm">
              Henüz link oluşturulmadı.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0f1117] text-left">
                    <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Kısa Link</th>
                    <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Hedef</th>
                    <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-center">Tıklanma</th>
                    <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Tarih</th>
                    <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-center">QR</th>
                    <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-center">Sil</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2d3a]">
                  {links.map((link) => (
                    <tr key={link.code} className="hover:bg-[#1f2233] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <a
                            href={`${baseUrl}/${link.code}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 hover:underline font-mono text-xs font-medium"
                          >
                            {baseUrl}/{link.code}
                          </a>
                          <button
                            onClick={() => handleCopy(link.code)}
                            title="Kopyala"
                            className="text-slate-600 hover:text-slate-300 transition-colors flex-shrink-0"
                          >
                            {copied === link.code ? <CheckIcon /> : <CopyIcon />}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 max-w-xs">
                        <span title={link.original} className="text-xs">
                          {truncate(link.original, 52)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                          {link.hits}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-xs whitespace-nowrap">
                        {new Date(link.created_at).toLocaleDateString("tr-TR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setQrCode(link.code)}
                          title="QR Kodu Göster"
                          className="inline-flex items-center justify-center text-slate-600 hover:text-slate-300 transition-colors"
                        >
                          <QrIcon />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDelete(link.code)}
                          title="Sil"
                          className="inline-flex items-center justify-center text-red-700 hover:text-red-400 transition-colors"
                        >
                          <TrashIcon />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* QR Modal */}
      {qrCode && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setQrCode(null)}
        >
          <div
            className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-6 shadow-2xl w-full max-w-xs text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-white mb-1">QR Kod</h3>
            <p className="text-xs text-slate-500 font-mono mb-5 break-all">
              {baseUrl}/{qrCode}
            </p>
            <div className="flex justify-center bg-white p-3 rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/qr/${qrCode}`}
                alt={`QR kodu: ${qrCode}`}
                width={220}
                height={220}
                className="rounded-lg"
              />
            </div>
            <div className="flex gap-2 mt-5">
              <a
                href={`/api/qr/${qrCode}`}
                download={`qr-${qrCode}.png`}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
              >
                İndir
              </a>
              <button
                onClick={() => setQrCode(null)}
                className="flex-1 border border-[#2a2d3a] hover:bg-[#1f2233] text-slate-300 text-sm font-medium py-2.5 rounded-lg transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Icons ─────────────────────────────────────────── */

function LinkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function QrIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <path d="M14 14h2v2h-2zM18 14h3M18 18h3M14 18v3M14 21h3"/>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  );
}
