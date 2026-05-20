const formatConsoleMsg = (msg: string): string => msg.replace(/ {2,}/g, '');

export const libName: string = 'A11y Keyboard Navigation';

export const ERROR_ITEMS_NOT_PROVIDED = (): string => {
    const msg: string = `
        ${libName}:
        You have not provided any items.
        Please use the "setItems()" method to provide the array of items you need to navigate.
    `;
    return formatConsoleMsg(msg);
};

export const ERROR_KEYS_NOT_PROVIDED = (): string => {
    const msg: string = `
        ${libName}:
        You have not provided any keys to navigate in your custom strategy.
        Please use the "keys", "keysHorizontal" and/or "keysVertical" properties
        within the "customStrategy" object to provide the keys and actions you need.
    `;
    return formatConsoleMsg(msg);
};
