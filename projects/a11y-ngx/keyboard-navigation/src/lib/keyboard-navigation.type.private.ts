import type {
    KeyboardNavigationConfig,
    KeyboardNavigationType,
    KeyboardNavigationStrategy,
    KeyboardNavigationKey,
    KeyboardNavigationAction,
} from './keyboard-navigation.type';

export const NAVIGATION_DEFAULT: KeyboardNavigationConfig = {
    type: 'menu',
    throttleMs: 100,
    pageSize: 10,
    disabledProperty: 'disabled',
    childrenProperty: 'children',
    allowNavigateDisabled: false,
    allowSelectFirstChild: false,
    allowRepeatedEventsFor: [],
    orientation: 'horizontal',
    customStrategy: undefined,
};

export type KeyboardNavigationStrategyConfig = Record<KeyboardNavigationType, KeyboardNavigationStrategy>;

export const NAVIGATION_STRATEGIES: KeyboardNavigationStrategyConfig = {
    custom: { loop: false, keys: {} },
    dropdown: {
        loop: false,
        keys: {
            ArrowUp: 'previous',
            ArrowDown: 'next',
            Home: 'first',
            End: 'last',
            PageUp: 'pageUp',
            PageDown: 'pageDown',
        },
    },
    menubar: {
        loop: true,
        keys: {
            Enter: 'open',
            Home: 'first',
            End: 'last',
        },
        keysHorizontal: {
            ArrowLeft: 'previous',
            ArrowRight: 'next',
            ArrowUp: 'open',
            ArrowDown: 'open',
        },
        keysVertical: {
            ArrowUp: 'previous',
            ArrowDown: 'next',
            ArrowLeft: 'open',
            ArrowRight: 'open',
        },
    },
    menu: {
        loop: true,
        keys: {
            ArrowUp: 'previous',
            ArrowDown: 'next',
            ArrowLeft: 'close',
            ArrowRight: 'open',
            Escape: 'close',
            Enter: 'open',
            Home: 'first',
            End: 'last',
        },
    },
    tabs: {
        loop: true,
        keys: {
            Home: 'first',
            End: 'last',
            Space: 'open',
            Enter: 'open',
        },
        keysHorizontal: {
            ArrowLeft: 'previous',
            ArrowRight: 'next',
        },
        keysVertical: {
            ArrowUp: 'previous',
            ArrowDown: 'next',
        },
    },
    toolbar: {
        loop: true,
        keys: {
            Home: 'first',
            End: 'last',
        },
        keysHorizontal: {
            ArrowLeft: 'previous',
            ArrowRight: 'next',
        },
        keysVertical: {
            ArrowUp: 'previous',
            ArrowDown: 'next',
        },
    },
    radio: {
        loop: true,
        keys: {
            ArrowUp: 'previous',
            ArrowDown: 'next',
            ArrowLeft: 'previous',
            ArrowRight: 'next',
        },
    },
    slider: {
        loop: false,
        keys: {
            ArrowLeft: 'previous',
            ArrowDown: 'previous',
            ArrowUp: 'next',
            ArrowRight: 'next',
            Home: 'first',
            End: 'last',
            PageUp: 'pageDown',
            PageDown: 'pageUp',
        },
    },
    tree: {
        loop: false,
        keys: {
            ArrowUp: 'previous',
            ArrowDown: 'next',
            ArrowLeft: 'close',
            ArrowRight: 'open',
            Home: 'first',
            End: 'last',
        },
    },
};

export type KeyboardNavigationKeysType = Partial<Record<KeyboardNavigationKey, KeyboardNavigationAction>>;
