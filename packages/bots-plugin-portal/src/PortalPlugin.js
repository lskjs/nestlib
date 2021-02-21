import BaseBotPlugin from '@lskjs/bots-plugin';
import Bluebird from 'bluebird';
import isFunction from 'lodash/isFunction';

const canonizeRule = (rule) => rule;
const canonizeRules = (rules = []) => rules.map(canonizeRule).filter(Boolean);

export default class PortalPlugin extends BaseBotPlugin {
  providers = ['telegram', 'discord'];
  async init() {
    await super.init();
    this.rules = canonizeRules(this.config.rules);
  }
  runBot(bot) {
    // const rules = canonizeRules(this.config.rules); // this.config = {chats};
    // this.log.trace({ rules });
    const { rules } = this;
    bot.on('message', async (ctx) => {
      // const userId = bot.getMessageUserId(ctx);
      const userId = bot.getMessageChatId(ctx);
      const chatId = bot.getMessageChatId(ctx);
      const text = bot.getMessageText(ctx);
      const messageType = bot.getMessageType(ctx);
      const pack = { userId, chatId, text, messageType };
      // console.log(pack);

      const activeRules = rules
        .filter((rule) => {
          if (!rule.where) return true;
          if (isFunction(rule.where) && rule.where(pack)) return true;
          if (rule.where === userId || rule.where === chatId) return true;
          return false;
        })
        .filter((rule) => {
          if (!rule.when) return true;
          if (rule.when.text && rule.when.text === text) return true;
          return false;
        });

      // this.log.trace({ activeRules });
      await Bluebird.map(activeRules, (rule) => {
        let { then: thens } = rule;
        if (!thens) return null;
        if (!Array.isArray(thens)) thens = [thens];
        return Bluebird.map(thens, (then) => {
          if (then.action === 'reply') {
            return bot.reply(ctx, then.text);
          }
          if (then.action === 'sendMessage') {
            return bot.sendMessage(then.to, then.text);
          }
          if (then.action === 'repost') {
            return bot.repost(then.to, ctx);
          }

          return false;
        });
      });
    });
  }
}