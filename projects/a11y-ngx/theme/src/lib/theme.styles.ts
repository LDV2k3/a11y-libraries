export const THEME_STYLES: string = `
:root {
--a11y-bg-color-light: rgb(255 255 255 / 98%);
--a11y-bg-color-dark: rgb(31 31 31 / 98%);
--a11y-bg-color: light-dark(var(--a11y-bg-color-light), var(--a11y-bg-color-dark));

--a11y-text-color-light: #222;
--a11y-text-color-dark: #fff;
--a11y-text-color: light-dark(var(--a11y-text-color-light), var(--a11y-text-color-dark));

--a11y-text-color-secondary-light: #5f5f5f;
--a11y-text-color-secondary-dark: #bcbcbc;
--a11y-text-color-secondary: light-dark(var(--a11y-text-color-secondary-light), var(--a11y-text-color-secondary-dark));

--a11y-border-color-light: #656565;
--a11y-border-color-dark: #666;
--a11y-border-color: light-dark(var(--a11y-border-color-light), var(--a11y-border-color-dark));

--a11y-shadow: 5px 5px 10px -5px;

--a11y-shadow-color-light: #444;
--a11y-shadow-color-dark: #444;
--a11y-shadow-color: light-dark(var(--a11y-shadow-color-light), var(--a11y-shadow-color-dark));

--a11y-focus-visible-shadow-light: 0 0 0 2px #fff, 0 0 0 4px #444;
--a11y-focus-visible-shadow-dark: 0 0 0 2px #fff, 0 0 0 4px #666;
--a11y-focus-visible-shadow: light-dark(var(--a11y-focus-visible-shadow-light), var(--a11y-focus-visible-shadow-dark));

--a11y-focus-visible-outline-light: #7d7d7d;
--a11y-focus-visible-outline-dark: #828282;
--a11y-focus-visible-outline: light-dark(var(--a11y-focus-visible-outline-light), var(--a11y-focus-visible-outline-dark));

--a11y-focus-visible-outline-size: 2px;

--a11y-hover-bg-color-light: #ddd;
--a11y-hover-bg-color-dark: #393939;
--a11y-hover-bg-color: light-dark(var(--a11y-hover-bg-color-light), var(--a11y-hover-bg-color-dark));

--a11y-hover-text-color-light: var(--a11y-text-color-light);
--a11y-hover-text-color-dark: var(--a11y-text-color-dark);
--a11y-hover-text-color: light-dark(var(--a11y-hover-text-color-light), var(--a11y-hover-text-color-dark));

--a11y-disabled-bg-color-light: transparent;
--a11y-disabled-bg-color-dark: transparent;
--a11y-disabled-bg-color: light-dark(var(--a11y-disabled-bg-color-light), var(--a11y-disabled-bg-color-dark));

--a11y-disabled-text-color-light: #aaa;
--a11y-disabled-text-color-dark: #999;
--a11y-disabled-text-color: light-dark(var(--a11y-disabled-text-color-light), var(--a11y-disabled-text-color-dark));

--a11y-disabled-hover-bg-color-light: var(--a11y-hover-bg-color-light);
--a11y-disabled-hover-bg-color-dark: var(--a11y-hover-bg-color-dark);
--a11y-disabled-hover-bg-color: light-dark(var(--a11y-disabled-hover-bg-color-light), var(--a11y-disabled-hover-bg-color-dark));

.a11y-theme { color-scheme: light dark; }
.a11y-theme[theme='light'] { color-scheme: light; }
.a11y-theme[theme='dark'] { color-scheme: dark; }

@supports not selector(::-webkit-scrollbar) {
    .a11y-scrollbar,
    .a11y-scrollbar * {
        scrollbar-width: thin;
        scrollbar-color: var(--a11y-disabled-text-color) transparent;
    }
}

.a11y-scrollbar::-webkit-scrollbar,
.a11y-scrollbar *::-webkit-scrollbar {
    height: 5px;
    width: 5px;
}

.a11y-scrollbar::-webkit-scrollbar-track,
.a11y-scrollbar *::-webkit-scrollbar-track {
    border-radius: 10px;
}

.a11y-scrollbar::-webkit-scrollbar-thumb,
.a11y-scrollbar *::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background-color: var(--a11y-disabled-text-color);
}

body[class^='a11y-body-blocked'], body[class*=' a11y-body-blocked'] {
    overflow: hidden !important;
    top: var(--a11y-body-blocked-y) !important;
    left: var(--a11y-body-blocked-x) !important;
    position: fixed !important;
    width: 100% !important;
}
}
`;
