export const THEME_STYLES: string = `
:root {
--a11y-bg-color-light: rgb(255 255 255 / 98%);
--a11y-bg-color-dark: rgb(31 31 31 / 98%);
--a11y-bg-color: light-dark(var(--a11y-bg-color-light), var(--a11y-bg-color-dark));

--a11y-text-color-light: #222;
--a11y-text-color-dark: #f0f0f0;
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

--a11y-focus-visible-shadow-light: #444;
--a11y-focus-visible-shadow-dark: #666;
--a11y-focus-visible-shadow: 0 0 0 2px #fff, 0 0 0 4px light-dark(var(--a11y-focus-visible-shadow-light), var(--a11y-focus-visible-shadow-dark));

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

--a11y-disabled-text-color-light: #949494;
--a11y-disabled-text-color-dark: #6d6d6d;
--a11y-disabled-text-color: light-dark(var(--a11y-disabled-text-color-light), var(--a11y-disabled-text-color-dark));

--a11y-disabled-hover-bg-color-light: var(--a11y-hover-bg-color-light);
--a11y-disabled-hover-bg-color-dark: var(--a11y-hover-bg-color-dark);
--a11y-disabled-hover-bg-color: light-dark(var(--a11y-disabled-hover-bg-color-light), var(--a11y-disabled-hover-bg-color-dark));
}

.a11y-theme { color-scheme: light dark; }
.a11y-theme[theme='light'] { color-scheme: light; }
.a11y-theme[theme='dark'] { color-scheme: dark; }

.a11y-visually-hidden:not(:focus):not(:focus-within) {
    border: 0 !important;
    clip: rect(0 0 0 0) !important;
    clip-path: inset(50%) !important;
    height: 1px !important;
    width: 1px !important;
    margin: -1px !important;
    overflow: hidden !important;
    padding: 0 !important;
    position: absolute !important;
    white-space: nowrap !important;
}

.a11y-caret {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    background-color: currentColor;
    mask-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 298 511.93"><path fill-rule="nonzero" d="M70.77 499.85c-16.24 16.17-42.53 16.09-58.69-.15-16.17-16.25-16.09-42.54.15-58.7l185.5-185.03L12.23 70.93c-16.24-16.16-16.32-42.45-.15-58.7 16.16-16.24 42.45-16.32 58.69-.15l215.15 214.61c16.17 16.25 16.09 42.54-.15 58.7l-215 214.46z"/></svg>');
    mask-size: 0.8ch;
    mask-repeat: no-repeat;
    mask-position: center;
    rotate: var(--a11y-caret-rotate, 0deg);
}
.a11y-caret-down {
    --a11y-caret-rotate: 90deg;
}
.a11y-caret-left {
    --a11y-caret-rotate: 180deg;
}
.a11y-caret-up {
    --a11y-caret-rotate: -90deg;
}

.a11y-busy[aria-busy='true'] {
    animation: a11y-busy 500ms ease-in-out infinite alternate;
    cursor: wait;
}

@media (prefers-reduced-motion: reduce) {
    .a11y-busy[aria-busy='true'] { animation: none; opacity: 0.5; }
}

@keyframes a11y-busy {
    0% { opacity: 0.7; }
    100% { opacity: 0.4; }
}

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

.a11y-scrollbar::-webkit-scrollbar-corner,
.a11y-scrollbar *::-webkit-scrollbar-corner {
  background-color: transparent;
}

body[class^='a11y-body-blocked'], body[class*=' a11y-body-blocked'] {
    overflow: hidden !important;
    top: var(--a11y-body-blocked-y) !important;
    left: var(--a11y-body-blocked-x) !important;
    position: fixed !important;
    width: 100% !important;
}
`;
