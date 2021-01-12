import Markup from 'telegraf/markup';
// import keyBy from 'lodash/keyBy';
import uniqBy from 'lodash/uniqBy';
import BaseBotPlugin from './BaseBotPlugin';
import createKeyboard from '../utils/createKeyboard';

export class MenuBotPlugin extends BaseBotPlugin {
  providers = ['telegram'];

  getButton(element, itemValue = 'none') {
    const { type, title, value } = element;
    const config = value === 'array' ? [title, itemValue] : [title, value];
    const btn = type === 'url' ? Markup.urlButton(...config) : Markup.callbackButton(...config);
    return btn;
  }

  async getMenu(key, itemValue) {
    const { BotsMenuModel } = this.app.models;
    const menu = await BotsMenuModel.findOne({ key }).select(['content', 'buttonsLayout']).lean();
    if (!menu) return [];
    const buttonsLayout = menu.buttonsLayout.map((element) => {
      if (Array.isArray(element)) {
        const buttons = element.map((item) => this.getButton(item, itemValue));
        return buttons;
      }
      return this.getButton(element, itemValue);
    });
    const keyboard = Markup.inlineKeyboard(buttonsLayout).extra();
    return [menu.content.text, keyboard];
  }

  async onMenu({ bot, ctx, path, route: menu }) {
    if (!menu) {
      this.log.warn('!menu', path);
      return false;
    }
    this.log.trace('menu', path, menu);
    const { content, keyboard } = menu;

    let extra = {};
    if (keyboard) {
      extra = createKeyboard(keyboard).extra();
      // console.log('extra', extra.reply_markup.inline_keyboard);
    }
    await bot.replyContent(ctx, content, extra);
    return true;
  }

  async getRoutes() {
    return this.menus.map(({ path, ...other }) => ({
      path,
      action: this.onMenu.bind(this),
      ...other,
    }));
  }

  async init() {
    await super.init();
    this.menus = await this.getMenus();
  }

  async run() {
    await super.run();
    this.menus = await this.getMenus();
  }

  async getMenus() {
    const configMenus = (this.config && this.config.menus) || [];
    return uniqBy( //eslint-disable-line
      [...configMenus, ...this(await this.getMenusFromDb())],
      (m) => m.path,
    );
  }
  getMenusFromDb() {
    try {
      const { MenuModel } = this.app.models;
      return MenuModel.find();
    } catch (err) {
      this.log.error('getMenusFromDb', err);
      return [];
    }
  }
  // run() {
  //   super.run();
  //   const { type, title, value } = element;
  //   const config = value === 'array' ? [title, itemValue] : [title, value];
  //   const btn = type === 'url' ? Markup.urlButton(...config) : Markup.callbackButton(...config);
  //   return btn;
  // }
}

export default MenuBotPlugin;
