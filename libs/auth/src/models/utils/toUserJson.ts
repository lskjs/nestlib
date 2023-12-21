import { getGravatarHash } from './getGravatarHash';

export function getUserAvatar(user: any) {
  const avatar = user?.info?.avatar;
  if (avatar) return avatar;
  if (user.email) {
    const transparentPixel = 'https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png';
    const hash = getGravatarHash(user.email);
    const s = 200;
    const d = encodeURIComponent(transparentPixel);
    return `https://gravatar.com/avatar/${hash}?s=${s}&d=${d}`;
  }
  return null;
}

export function toUserJson(rawUser: any) {
  const _id = String(rawUser._id || rawUser.id);
  const name = [rawUser.info?.firstName, rawUser.info?.lastName].filter(Boolean).join(' ');
  return {
    _id,
    ...rawUser,
    name,
    avatar: getUserAvatar(rawUser),
  };
}
