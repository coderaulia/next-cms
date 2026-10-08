import type { Tour } from './ScreenTour';

// Screen-recorded tours of the real Vanaila site (recordings: public/recordings/*.webm).
// Captions are timed in seconds from the start of the recording part.
export const tours: Tour[] = [
  {
    id: 'tour-site-home',
    video: 'site-home.webm',
    recordingSeconds: 12,
    kicker: 'Tur 15 detik',
    title: 'Website bisnis yang <i>dibangun</i> untuk tumbuh.',
    captions: [
      { at: 0.5, text: 'Website, software & sistem bisnis' },
      { at: 4, text: 'Studi kasus nyata dari klien' },
      { at: 8, text: 'Cepat, SEO-ready, mudah di-update' },
    ],
    cta: 'Mau website <i>seperti ini</i>?',
    sub: 'Konsultasi gratis — kami bantu dari nol sampai live.',
  },
  {
    id: 'tour-site-hris',
    video: 'site-hris.webm',
    recordingSeconds: 12,
    kicker: 'Vanaila HRIS',
    title: 'KPI, kompetensi & surat HR — <i>satu</i> record.',
    captions: [
      { at: 0.5, text: 'Ganti spreadsheet HR yang menumpuk' },
      { at: 4, text: 'KPI Management dengan approval manajer' },
      { at: 8, text: 'PKWT, PKWTT, SK langsung jadi PDF' },
    ],
    cta: 'Lihat <i>demo</i> HRIS-nya.',
    sub: 'Request demo untuk tim HR-mu lewat link di profil.',
  },
  {
    id: 'tour-site-flowraze',
    video: 'site-flowraze.webm',
    recordingSeconds: 12,
    kicker: 'Flowraze CRM',
    title: 'CRM yang menunjukkan apa yang <i>mendorong</i> revenue.',
    captions: [
      { at: 0.5, text: 'Leads, deals & tim dalam satu sistem' },
      { at: 4, text: 'Dashboard performa real-time' },
      { at: 8, text: 'Dibuat untuk tim sales UMKM Indonesia' },
    ],
    cta: 'Tim sales-mu masih pakai <i>Excel</i>?',
    sub: 'Coba Flowraze — link di profil.',
  },
  {
    id: 'tour-site-psikotest',
    video: 'site-psikotest.webm',
    recordingSeconds: 12,
    kicker: 'Psikotest',
    title: 'Psikotes online: <i>21</i> instrumen, satu link.',
    captions: [
      { at: 0.5, text: 'Untuk HR & praktisi berlisensi' },
      { at: 4, text: 'Undang kandidat lewat link' },
      { at: 8, text: 'Interpretasi oleh praktisi berlisensi' },
    ],
    cta: 'Rekrutmen tanpa <i>kertas</i>.',
    sub: 'Request demo Psikotest lewat link di profil.',
  },
  {
    id: 'tour-site-templates',
    video: 'site-templates.webm',
    recordingSeconds: 10,
    kicker: 'Vanaila Templates',
    title: 'Bukan tema. <i>Sistem.</i>',
    captions: [
      { at: 0.5, text: 'Template siap pakai per industri' },
      { at: 4, text: 'Desain, motion & tipografi lengkap' },
      { at: 7, text: 'Bisa di-upgrade ke custom kapan saja' },
    ],
    cta: 'Launch minggu ini, <i>bukan</i> kuartal depan.',
    sub: 'Lihat koleksi template lewat link di profil.',
  },
];
