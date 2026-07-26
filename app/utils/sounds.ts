const SOUND_FILES = {
  holyjesusO: '/1.mp3',
  eewO: '/2.mp3',
  wedontS: '/3.mp3',
  mydisappO: '/4.mp3',
  ooupniR: '/5.mp3',
  oyowtfO: '/6.mp3',
  waitaS: '/7.mp3',
  emotionalO: '/8.mp3',
  youbrokeO: '/9.mp3',
  idontR: '/10.mp3',
  indianO: '/11.mp3',
  laidesO: '/12.mp3',
  stopitS: '/13.mp3',
  imeanO: '/14.mp3',
  wedonotS: '/15.mp3',
} as const;

type SoundKey = keyof typeof SOUND_FILES;

const cache = new Map<SoundKey, HTMLAudioElement>();

export function playSound(key: SoundKey, volume = 0.7) {
  if (typeof window === 'undefined') return;
  try {
    let audio = cache.get(key);
    if (!audio) {
      audio = new Audio(SOUND_FILES[key]);
      cache.set(key, audio);
    }
    audio.currentTime = 0;
    audio.volume = volume;
    audio.play().catch(() => {});  
  } catch {

  }
}