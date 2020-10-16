export const isDev = () => process.env.NODE_ENV === 'development';

export const getSearch = () => {
  const { search } = window.location;
  return new URLSearchParams(search ? search.slice(1) : '');
};

export const getUserId = () => {
  const uidGot = getSearch().get('vk_user_id') || '';
  return (!uidGot && isDev() ? '463377' : uidGot);
};

export const getAppId = () => {
  const aidGot = getSearch().get('vk_app_id') || '';
  return (!aidGot && isDev() ? '7402641' : aidGot);
};

export const getPlatform = () => {
  const p = getSearch().get('vk_platform');
  return (!p && isDev() ? 'local' : p);
};

export const getHash = () => {
  const { hash } = window.location;
  return hash ? hash.slice(1) : '';
};

export const drawImage = (imageSrc, x, y, w, h) => new Promise((resolve) => {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    if (w && h) ctx.drawImage(img, x, y, w, h);
    else ctx.drawImage(img, x, y);
    resolve();
  };
  img.src = imageSrc;
});
