import { useEffect } from 'react';

const BACKGROUNDS = {
  accueil:     'linear-gradient(160deg,#0A0A0A 0%,#140414 45%,#1f0a14 75%,#280d1a 100%)',
  programme:   'linear-gradient(160deg,#0A0A0A 0%,#0d0a00 40%,#1a1208 70%,#2d1f08 100%)',
  formules:    'linear-gradient(160deg,#0d0a00 0%,#2d1a08 40%,#5a3810 70%,#8B5E20 100%)',
  apropos:     'linear-gradient(160deg,#1a0510 0%,#2d0d1a 35%,#4a1528 65%,#6b1f38 100%)',
  temoignages: 'linear-gradient(160deg,#0A0A0A 0%,#0d0a00 40%,#1a1408 70%,#2d2010 100%)',
  faq:         'linear-gradient(160deg,#0A0A0A 0%,#0f0d00 50%,#1f1a08 100%)',
  contact:     'linear-gradient(160deg,#0d0800 0%,#2d1a08 40%,#6b4020 70%,#9a6030 100%)',
  brunch:      'linear-gradient(160deg,#1a1208 0%,#3d2808 40%,#7a5015 70%,#a07020 100%)',
  carte:       'linear-gradient(160deg,#1a0510 0%,#3d1020 40%,#6b1a38 70%,#8B2050 100%)',
  store:       'linear-gradient(160deg,#0A0A0A 0%,#1a1208 40%,#2d1f08 70%,#4a3010 100%)',
  communaute:  'linear-gradient(160deg,#140014 0%,#1f0a1f 40%,#2d1428 70%,#4a1840 100%)',
  live:        'linear-gradient(160deg,#000814 0%,#0a1428 40%,#142040 70%,#1a2d5a 100%)',
  don:         'linear-gradient(160deg,#0d0800 0%,#1f1408 40%,#3d2810 70%,#6b4820 100%)',
  aura:        'linear-gradient(160deg,#2A1506 0%,#4A2510 35%,#7A4A1A 65%,#C9A96A 100%)',
  auth:        'linear-gradient(160deg,#0A0A0A 0%,#140414 50%,#1f0a14 100%)',
  admin:       'linear-gradient(160deg,#0A0A0A 0%,#0d0a00 50%,#1a1208 100%)',
  notfound:    'linear-gradient(160deg,#0A0A0A 0%,#050508 50%,#0a0a14 100%)',
};

export default function usePageBackground(page) {
  useEffect(() => {
    const bg = BACKGROUNDS[page] || BACKGROUNDS.accueil;
    document.body.style.background = bg;
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.minHeight = '100vh';
    return () => {
      document.body.style.background = '';
      document.body.style.backgroundAttachment = '';
      document.body.style.minHeight = '';
    };
  }, [page]);
}
