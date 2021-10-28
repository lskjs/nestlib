import { isDev } from '@lskjs/env';
import Module from '@lskjs/module';
import asyncMapValues from '@lskjs/utils/asyncMapValues';
import flatten from 'lodash/flatten';
import max from 'lodash/max';
import uniq from 'lodash/uniq';
import uniqBy from 'lodash/uniqBy';

import { collectMetrics } from './collectMetrics';
import { Proxy } from './Proxy';
import { setProxyWorker } from './setProxyWorker';
import { filterProxy } from './utils/filterProxy';

const isDebug = isDev;
export class ProxyModule extends Module {
  getModules() {
    return {
      ...super.getModules(),
      providers: [import('@lskjs/module/asyncModules'), { items: this.providers, config: this.config.providers }],
      tests: [import('./ProxyTests'), { tests: this.tests, config: this.config.tests }],
    };
  }
  async runProvidersMethod(method, ...args) {
    const providers = await this.module('providers.*');
    return asyncMapValues(providers, (provider) => provider[method](...args));
  }
  async getProxyStats(proxyList) {
    const tests = await this.module('tests');
    return tests.getProxyStats(proxyList);
  }
  async getAllProxyList({ localhost = false } = {}) {
    const res = await this.runProvidersMethod('getList');
    let listOfLists = Object.values(res).map((a) => a.list);
    if (isDebug) listOfLists = listOfLists.map((l) => l.slice(0, 2));
    const rawProxyList = uniqBy(flatten(listOfLists), 'key');
    if (localhost) return [new Proxy({ provider: 'localhost' }), ...rawProxyList];
    return rawProxyList;
  }
  async fetchProxyList() {
    const res = await this.runProvidersMethod('fetchList');
    const proxies = flatten(Object.values(res));
    return proxies;
  }
  async getProxyTestsResults() {
    const tests = await this.module('tests');
    return tests.getResults();
  }
  async runProxyTests(proxyList) {
    const tests = await this.module('tests');
    // eslint-disable-next-line no-param-reassign
    if (!proxyList) proxyList = await this.getAllProxyList({ localhost: true });
    return tests.runTests(proxyList);
  }
  async getList(filter = {}) {
    const res = await this.runProvidersMethod('getList');
    const fetchedAt = max(Object.values(res).map((a) => a.fetchedAt));
    let proxyList = await this.getAllProxyList();
    const proxyStats = await this.getProxyStats(proxyList);
    proxyList = proxyList.map((p) => {
      // TODO: как-то облагородить
      const proxyTests = proxyStats[p.key] || [];
      const testIds = proxyTests.map((t) => t?.test?.id);
      const tagsList = proxyTests.map((t) => t?.test?.tags);
      const testTags = uniq([].concat(...tagsList));
      // eslint-disable-next-line no-param-reassign
      p.targets = testTags;
      // eslint-disable-next-line no-param-reassign
      p.tests = testIds;
      return p;
    });
    setProxyWorker(proxyList, this.config.workers);
    // const testedAt = max(Object.values(proxyStats).map((p) => p.updatedAt));
    // console.log({testedAt}, Object.values(proxyStats).map((p) => p.updatedAt))

    const filteredProxyList = filterProxy(proxyList, filter);
    return {
      fetchedAt,
      // testedAt,
      total: proxyList.length,
      count: filteredProxyList.length,
      list: filteredProxyList,
    };
  }
  async updateProxyList() {
    // TODO: mutex
    this.log.trace('[updateProxyList] start');
    const res = await this.runProvidersMethod('update');
    this.log.debug('[updateProxyList]', res);
  }
  async updateProxyTests() {
    // TODO: mutex
    this.log.trace('[updateProxyTests] start');
    const res = await this.runProxyTests(); // All proxies
    this.log.debug(
      '[updateProxyTests]',
      res.map(({ id, status }) => `${id}: ${status}`),
    );
  }
  async buyProxies() {
    // TODO: mutex
    this.log.trace('[buyProxies] nothing');
  }

  async metrics() {
    return collectMetrics.call(this);
  }
}

export default ProxyModule;