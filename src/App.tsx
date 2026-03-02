/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Input from './components/Input';
import Select from './components/Select';
import StyleButton from './components/StyleButton';
import Textarea from './components/Textarea';

const contentStyles = [
  { id: 'ugc', number: 1, title: 'UGC (User Generated Content)', description: 'Terasa dibuat oleh pengguna biasa, otentik dan jujur.' },
  { id: 'storytelling', number: 2, title: 'Storytelling', description: 'Memiliki alur cerita yang jelas untuk membangun emosi.' },
  { id: 'soft-selling', number: 3, title: 'Soft Selling', description: 'Edukasi halus & informatif, fokus pada manfaat.' },
  { id: 'problem-solution', number: 4, title: 'Problem–Solution', description: 'Mulai dari masalah yang relevan dengan audiens.' },
  { id: 'cinematic', number: 5, title: 'Cinematic', description: 'Visual dominan, minim dialog, membangun kesan premium.' },
  { id: 'listicle', number: 6, title: 'Listicle', description: 'Informasi terstruktur & jelas, mudah dipahami.' },
];

export default function App() {
  const [prompts, setPrompts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ FIX: activeStyles sekarang array (multi-select)
  const [activeStyles, setActiveStyles] = useState<string[]>(['ugc']);

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedSegmentKey, setCopiedSegmentKey] = useState<string | null>(null);

  const [category, setCategory] = useState('Makanan/Minuman');
  const [nameDesc, setNameDesc] = useState('');
  const [character, setCharacter] = useState('');
  const [segmentDuration, setSegmentDuration] = useState('15');
  const [totalDuration, setTotalDuration] = useState('45');
  const [contentCount, setContentCount] = useState('1');
  const [promptMode, setPromptMode] = useState<'bebas' | 'rapi'>('bebas');
  const [loadingText, setLoadingText] = useState('Menganalisa & membuat prompt...');

  const loadingMessages = [
    'Mencari ide-ide sinematik...',
    'Meracik hook yang menarik...',
    'Mengembangkan detail visual...',
    'Menyusun narasi yang kuat...',
    'Finalisasi prompt video...',
  ];

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isLoading) {
      let i = 0;
      setLoadingText(loadingMessages[0]);
      interval = setInterval(() => {
        i = (i + 1) % loadingMessages.length;
        setLoadingText(loadingMessages[i]);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // ✅ FIX: Toggle style — minimal 1 harus selalu terpilih
  const toggleStyle = (id: string) => {
    setActiveStyles(prev =>
      prev.includes(id)
        ? prev.length === 1 ? prev : prev.filter(s => s !== id)
        : [...prev, id]
    );
  };

  // ✅ FIX: Distribusi gaya ke konten secara round-robin
  const distributeStyles = (count: number, styles: string[]): string[] => {
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      result.push(styles[i % styles.length]);
    }
    return result;
  };

  const downloadPrompts = () => {
    const content = prompts.join('\n\n---\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sora-prompts.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePromptChange = (newText: string, index: number) => {
    const updatedPrompts = [...prompts];
    updatedPrompts[index] = newText;
    setPrompts(updatedPrompts);
  };

  const copyPrompt = (text: string, index: number) => {
    const promptStartIndex = text.indexOf('▶ SEGMEN');
    const promptToCopy = promptStartIndex !== -1 ? text.substring(promptStartIndex) : text;
    navigator.clipboard.writeText(promptToCopy);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copySegment = (fullText: string, promptIndex: number, segmentIndex: number) => {
    const segments = fullText.split(/(?=▶ SEGMEN)/).filter(s => s.trim().startsWith('▶ SEGMEN'));
    const target = segments[segmentIndex];
    if (target) {
      navigator.clipboard.writeText(target.trim());
      const key = `${promptIndex}-${segmentIndex}`;
      setCopiedSegmentKey(key);
      setTimeout(() => setCopiedSegmentKey(null), 2000);
    }
  };

  const extractSegments = (text: string): string[] => {
    return text.split(/(?=▶ SEGMEN)/).filter(s => s.trim().startsWith('▶ SEGMEN'));
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setPrompts([]);

    const bebasModeInstruction = `Kamu adalah AI pembuat Sora Video Prompt Mamas dalam Bahasa Indonesia yang dibekali kemampuan pencarian Google. Tugas utamamu adalah MENCARI INFORMASI tentang input user, lalu membuat prompt video yang SANGAT SPESIFIK, deskriptif, dan sinematik berdasarkan format dan aturan baru di bawah ini.

**PROSES BERPIKIR (WAJIB DIIKUTI):**
1.  **PENCARIAN & RISET:** Gunakan Google Search untuk mencari informasi detail tentang [NAMA & DESKRIPSI] yang diberikan user. Cari tahu tentang varian produk, keunikan, target pasar, suasana tempat, atau poin menarik lainnya.
2.  **KEMBANGKAN DESKRIPSI:** Berdasarkan hasil pencarian, buat paragraf deskripsi yang kaya dan menggugah selera/minat. Jelaskan seperti apa produk/tempat itu, apa saja kelebihannya, dan apa yang membuatnya spesial. Ini akan menjadi bagian utama dari prompt.
3.  **IDENTIFIKASI MANFAAT/USE-CASE:** Dari hasil riset, tentukan untuk siapa atau untuk momen apa produk/tempat ini cocok (misal: 'cocok untuk teman ngopi, bekal anak sekolah', atau 'ideal untuk honeymoon, liburan keluarga').
4.  **KONSTRUKSI PROMPT:** Susun semua elemen (deskripsi, hook, detail visual, persona model, manfaat, dan CTA) menjadi sebuah prompt video yang utuh sesuai format di bawah.

**FORMAT PROMPT BARU (WAJIB DIIKUTI 100%):**
'Buatkan video realistic karakter [KARAKTER] sedang review [NAMA & DESKRIPSI HASIL RISET YANG DETAIL].

Hook "[PILIH HOOK DARI BANK HOOK BOLEH DI KREASIKAN]".

Setelah hook, kembangkan informasi produk secara menarik dan menggugah selera untuk dialog selama [DURASI SEGMEN] detik, MULTI SCENE, NO TEXT, CLEAR SUBJECT LOCK ,ANTI BLUR VIDEO , Tiap adegan visual sekitar 2–3 detik, Dialog langsung muncul di opening scene, tanpa intro shot.  tanpa jeda. Tampilkan [DETAIL VISUAL HASIL RISET, misal: close up produk, suasana tempat, dll].

Model yang berbicara adalah [KARAKTER] dengan gaya santai dan meyakinkan, menjelaskan kelebihan [NAMA PRODUK/TEMPAT] dengan antusias supaya orang tertarik datang dan beli.

Jelaskan bahwa [PRODUK/TEMPAT] ini cocok untuk [MANFAAT/USE-CASE HASIL RISET].

Buat tampilan video yang hidup, menarik, real dan realistis seperti konten TikTok Go. Videonya berkualitas ultra HD 4K keren. Video tertata rapi dari opening, review rasa, penjelasan harga dan varian, sampai closing tanpa terpotong.

video tanpa musik tanpa teks'

**ATURAN HOOK (SANGAT PENTING):**
-   **UNTUK SEGMEN 1:** Hook HARUS dipilih atau dikreasikan dari "BANK HOOK SEGMEN 1". Pesan utamanya adalah tentang mendapatkan harga lebih terjangkau melalui tag lokasi.
-   **UNTUK SEGMEN 2 DST:** Hook HARUS dipilih atau dikreasikan dari "BANK HOOK LANJUTAN" yang sesuai dengan kategori.
-   **SETIAP KONTEN BARU (setelah *****) adalah video TERPISAH dan INDEPENDEN.**
-   **Segmen pertama dari SETIAP konten (termasuk konten ke-2, ke-3, dst.) WAJIB menggunakan hook dari BANK HOOK SEGMEN 1 — bukan hook lanjutan.**
-   **Hook lanjutan HANYA untuk segmen 2, 3, dst. dalam konten yang SAMA.**

**ATURAN CTA PENUTUP (WAJIB):**
- HANYA ditambahkan di prompt SEGMEN TERAKHIR dari setiap konten, tidak di segmen lainnya.
- Jika hanya ada 1 segmen, segmen itu sekaligus menjadi segmen terakhir.
- Inti pesan yang WAJIB tersampaikan: ajak penonton klik tag lokasi di bawah untuk dapat harga lebih hemat dan cek lokasi terdekat.
- Kalimatnya BEBAS dikreasikan — boleh ubah susunan kata, tambahkan ekspresi natural, atau sesuaikan dengan tone konten. Yang penting inti pesannya sama.
- DILARANG menggunakan kalimat yang persis sama antar konten jika membuat lebih dari 1.

**ATURAN FORMAT OUTPUT LAINNYA:**
-   Awali setiap segmen dengan '▶ SEGMEN [N] ([X] detik)'.
-   Pisahkan segmen dengan '--'.
-   Pisahkan beberapa konsep video dengan '*****'.
-   JANGAN gunakan format list atau poin, seluruh output harus dalam format paragraf naratif yang menyatu sesuai template.

**ATURAN PEMILIHAN HOOK (WAJIB):**
- PILIH SECARA ACAK salah satu hook dari bank yang sesuai kategori — JANGAN selalu ambil yang pertama.
- Setelah memilih, boleh MEMODIFIKASI KREATIF hook tersebut: ubah susunan kata, tambahkan ekspresi natural (contoh: "Eh wait—", "Guys,", "Oke jujur nih,"), atau gabungkan elemen dari dua hook berbeda.
- Inti pesan TIDAK BOLEH berubah (harga lebih murah lewat lokasi bawah).
- Jika menghasilkan lebih dari 1 konten, WAJIB gunakan hook yang BERBEDA di setiap konten. Tidak boleh ada hook yang mirip antar konten.
---
**BANK HOOK SEGMEN 1 (Pilih salah satu untuk segmen pertama sesuaikan dengan kategori):**
===========================
 MAKANAN / RESTO

-"Serius, kalau kamu klik lokasi di bawah, harganya beda. Lebih hemat dibanding beli langsung di tempat. Jangan skip."
-"Yang datang langsung bayar lebih tinggi. Kalau mau lebih hemat, klik lokasi bawah aja. Sistemnya memang begitu."
-"Langsung klik lokasi bawah ya. Lewat sini harganya lebih bersahabat dibanding pesan langsung di kasir."
-"Biar nggak keluar biaya lebih besar, pesan lewat tag lokasi bawah. Yang beli langsung selalu kena harga lebih tinggi."
-"Jangan beli langsung—lebih tinggi. Klik lokasi bawah, kamu dapat harga yang lebih enak."
-"Beneran beda harganya. Klik lokasi bawah kalau kamu mau versi yang lebih hemat daripada beli di tempat."
-"Kalau kamu klik lokasi bawah, harganya turun. Kalau beli langsung, ya… beda. Pilih yang lebih hemat lah."
-"Aku selalu klik lokasi bawah, soalnya harganya *lebih rendah* daripada pesan langsung. Cobain sendiri."
-"Kalau mau hemat, klik lokasi bawah. Yang beli langsung selalu bayar lebih mahal."
-"Pesan lewat tag lokasi bawah itu harganya lebih bersahabat. Datang langsung? Nggak dapet harga itu."

===========================
 HOTEL

-"Booking lewat lokasi bawah itu harganya lebih rendah daripada walk-in. Mau hemat? Klik lokasi bawah aja."
-"Yang check-in langsung biasanya bayar lebih. Klik lokasi bawah, kamu dapat harga yang lebih ramah."
-"Serius, klik lokasi bawah. Harga di sana jauh lebih hemat dibanding datang langsung ke counter."
-"Kalau kamu booking walk-in, harganya beda. Klik lokasi bawah biar dapat harga yang lebih enak."
-"Jangan langsung datang ya—harga walk-in lebih tinggi. Akses dari lokasi bawah jauh lebih hemat."
-"Hematnya kerasa banget kalau booking lewat lokasi bawah. Walk-in itu lebih mahal."
-"Klik lokasi bawah sebelum booking. Harganya lebih turun dibanding bayar langsung di resepsionis."
-"Aku nggak pernah walk-in karena harganya lebih tinggi. Lokasi bawah selalu lebih hemat."
-"Kalau kamu mau harga yang lebih ringan, booking lewat lokasi bawah. Jangan ambil langsung di tempat."
-"Klik lokasi bawah—di sana harganya lebih lembut. Walk-in itu jauh lebih berat di kantong."

===========================
 TEMPAT WISATA / TIKET

-"Tiket lewat lokasi bawah itu lebih murah dibanding beli langsung di loket. Klik dulu sebelum datang."
-"Jangan beli on the spot. Loket harganya lebih tinggi. Klik lokasi bawah buat harga yang lebih hemat."
-"Harganya beda ya. Lokasi bawah kasih kamu harga lebih rendah dibanding beli langsung di pintu masuk."
-"Kalau mau hemat, ambil tiket lewat tag lokasi bawah. Yang beli langsung selalu bayar lebih."
-"Klik lokasi bawah. Tiket di sana lebih ramah harga dibanding beli di loket."
-"Tiket online lewat lokasi bawah lebih hemat daripada harga di tempat. Serius, beda banget."
-"Yang beli di loket itu bayar versi lebih mahal. Klik lokasi bawah buat harga yang lebih enak."
-"Ambil tiket lewat lokasi bawah—lebih hemat. Jangan beli langsung kalau nggak mau keluar lebih."
-"Harganya lebih ringan kalau lewat lokasi bawah. Beli langsung di tempat? Pasti lebih tinggi."
-"Klik lokasi bawah untuk dapat harga yang lebih rendah. Loket itu versi yang lebih mahal."

---
**BANK HOOK LANJUTAN - KATEGORI MAKANAN/MINUMAN (Pilih untuk segmen 2+ jika kategori makanan):**
- "Setelah tadi nyobain bagian pertamanya, sekarang aku mau tunjukin bagian yang bikin menu ini makin menarik."
- "Oke lanjut ya, tadi aku belum sempet bahas isiannya yang melimpah banget."
- "Tadi baru nyobain satu varian, sekarang aku mau cobain yang lainnya biar lengkap."

---
**BANK HOOK LANJUTAN - KATEGORI HOTEL (Pilih untuk segmen 2+ jika kategori hotel):**
- "Setelah tadi lihat kamarnya, sekarang aku mau tunjukin fasilitas lainnya."
- "Oke lanjut ya, aku mau bahas bagian hotel yang paling aku suka."
- "Tadi baru review kamar, sekarang kita lihat area umum dan fasilitasnya."

---
**BANK HOOK LANJUTAN - KATEGORI TEMPAT WISATA (Pilih untuk segmen 2+ jika kategori wisata):**
- "Setelah tadi lihat spot utamanya, sekarang aku mau tunjukin area lainnya."
- "Oke lanjut ya, soalnya tempat ini luas dan banyak spot menarik."
- "Tadi baru lihat bagian depan, sekarang kita keliling lebih jauh."
---`;

    const rapiModeInstruction = `Kamu adalah AI Scriptwriter dan Visual Director untuk konten review TikTok dalam Bahasa Indonesia, yang DIBEKALI KEMAMPUAN PENCARIAN GOOGLE. Tugas utamamu adalah MENCARI INFORMASI DULU tentang input user, lalu mengolahnya menjadi skrip video dialog yang lengkap, membuatkan visual adegan dari hasil pencarian apa yang perlu di informasikan seperti keunggulan, fasilitas, pelayanan, suasana yang menarik, natural, dan siap produksi.

**PROSES BERPIKIR WAJIB — IKUTI URUTAN INI:**

1. **PENCARIAN & RISET:** Gunakan Google Search untuk mencari informasi mendalam tentang [NAMA & DESKRIPSI] yang diberikan user. Cari keunikan produk/tempat, menu unggulan, fasilitas, varian, suasana, target pasar, dan poin menarik lainnya. JANGAN langsung menulis skrip sebelum selesai riset.

2. **HITUNG JUMLAH SEGMEN:** Bagi Total Durasi dengan Durasi per Segmen untuk menentukan berapa segmen yang harus dibuat. Contoh: Total 45 detik ÷ 15 detik per segmen = 3 segmen.

3. **SUSUN DIALOG LENGKAP:** Tulis semua dialog dari Segmen 1 hingga segmen terakhir secara berurutan. Total kata dialog harus proporsional dengan durasi (sekitar 2–2,5 kata per detik). Dialog harus mengalir natural, sambung-menyambung antar segmen, dan TIDAK menyebut harga spesifik.

4. **BUAT VISUAL PER ADEGAN:** Untuk setiap baris dialog, deskripsikan micro-scene visual yang mendukung narasi. Visual harus spesifik, dinamis, dan berdasarkan hasil riset (tampilkan keunggulan, menu, fasilitas, atau suasana nyata yang ditemukan saat riset).

5. **FINALISASI FORMAT:** Susun semua segmen ke dalam format output yang telah ditentukan di bawah.

---

**ATURAN DIALOG (WAJIB):**
- **SEGMEN 1 — HOOK LOKASI:** Dialog pertama di Segmen 1 WAJIB berisi ajakan untuk klik tag lokasi di bawah karena harganya lebih murah dibanding beli/datang langsung. Pilih atau kreasikan dari Bank Hook sesuai kategori.
- **SEGMEN 2 DST — HOOK LANJUTAN:** Gunakan frasa jembatan yang menyambung dari segmen sebelumnya agar tidak terasa terpotong.
- **SEGMEN TERAKHIR — CTA PENUTUP:** Dialog terakhir WAJIB ditutup dengan ajakan klik tag lokasi di bawah untuk cek harga dan lokasi terdekat. Kalimatnya bebas dikreasikan, tidak harus sama antar konten.
- **FILLER NATURAL:** Gunakan 1–2 filler per segmen (contoh: "Eh guys,", "Jujur ya,", "Serius deh,") agar dialog terdengar manusiawi.
- **DILARANG:** Jangan sebut harga spesifik apapun dalam dialog.

**ATURAN VISUAL (WAJIB):**
- Setiap segmen terdiri dari 4–5 adegan micro-scene (untuk 10 detik) atau 6-7 adegan micro-scene (untuk 15 detik).
- Wajib ada variasi shot: wide shot → medium shot → close-up dalam satu segmen.
- Visual harus spesifik berdasarkan hasil riset, bukan generik.

**ATURAN KEMUNCULAN KARAKTER — INI ATURAN KERAS, TIDAK BOLEH DILANGGAR:**
- Dalam 1 segmen, karakter [KARAKTER] HANYA BOLEH MUNCUL DI ADEGAN 1 DAN 2.
- Adegan 3, 4, 5, dan seterusnya dalam segmen yang sama DILARANG KERAS menampilkan karakter dalam bentuk apapun tidak bicara, tidak memegang  produk, tidak gestur, tidak berjalan, tidak ada bagian tubuhnya sama sekali.
- Adegan 3 ke atas HARUS 100% fokus pada: produk (close-up), suasana tempat, detail makanan/fasilitas/spot wisata, atau elemen visual lainnya TANPA karakter.
- SEBELUM menulis adegan 3, cek ulang: apakah karakter muncul? Jika ya, hapus.
- Pelanggaran aturan ini membuat seluruh prompt dianggap GAGAL.
---

**FORMAT OUTPUT — IKUTI 100%, TIDAK BOLEH BERBEDA:**

Untuk setiap segmen gunakan format berikut PERSIS:

▶ SEGMEN [N] ([X] detik)
Buatkan video realistic karakter [KARAKTER] sedang review [NAMA & DESKRIPSI HASIL RISET YANG DETAIL] dengan gaya [gaya konten], Durasi [DURASI SEGMEN] detik, MULTI SCENE, NO TEXT, CLEAR SUBJECT LOCK ,ANTI BLUR VIDEO , Tiap adegan visual sekitar 2–3 detik, Dialog langsung muncul di opening scene, tanpa intro shot, tanpa jeda.

Tanpa teks, tanpa musik, tanpa watermark, Tone visual real-video realistis seperti konten TikTok, bukan animasi, Variasi sudut kamera wide → medium → close-up, Videonya berkualitas ultra HD 4K keren. Video tertata rapi dari opening, review rasa, penjelasan harga dan varian, sampai closing tanpa terpotong.

[Deskripsi visual adegan 1 — spesifik dan sinematik karakter on-screen, medium shot, berbicara langsung ke kamera], Dialog: "[kalimat dialog 1]"

[Deskripsi visual adegan 2 — visual murni, close-up produk/makanan/fasilitas, NO karakter], Dialog: "[kalimat dialog 2, voice over]"

[Deskripsi visual adegan 3 — visual murni close-up produk/fasilitas unggulan hasil riset], Dialog: "[kalimat dialog 3, voice over]"

[Deskripsi visual adegan 4 — karakter on-screen, close-up wajah atau gesture produk], Dialog: "[kalimat dialog 4]"

[Deskripsi visual adegan 5 — visual murni, angle berbeda dari adegan sebelumnya, NO karakter], Dialog: "[kalimat dialog 5, voice over]"

[Deskripsi visual adegan 6 — visual murni, angle berbeda dari adegan sebelumnya, NO karakter], Dialog: "[kalimat dialog 6, voice over — hanya jika durasi 15 detik]"

[Deskripsi visual adegan 7 — visual murni, closing shot produk/tempat, NO karakter], Dialog: "[kalimat dialog 7, voice over — hanya jika durasi 15 detik]"

--
**CEK WAJIB SEBELUM MENULIS SETIAP ADEGAN:**
Tanya diri sendiri: "Apakah ini adegan 1 atau 2?"
- Jika YA → karakter boleh muncul on-screen
- Jika TIDAK → karakter dilarang muncul dalam bentuk apapun
Jika adegan 3–7 masih ada kata: karakter, [KARAKTER], dia, ia, 
tangannya, wajahnya — HAPUS dan ganti dengan deskripsi produk/tempat.

**ATURAN FORMAT TAMBAHAN (WAJIB):**
- WAJIB awali setiap segmen dengan '▶ SEGMEN [N] ([X] detik)' — ini tidak boleh dihilangkan.
- WAJIB pisahkan setiap segmen dengan '--' di baris baru.
- WAJIB pisahkan beberapa konsep video dengan '*****'.
- JANGAN gunakan format list bertitik atau bernomor di luar struktur adegan.
- Seluruh deskripsi ditulis dalam paragraf naratif yang mengalir.
- DILARANG KERAS menulis teks penjelasan, pendahuluan, konseptualisasi, judul video, atau komentar apapun sebelum maupun sesudah output prompt. Langsung mulai output dengan '▶ SEGMEN 1' atau '*****' tanpa kata pembuka apapun.
- DILARANG KERAS menggunakan tanda kurung kotak [ ] dalam output. 
  Tulis langsung deskripsi visualnya tanpa pembungkus apapun.
  BENAR: "Medium shot karakter berjalan masuk ke kafe,"
  SALAH: "[Medium shot karakter berjalan masuk ke kafe],"

**ATURAN PEMILIHAN HOOK (WAJIB):**
- PILIH SECARA ACAK salah satu hook dari bank yang sesuai kategori — JANGAN selalu ambil yang pertama.
- Setelah memilih, boleh MEMODIFIKASI KREATIF hook tersebut: ubah susunan kata, tambahkan ekspresi natural (contoh: "Eh wait—", "Guys,", "Oke jujur nih,"), atau gabungkan elemen dari dua hook berbeda.
- Inti pesan TIDAK BOLEH berubah (harga lebih murah lewat lokasi bawah).
- Jika menghasilkan lebih dari 1 konten, WAJIB gunakan hook yang BERBEDA di setiap konten. Tidak boleh ada hook yang mirip antar konten.
- **SETIAP KONTEN BARU (setelah *****) adalah video TERPISAH dan INDEPENDEN.**
- **Segmen pertama dari SETIAP konten WAJIB menggunakan hook dari BANK HOOK SEGMEN 1 — bukan hook lanjutan.**
- **Hook lanjutan HANYA untuk segmen 2, 3, dst. dalam konten yang SAMA.**
---

**BANK HOOK SEGMEN 1 — MAKANAN/RESTO:**
-"Serius, kalau kamu klik lokasi di bawah, harganya beda. Lebih hemat dibanding beli langsung di tempat. Jangan skip."
-"Yang datang langsung bayar lebih tinggi. Kalau mau lebih hemat, klik lokasi bawah aja. Sistemnya memang begitu."
-"Langsung klik lokasi bawah ya. Lewat sini harganya lebih bersahabat dibanding pesan langsung di kasir."
-"Biar nggak keluar biaya lebih besar, pesan lewat tag lokasi bawah. Yang beli langsung selalu kena harga lebih tinggi."
-"Jangan beli langsung—lebih tinggi. Klik lokasi bawah, kamu dapat harga yang lebih enak."
-"Beneran beda harganya. Klik lokasi bawah kalau kamu mau versi yang lebih hemat daripada beli di tempat."
-"Kalau kamu klik lokasi bawah, harganya turun. Kalau beli langsung, ya… beda. Pilih yang lebih hemat lah."
-"Aku selalu klik lokasi bawah, soalnya harganya *lebih rendah* daripada pesan langsung. Cobain sendiri."
-"Kalau mau hemat, klik lokasi bawah. Yang beli langsung selalu bayar lebih mahal."
-"Pesan lewat tag lokasi bawah itu harganya lebih bersahabat. Datang langsung? Nggak dapet harga itu."

**BANK HOOK SEGMEN 1 — HOTEL:**
-"Booking lewat lokasi bawah itu harganya lebih rendah daripada walk-in. Mau hemat? Klik lokasi bawah aja."
-"Yang check-in langsung biasanya bayar lebih. Klik lokasi bawah, kamu dapat harga yang lebih ramah."
-"Serius, klik lokasi bawah. Harga di sana jauh lebih hemat dibanding datang langsung ke counter."
-"Kalau kamu booking walk-in, harganya beda. Klik lokasi bawah biar dapat harga yang lebih enak."
-"Jangan langsung datang ya—harga walk-in lebih tinggi. Akses dari lokasi bawah jauh lebih hemat."
-"Hematnya kerasa banget kalau booking lewat lokasi bawah. Walk-in itu lebih mahal."
-"Klik lokasi bawah sebelum booking. Harganya lebih turun dibanding bayar langsung di resepsionis."
-"Aku nggak pernah walk-in karena harganya lebih tinggi. Lokasi bawah selalu lebih hemat."
-"Kalau kamu mau harga yang lebih ringan, booking lewat lokasi bawah. Jangan ambil langsung di tempat."
-"Klik lokasi bawah—di sana harganya lebih lembut. Walk-in itu jauh lebih berat di kantong."

**BANK HOOK SEGMEN 1 — TEMPAT WISATA:**
-"Tiket lewat lokasi bawah itu lebih murah dibanding beli langsung di loket. Klik dulu sebelum datang."
-"Jangan beli on the spot. Loket harganya lebih tinggi. Klik lokasi bawah buat harga yang lebih hemat."
-"Harganya beda ya. Lokasi bawah kasih kamu harga lebih rendah dibanding beli langsung di pintu masuk."
-"Kalau mau hemat, ambil tiket lewat tag lokasi bawah. Yang beli langsung selalu bayar lebih."
-"Klik lokasi bawah. Tiket di sana lebih ramah harga dibanding beli di loket."
-"Tiket online lewat lokasi bawah lebih hemat daripada harga di tempat. Serius, beda banget."
-"Yang beli di loket itu bayar versi lebih mahal. Klik lokasi bawah buat harga yang lebih enak."
-"Ambil tiket lewat lokasi bawah—lebih hemat. Jangan beli langsung kalau nggak mau keluar lebih."
-"Harganya lebih ringan kalau lewat lokasi bawah. Beli langsung di tempat? Pasti lebih tinggi."
-"Klik lokasi bawah untuk dapat harga yang lebih rendah. Loket itu versi yang lebih mahal."

**BANK HOOK LANJUTAN — MAKANAN:**
- "Setelah tadi nyobain bagian pertamanya, sekarang aku mau tunjukin bagian yang bikin menu ini makin menarik."
- "Oke lanjut ya, tadi aku belum sempet bahas isiannya yang melimpah banget."

**BANK HOOK LANJUTAN — HOTEL:**
- "Setelah tadi lihat kamarnya, sekarang aku mau tunjukin fasilitas lainnya."
- "Oke lanjut ya, aku mau bahas bagian hotel yang paling aku suka."

**BANK HOOK LANJUTAN — TEMPAT WISATA:**
- "Setelah tadi lihat spot utamanya, sekarang aku mau tunjukin area lainnya yang nggak kalah keren."
- "Oke lanjut ya, soalnya tempat ini luas dan banyak spot menarik yang sayang dilewatin."
`;

    const systemInstruction = promptMode === 'bebas' ? bebasModeInstruction : rapiModeInstruction;

    // ✅ FIX: Hitung distribusi gaya ke setiap konten
    const count = parseInt(contentCount) || 1;
    const assignedStyles = distributeStyles(count, activeStyles);

    const styleDistribution = assignedStyles
      .map((s, i) => {
        const title = contentStyles.find(cs => cs.id === s)?.title || s;
        return `Konten ${i + 1}: ${title}`;
      })
      .join('\n');

    // ✅ FIX: userPrompt sekarang pakai styleDistribution, bukan satu activeStyle
    const userPrompt = `
Buatkan ${contentCount} konten video yang berbeda berdasarkan detail berikut:

Kategori: ${category}
Nama & Deskripsi Singkat: ${nameDesc}
Karakter: ${character || 'faceless'}
Durasi per Segmen: ${segmentDuration} detik
Total Durasi: ${totalDuration} detik

Distribusi Gaya Konten (WAJIB diikuti persis, setiap konten menggunakan gaya yang ditentukan):
${styleDistribution}
`;

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPrompt, systemInstruction }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Gagal menghubungi server');
      }

      const data = await response.json();
      const rawText: string = data.text;

      // ✅ FIX: Parsing robust — split dari ***** original, bukan replace dulu
      const responseText = rawText
        .replace(/^\[([^\]]+)\],/gm, '$1,')
        .replace(/^\[([^\]]+)\]$/gm, '$1');

      const generatedPrompts = responseText
        .split(/\s*\*{5}\s*/)
        .map((p: string) => p.trim())
        .filter((p: string) => p.includes('▶ SEGMEN'));

      const getStyleTitle = (id: string) =>
        contentStyles.find((s) => s.id === id)?.title || id;

      const formattedPrompts = generatedPrompts.map((prompt: string, i: number) => {
        // ✅ FIX: Ambil style title dari assignedStyles[i], bukan activeStyle tunggal
        const styleTitle = getStyleTitle(assignedStyles[i] || activeStyles[0]);
        const totalSegments = (prompt.match(/▶ SEGMEN/g) || []).length;

        return `═══════════════════════════════════════
KONTEN #${i + 1} — ${styleTitle.toUpperCase()}
═══════════════════════════════════════
Kategori: ${category}
Durasi Target: ${totalDuration} detik (${totalSegments} segmen Sora)

${prompt}`;
      });

      setPrompts(formattedPrompts);
    } catch (error: any) {
      console.error('Error generating prompts:', error);
      setPrompts([`Maaf, terjadi kesalahan: ${error.message}`]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-zinc-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-purple-500">MasterPrompt TikTok GO</h1>
          <p className="text-lg text-purple-300 mt-2">AI pembuat prompt video sinematik untuk konten TikTok GO.</p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Input Section */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4 p-6 bg-gray-800/50 border border-purple-700 rounded-xl">
              <h2 className="text-2xl font-semibold text-yellow-400 border-b border-purple-700 pb-3">⚙️ Mode Prompt</h2>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setPromptMode('bebas')} className={`py-3 px-4 rounded-lg font-semibold transition-all ${promptMode === 'bebas' ? 'bg-yellow-500 text-gray-900' : 'bg-gray-700/50 text-white hover:bg-gray-700'}`}>Bebas</button>
                <button onClick={() => setPromptMode('rapi')} className={`py-3 px-4 rounded-lg font-semibold transition-all ${promptMode === 'rapi' ? 'bg-yellow-500 text-gray-900' : 'bg-gray-700/50 text-white hover:bg-gray-700'}`}>Rapi</button>
              </div>
            </div>

            <div className="flex flex-col gap-6 p-6 bg-gray-800/50 border border-purple-700 rounded-xl">
              <h2 className="text-2xl font-semibold text-yellow-400 border-b border-purple-700 pb-3">📥 Input User</h2>
              <Select label="Kategori" id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option>Makanan/Minuman</option>
                <option>Hotel</option>
                <option>Tempat Wisata</option>
              </Select>
              <Textarea label="Nama & Deskripsi Singkat" id="nameDesc" value={nameDesc} onChange={(e) => setNameDesc(e.target.value)} placeholder="Contoh: Roti Gembul - roti lembut isi selai coklat lumer..." />
              <Input label="Karakter (kosongkan = faceless)" id="character" value={character} onChange={(e) => setCharacter(e.target.value)} placeholder="Contoh: Pria review makanan, gaya santai" />
              <div className="grid grid-cols-3 gap-4">
                <Select label="Durasi per Segmen" id="segmentDuration" value={segmentDuration} onChange={(e) => setSegmentDuration(e.target.value)}>
                  <option value="10">10 detik</option>
                  <option value="15">15 detik</option>
                </Select>
                <Input label="Total Durasi (detik)" id="totalDuration" type="number" step="5" value={totalDuration} onChange={(e) => setTotalDuration(e.target.value)} placeholder="Contoh: 45" />
                <Input label="Jumlah Konten" id="contentCount" type="number" min="1" value={contentCount} onChange={(e) => setContentCount(e.target.value)} placeholder="1" />
              </div>
            </div>

            <div className="flex flex-col gap-4 p-6 bg-gray-800/50 border border-purple-700 rounded-xl">
              {/* ✅ FIX: Label menunjukkan multi-select + info distribusi */}
              <div className="flex items-center justify-between border-b border-purple-700 pb-3">
                <h2 className="text-2xl font-semibold text-yellow-400">🎨 Gaya Konten</h2>
                <span className="text-xs text-purple-300 bg-purple-900/50 px-2 py-1 rounded-md">
                  {activeStyles.length} dipilih · bisa lebih dari 1
                </span>
              </div>

              {/* ✅ FIX: Preview distribusi gaya jika lebih dari 1 dipilih */}
              {activeStyles.length > 1 && parseInt(contentCount) > 1 && (
                <div className="text-xs text-zinc-400 bg-gray-900/50 border border-purple-800 rounded-lg p-3">
                  <p className="text-purple-300 font-semibold mb-1">Distribusi ke {contentCount} konten:</p>
                  {distributeStyles(parseInt(contentCount) || 1, activeStyles).map((s, i) => {
                    const title = contentStyles.find(cs => cs.id === s)?.title || s;
                    return <p key={i}>Konten {i + 1}: {title}</p>;
                  })}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contentStyles.map((style) => (
                  <StyleButton
                    key={style.id}
                    number={style.number}
                    title={style.title}
                    description={style.description}
                    // ✅ FIX: isActive dari array activeStyles
                    isActive={activeStyles.includes(style.id)}
                    onClick={() => toggleStyle(style.id)}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-yellow-500 to-purple-600 text-white font-bold py-4 rounded-lg text-lg hover:from-yellow-400 hover:to-purple-500 transition-all duration-300 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Menghasilkan...' : '✨ Hasilkan Prompt'}
            </button>
          </div>

          {/* Output Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="flex flex-col gap-8">
            <div className="flex justify-between items-center border-b border-purple-700 pb-3">
              <h2 className="text-2xl font-semibold text-yellow-400">🚀 Hasil Prompt</h2>
              {prompts.length > 0 && (
                <button
                  onClick={downloadPrompts}
                  className="flex items-center gap-2 text-sm bg-purple-700 text-zinc-300 px-3 py-1.5 rounded-md hover:bg-purple-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Download All
                </button>
              )}
            </div>

            <div className="flex flex-col gap-6">
              {isLoading && (
                <div className="flex flex-col items-center justify-center h-64 bg-gray-800/50 border border-purple-700 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  <p className="text-zinc-400 text-center transition-opacity duration-500">{loadingText}</p>
                </div>
              )}
              {!isLoading && prompts.length === 0 && (
                <div className="flex items-center justify-center h-64 bg-gray-800/50 border border-dashed border-purple-600 rounded-xl">
                  <p className="text-purple-400 text-center">Hasil prompt akan muncul di sini.</p>
                </div>
              )}

              {prompts.map((prompt, index) => {
                const segments = extractSegments(prompt);

                return (
                  <div key={index} className="flex flex-col gap-3">
                    <div className="relative group">
                      <Textarea
                        id={`prompt-${index}`}
                        value={prompt}
                        onChange={(e) => handlePromptChange(e.target.value, index)}
                        className="h-48"
                      />
                      <button
                        onClick={() => copyPrompt(prompt, index)}
                        className="absolute top-3 right-3 bg-purple-700/80 text-white px-3 py-1.5 rounded-md text-xs transition-all hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 font-semibold"
                      >
                        {copiedIndex === index ? '✓ Tersalin!' : 'Salin Semua'}
                      </button>
                    </div>

                    {segments.length > 0 && (
                      <div className="flex flex-wrap gap-2 px-1">
                        {segments.map((_, segIdx) => {
                          const key = `${index}-${segIdx}`;
                          const isCopied = copiedSegmentKey === key;
                          return (
                            <button
                              key={segIdx}
                              onClick={() => copySegment(prompt, index, segIdx)}
                              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500
                                ${isCopied
                                  ? 'bg-yellow-500 text-gray-900 border-yellow-500'
                                  : 'bg-gray-800 text-zinc-300 border-gray-600 hover:bg-gray-700 hover:border-purple-500 hover:text-white'
                                }`}
                            >
                              {isCopied
                                ? <><span>✓</span><span>Segmen {segIdx + 1} Tersalin!</span></>
                                : <><span>📋</span><span>Salin Segmen {segIdx + 1}</span></>
                              }
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
