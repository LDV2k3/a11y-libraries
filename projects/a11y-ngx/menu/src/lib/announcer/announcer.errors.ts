const formatConsoleMsg = (msg: string): string => msg.replace(/ {2,}/g, '');

export const libName: string = 'A11y Live Announcer';

export const ERROR_SERVICE_PROVIDED_MORE_THAN_ONCE = (serviceClass: string): string => {
    const msg: string = `
        ${libName}:
        ${serviceClass} is a singleton and has been provided more than once.
        Please remove the service from any 'providers' array you may have added it to.
    `;
    return formatConsoleMsg(msg);
};
