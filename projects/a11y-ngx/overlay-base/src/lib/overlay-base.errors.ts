const formatConsoleMsg = (msg: string): string => msg.replace(/ {2,}/g, '');

export const ERROR_NO_TRIGGER_PROVIDED = (): string => {
    const msg: string = `
        A11y Overlay Base:
        No Trigger element or DOMRect provided!
    `;
    return formatConsoleMsg(msg);
};
