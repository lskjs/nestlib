import BaseApi from './Api';
import IndexApi from './IndexApi';

export default class RootApi extends BaseApi {
  getRoutes() {
    return {
      ...super.getRoutes(),
      '/api': IndexApi,
      '*': this.any.bind(this),
    };
  }
  any(req, res) {
    res.send('🦒');
  }
}