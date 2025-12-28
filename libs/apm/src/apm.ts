import { loadConfigSync } from '@lsk4/config';
import apm from 'elastic-apm-node';
import type { AgentConfigOptions } from 'elastic-apm-node';
import { log } from './log';
import { omitNull } from '@lsk4/algos';

const isFalse = (value: string | undefined) => {
  if (!value) return false;
  const falsyValues = ['false', '0', 'no', 'off'];
  return falsyValues.includes(value.toLowerCase());
};


export interface ApmInitOptions {
  config?: AgentConfigOptions;
  active?: boolean;
}

/**
 * Initialize APM agent
 * @param options - APM initialization options
 */
export function initApm(options: ApmInitOptions = {}): typeof apm {
  const { config: providedConfig, active: providedActive } = options;

  // Try to load config from .env file
  let configFromFile: any = {};
  try {
    // TODO: подумать как лучше это хакать
    const { config } = loadConfigSync<{ apm: any }>('.env');
    configFromFile = config?.apm || {};
  } catch (error) {
    // Config file not found or invalid, continue with defaults
  }

  // Merge configs: provided config > config from file > environment variables
  const apmConfig: AgentConfigOptions = {
    ...configFromFile,
    ...providedConfig,
    serviceName:
      process.env.ELASTIC_APM_SERVICE_NAME ||
      providedConfig?.serviceName ||
      configFromFile?.serviceName,
    environment:
      process.env.ELASTIC_APM_ENVIRONMENT ||
      providedConfig?.environment ||
      configFromFile?.environment,
  };

  // Determine if APM should be active
  const isActive =
    providedActive !== undefined
      ? providedActive
      : configFromFile?.active !== undefined
        ? configFromFile.active
        : !isFalse(process.env.ELASTIC_APM_ACTIVE);

  if (isActive) {
    log.trace('[APM] Starting APM with config:', omitNull({
      active: isActive,
      env_active: process.env.ELASTIC_APM_ACTIVE,
      service_name: apmConfig.serviceName,
      environment: apmConfig.environment,
    }));
    apm.start(apmConfig);
    log.trace('[APM] APM started successfully, isStarted:', apm.isStarted());
  } else {
    log.trace('[APM] APM is disabled');
  }

  return apm;
}

export default apm;




