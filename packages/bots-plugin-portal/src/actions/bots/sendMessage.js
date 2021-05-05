import Bluebird from 'bluebird';

export default async function sendMessage({ to, ...params }) {
  if (!to) throw '!to';
  const chats = Array.isArray(to) ? to : [to];
  return Bluebird.map(chats, async (chat) => this.bot.sendMessage(chat, params.text || params));
}
