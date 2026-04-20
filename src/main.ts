import { LumenPilgrimageApp } from './app/LumenPilgrimageApp';

const mount = document.querySelector<HTMLDivElement>('#app');
if (!mount) {
  throw new Error('Missing #app mount point');
}

new LumenPilgrimageApp(mount);
