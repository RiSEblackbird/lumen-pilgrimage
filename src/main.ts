import { AppBootstrap } from './bootstrap/AppBootstrap';

const mount = document.querySelector<HTMLDivElement>('#app');
if (!mount) {
  throw new Error('Missing #app mount point');
}

new AppBootstrap(mount).start();
