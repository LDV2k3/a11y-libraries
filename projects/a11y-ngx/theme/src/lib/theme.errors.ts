const formatConsoleMsg = (msg: string): string => msg.replace(/ {2,}/g, '');

export const libName: string = 'A11y Theme';

export const ERROR_SERVICE_PROVIDED_MORE_THAN_ONCE = (serviceClass: string): string => {
    const msg: string = `
        ${libName}:
        ${serviceClass} is a singleton and has been provided more than once.
        Please remove the service from any 'providers' array you may have added it to.
    `;
    return formatConsoleMsg(msg);
};

export const ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE = (): string => {
    const msg: string = `
        ${libName}:
        A11yThemeModule.rootConfig() or provideA11yTheme() has been called more than once.
        Please, use this method just one time at a root level to establish the global Theme used in your project.
    `;
    return formatConsoleMsg(msg);
};
