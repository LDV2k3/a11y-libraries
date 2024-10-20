import { formatConsoleMsg } from './color-scheme.service';

const PROJECT_NAME: string = 'A11y Color Scheme';

export const ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE = (): string => {
    const msg: string = `
        ${PROJECT_NAME}:
        A11yColorSchemeModule.rootConfig() has been called more than once.
        Please, use this method just one time at a root level to establish the global config for the Color Schemes used in your project.
    `;
    return formatConsoleMsg(msg);
};

export const ERROR_SERVICE_PROVIDED_MORE_THAN_ONCE = (serviceName: string): string => {
    const msg: string = `
        ${PROJECT_NAME}:
        ${serviceName} is a singleton and has been provided more than once.
        Please remove the service from any 'providers' array you may have added it to.
    `;
    return formatConsoleMsg(msg);
};

export const ERROR_INIT_CUSTOM_CONFIG_SELECTOR_NOT_ALLOWED = (): string => {
    const msg: string = `
        ${PROJECT_NAME}:
        You can not use 'root' or ':root' as a selector.
        Please choose another name for it.
    `;
    return formatConsoleMsg(msg);
};

export const ERROR_FORCED_SCHEME_SELECTOR_NOT_FOUND = (forceColorScheme: string, selector: string): string => {
    const msg: string = `
        ${PROJECT_NAME}:
        The chosen forced scheme '${forceColorScheme}' for the selector '${selector}' was not found in the schemes object within the given config.
        The 'light' scheme will be used instead as default.
    `;
    return formatConsoleMsg(msg);
};
