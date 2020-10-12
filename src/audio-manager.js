export default class AudioManager {
  constructor() {
    this.sounds = {};
    this.music = {};
  }

  loadSound(key, url) {
    this.sounds[key] = new Audio(url);
  }

  playSound(key) {
    if (!this.sounds[key]) {
      throw new Error(`Unknown sound: ${key}`);
    }
    const node = this.sounds[key].cloneNode();
    node.play();
  }

  playMusic(key) {
    if (!this.music[key]) {
      this.music[key] = this.sounds[key].cloneNode();
    }
    this.music[key].play();
  }

  stopMusic(key) {
    if (this.music[key]) {
      this.music[key].pause();
    }
  }
}
