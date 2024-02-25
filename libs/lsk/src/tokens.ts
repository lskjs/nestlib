export const LSK_MODULE_OPTIONS = 'LSK_MODULE_OPTIONS';

export const getLskModuleToken = (ns?: string) => ['lsk', ns].filter(Boolean).join(':');
