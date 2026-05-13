const formatConsoleMsg = (msg: string): string => msg.replace(/ {2,}/g, '');

export const libName: string = 'A11y Icon';

export const ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE = (): string => {
    const msg: string = `
        ${libName}:
        A11yIconModule.rootConfig() has been called more than once.
        Please, use this method just one time at a root level to establish the global config for the Icon's strategy to use in your project.
    `;
    return formatConsoleMsg(msg);
};

export const ERROR_SERVICE_PROVIDED_MORE_THAN_ONCE = (serviceClass: string): string => {
    const msg: string = `
        ${libName}:
        ${serviceClass} is a singleton and has been provided more than once.
        Please remove the service from any 'providers' array you may have added it to.
    `;
    return formatConsoleMsg(msg);
};

export const ERROR_WRONG_TOKEN = (): string => {
    const msg: string = `
        ${libName}:
        The given token within your provider is incorrect!
        Please provide:
        1. A TemplateRef<unknown> (for "custom" provider only).
        2. An object with a component: e.g. \`{ component: MyComponent, mainEntry: 'content' }\`.
        3. The string 'image'.
    `;
    return formatConsoleMsg(msg);
};
