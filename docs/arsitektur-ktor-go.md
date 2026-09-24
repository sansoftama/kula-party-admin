# Rekomendasi Arsitektur Backend: Ktor sekarang, Go jangka panjang

Catatan keputusan untuk Kula Party (voice-party Android-first), disalin ke repo ops admin (`kula-party-admin`) supaya pemelihara UI ini tahu batas API. Bukan jadwal rewrite; ini panduan supaya pilihan hari ini tidak menutup opsi skala nanti.

Batas yang mengikat admin: panggilan tetap **HTTP/JSON**. Implementasi di balik kontrak boleh Ktor sekarang dan Go nanti. Jangan mengunci kode admin pada asumsi “satu host Ktor” di luar konfigurasi base URL.

> **Klarifikasi.** Migrasi ke Go bersifat **opsional** dan semata-mata **mungkin** di masa depan — bukan keharusan, bukan target, dan bukan jadwal. Ktor tetap pilihan utama tanpa batas waktu, sampai bottleneck nyata muncul. Go siap disusulkan kapan saja bila diperlukan, tanpa komitmen.

## Ringkasan

| Fase | Pilihan | Alasan |
|------|---------|--------|
| Sekarang | **Ktor (Kotlin)** | Tim kecil, satu bahasa dengan Android, prototyping cepat. Media sudah di LiveKit. |
| Jangka panjang | **Go** untuk hot path | Concurrency matang, binary ringan, cold start cepat, ekosistem hidup di live-social besar. |
| Migrasi | **Bertahap per domain** | Kontrak HTTP/JSON stabil; ganti service satu per satu, bukan big-bang. |

## Kenapa Ktor tetap dipakai sekarang

1. **Satu bahasa dengan Android (Kotlin)** — model, DTO, dan mental model API mirip antara client dan server; onboarding cepat untuk tim kecil.
2. **LiveKit sudah menanggung beban media** — SFU, WebRTC, publish/subscribe audio bukan tanggung jawab proses Ktor. Backend Kula saat ini: auth, mint token LiveKit, room/seat, gifts, payments, anti-cheat signals. Itu HTTP + DB/cache; Ktor cukup.
3. **Prototyping** — fitur party berubah cepat; mengubah endpoint Ktor lebih murah daripada merawat dua bahasa terlalu dini.

## Kenapa Go unggul untuk skalabilitas jangka panjang

Untuk beban yang **bukan** SFU (matchmaking, presence fan-out, event fan-out besar, worker batch):

- Concurrency dan model deploy microservice yang sudah terbukti di banyak produk live-social.
- Binary tunggal, footprint kecil, cold start cepat (cocok autoscaling).
- Hiring/ops yang sering sudah “Go-native” di ruang voice/live.

Ini **bukan** alasan untuk membuang Ktor hari ini. Ini alasan merancang boundary supaya Go bisa masuk tanpa rewrite besar.

## Jangan pilih Go hanya karena “Hago pakai Go”

Hago (JOYY) dan sejenisnya sering pakai Go di backend sosial/live — itu sinyal industri, **bukan** bukti bahwa Kula harus rewrite sekarang.

- Media party sudah di **LiveKit**. Bottleneck SFU bukan di Ktor.
- Pilih Go kalau bottleneck **nyata di backend sendiri**: matchmaking, presence fan-out, antrian event, worker berat — terukur dari latency/CPU/error budget, bukan dari imitasi stack kompetitor.

## Rancang API boundary agar Go bisa menyusul

Perlakukan domain berikut sebagai **kontrak HTTP/JSON** (path + schema + kode error), bukan sebagai “implementation detail” monolith:

| Boundary | Contoh tanggung jawab | Catatan |
|----------|----------------------|---------|
| **auth** | session JWT, OAuth/OTP exchange | Edge yang paling lambat diganti |
| **token** | mint LiveKit JWT (server holds API secret) | Harus tetap server-side |
| **room** | create/join, lock, host identity | Bisa digeser dulu bila hot |
| **gifts** | catalog, send, saldo | I/O + ledger; kandidat Go nanti |
| *(nanti)* matchmaking / presence | fan-out tinggi | Kandidat Go pertama saat bottleneck muncul |

Aturan:

1. Client Android (dan admin) hanya bergantung pada **kontrak**, bukan pada “ini masih Ktor”.
2. Jangan leak tipe/framework Ktor ke klien.
3. Satu domain = satu unit deploy yang *bisa* diganti (meski hari ini masih satu proses).

## Pola migrasi aman (bukan big-bang)

```
[ Android / Admin ]
        |
        v
[ Ktor edge: auth + routing ]  ----tetap dulu----
        |
        +--> [ Go: hot path baru ]  (matchmaking, presence, …)
        +--> [ Ktor: gifts/room/token ] sampai diganti per domain
        |
        v
[ LiveKit SFU ]  (media; tidak diganti oleh Go/Ktor)
```

Lima rekomendasi migrasi:

1. **Ktor tetap edge/auth** selama migrasi — satu pintu auth dan gerbang session.
2. **Go untuk service hot path baru** — service baru di belakang kontrak yang sama atau path baru yang didokumentasikan; jangan rewrite seluruh monolit sekaligus.
3. **Kontrak HTTP/JSON sama** — Android dan admin tidak perlu “hari Go”; cukup URL/schema yang stabil.
4. **Ganti per domain** — misalnya gifts dulu, lalu room; ukur sebelum dan sesudah.
5. **Infra** (`kula-party-infra`) menyiapkan compose/k8s agar bisa menambah container Go tanpa mengubah LiveKit.

## Kapan mulai memikirkan service Go pertama

Mulai desain (bukan rewrite) ketika salah satu ini terukur:

- Latency p95 pada path non-media naik karena fan-out / lock contention di proses API.
- CPU API didominasi kerja yang bukan I/O DB sederhana.
- Ada kebutuhan deploy independen (release hot path tanpa deploy seluruh Ktor).

Sampai itu muncul: **pertahankan Ktor**, perketat boundary, tulis kontrak di OpenAPI/docs.

## Implikasi per repo

Repo ini adalah **`kula-party-admin`**. Baris itu yang mengikat pemelihara UI. Dua baris lain adalah konteks supaya perubahan di backend dan infra tidak mengejutkan admin.

| Repo | Peran catatan ini |
|------|-------------------|
| **`kula-party-admin` (repo ini)** | Admin Next.js hanya memanggil kontrak HTTP/JSON yang sama dengan klien lain (path `/v1/admin/...`, schema, kode error). Asal host hanya lewat konfigurasi base URL: `NEXT_PUBLIC_ADMIN_API_BASE_URL` (tanpa suffix path). Jangan hardcode asumsi “semua di satu host Ktor” di luar config itu — jangan menanam origin, port, atau “ini pasti proses Ktor” di kode UI. Bila suatu domain pindah ke Go, yang berubah adalah base URL atau routing di edge, bukan tipe framework di admin. Jangan leak tipe/framework Ktor ke komponen. Mode mock (`USE_MOCK_ADMIN_API`) tetap fixture lokal; ia bukan service kedua. |
| `kula-party-backend` | Sumber kebenaran kontrak API; implementasi Ktor hari ini; tempat ekstrak boundary. |
| `kula-party-infra` | Compose/deploy harus siap multi-service (Ktor + Go + LiveKit) tanpa asumsi “satu binary selamanya”. |

## Keputusan yang disengaja

- **Ya:** Ktor sekarang; Go sebagai arah jangka panjang untuk hot path.
- **Tidak:** Big-bang rewrite ke Go demi imitasi Hago.
- **Ya:** Stabilkan auth/token/room/gifts sebagai boundary; migrasi bertahap.
- **Tidak:** Memindahkan media keluar dari LiveKit ke backend custom “karena Go”.
- **Opsional:** Go siap disusulkan kapan saja bila diperlukan, tanpa komitmen. Bukan keharusan, bukan target, dan bukan jadwal; Ktor tetap pilihan utama sampai bottleneck nyata muncul.

---

*Dokumen produk/arsitektur Kula Party. Bahasa Indonesia. Salinan untuk pemelihara ops admin. Perbarui bila boundary atau metrik bottleneck berubah.*
