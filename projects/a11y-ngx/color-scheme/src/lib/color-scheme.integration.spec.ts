import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { Component, ElementRef, ViewChild } from '@angular/core';

import { A11yColorSchemeModule } from './color-scheme.module';
import { ColorSchemeConfig, ColorSchemeCSSMap, ColorSchemesObject } from './color-scheme.type';

const INTEGRATION_TEST_SELECTOR: string = 'color-scheme-integration-test';

const INTEGRATION_TEST_STYLES: ColorSchemesObject = {
    generics: {
        display: 'inline-block',
        position: 'fixed',
        padding: '10px 16px',
        '--test-border-width': '1px',
        '--test-border-style': 'dashed',
        '--test-undefined-prop': undefined,
    },
    schemes: {
        light: {
            bgColor: '#fff',
            color: '#000',
            borderColor: '#aaa',
        },
        dark: {
            bgColor: '#000',
            color: '#fff',
            borderColor: '#555',
        },
        red: {
            bgColor: '#f00',
            color: 'yellow',
            borderColor: '#f00',
            padding: '20px',
        },
        blue: {
            bgColor: '#00f',
            color: 'cyan',
            borderColor: '#00f',
            display: 'inline-flex',
        },
    },
};

const INTEGRATION_TEST_GREEN_SCHEME = {
    green: {
        bgColor: '#0f0',
    },
};

const INTEGRATION_TEST_STYLES_MAP: ColorSchemeCSSMap = {
    display: '--test-display',
    position: '--test-position',
    padding: '--test-padding',
    bgColor: '--test-bg-color',
    color: '--test-color',
    borderColor: '--test-border-color',
};

const INTEGRATION_TEST_COLOR_EQUIVALENCES = {
    light: {
        bgColor: 'rgb(255, 255, 255)',
        color: 'rgb(0, 0, 0)',
        borderColor: 'rgb(170, 170, 170)',
    },
    dark: {
        bgColor: 'rgb(0, 0, 0)',
        color: 'rgb(255, 255, 255)',
        borderColor: 'rgb(85, 85, 85)',
    },
    red: {
        bgColor: 'rgb(255, 0, 0)',
        color: 'rgb(255, 255, 0)',
        borderColor: 'rgb(255, 0, 0)',
    },
    blue: {
        bgColor: 'rgb(0, 0, 255)',
        color: 'rgb(0, 255, 255)',
        borderColor: 'rgb(0, 0, 255)',
    },
    green: {
        bgColor: 'rgb(0, 255, 0)',
    },
};

const INTEGRATION_TEST_SPAN_SELECTOR: string = `${INTEGRATION_TEST_SELECTOR} span`;

const INTEGRATION_TEST_SPAN_STYLES: ColorSchemesObject = {
    schemes: {
        light: { spanColor: 'brown' },
        dark: { spanColor: 'aqua' },
        red: { spanColor: 'orange' },
        blue: { spanColor: 'bisque' },
    },
};
const INTEGRATION_TEST_SPAN_STYLES_MAP: ColorSchemeCSSMap = {
    spanColor: '--test-span-color',
};

const INTEGRATION_TEST_SPAN_COLOR_EQUIVALENCES = {
    light: 'rgb(165, 42, 42)',
    dark: 'rgb(0, 255, 255)',
    red: 'rgb(255, 165, 0)',
    blue: 'rgb(255, 228, 196)',
};

const INTEGRATION_TEST_CONFIG: Readonly<ColorSchemeConfig> = {
    selector: INTEGRATION_TEST_SELECTOR,
    styles: INTEGRATION_TEST_STYLES,
    stylesMap: INTEGRATION_TEST_STYLES_MAP,
};

const INTEGRATION_TEST_CONFIG_SPAN: Readonly<ColorSchemeConfig> = {
    selector: INTEGRATION_TEST_SPAN_SELECTOR,
    styles: INTEGRATION_TEST_SPAN_STYLES,
    stylesMap: INTEGRATION_TEST_SPAN_STYLES_MAP,
};

@Component({
    selector: INTEGRATION_TEST_SELECTOR,
    template: '<ng-content></ng-content>',
    host: { '[style]': 'styles' },
})
export class TestColorSchemeComponent {
    readonly styles = {
        display: 'var(--test-display)',
        position: 'var(--test-position)',
        inset: 'auto 10px 10px auto',
        padding: 'var(--test-padding)',
        backgroundColor: 'var(--test-bg-color)',
        color: 'var(--test-color)',
        border: 'var(--test-border-width) var(--test-border-style) var(--test-border-color)',
    };

    constructor(public host: ElementRef<HTMLElement>) {}
}

@Component({
    template: `
        <${INTEGRATION_TEST_SELECTOR}>
            <span #testSpan>integration test</span>
        </${INTEGRATION_TEST_SELECTOR}>
    `,
    styles: ['span { color: var(--test-span-color) }'],
})
export class TestColorSchemeFinalComponent {
    @ViewChild(TestColorSchemeComponent, { static: true }) public testComponent: TestColorSchemeComponent;
    @ViewChild('testSpan', { static: true }) public testSpan: ElementRef<HTMLSpanElement>;
}

describe('Color Scheme Integration', () => {
    let elementMain: HTMLElement;
    let elementSpan: HTMLSpanElement;
    let stylesMain: CSSStyleDeclaration;
    let stylesSpan: CSSStyleDeclaration;
    let fixture: ComponentFixture<TestColorSchemeFinalComponent>;

    const isSystemSchemeDark: boolean = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentScheme: string = isSystemSchemeDark ? 'dark' : 'light';
    const schemes: string[] = Object.keys(INTEGRATION_TEST_STYLES.schemes).map((key: string) => key);

    const getStylesheet = (): string =>
        (document.getElementById(`${INTEGRATION_TEST_SELECTOR}-styles`) as HTMLStyleElement).innerHTML;

    const initStuff = (): void => {
        fixture = TestBed.createComponent(TestColorSchemeFinalComponent);
        elementMain = fixture.componentInstance.testComponent.host.nativeElement;
        elementSpan = fixture.componentInstance.testSpan.nativeElement;
        stylesMain = getComputedStyle(elementMain);
        stylesSpan = getComputedStyle(elementSpan);
        fixture.detectChanges();
    };

    beforeEach(() => localStorage.removeItem('a11y.colorScheme'));
    afterEach(() => {
        elementMain.removeAttribute('color-scheme');
        elementSpan.removeAttribute('color-scheme');
    });

    describe('Check set color scheme without forcing a scheme', () => {
        beforeEach(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [TestColorSchemeComponent, TestColorSchemeFinalComponent],
                imports: [A11yColorSchemeModule.setColorScheme(INTEGRATION_TEST_CONFIG)],
            }).compileComponents();

            initStuff();
        }));

        it('should verify the stylesheet has the right amount as of schemes plus the generics', () => {
            const styles: string[] = getStylesheet().split(':not([color-scheme])');
            expect(styles.length).toBe(Object.keys(INTEGRATION_TEST_STYLES.schemes).length + 1); // +1 for the generics.
        });

        it('should verify the applied styles for the current system scheme', () => {
            const colors = INTEGRATION_TEST_COLOR_EQUIVALENCES[currentScheme];

            expect(stylesMain.backgroundColor).toEqual(colors.bgColor);
            expect(stylesMain.color).toEqual(colors.color);
            expect(stylesMain.borderColor).toEqual(colors.borderColor);
            expect(stylesMain.borderWidth).toEqual('1px');
            expect(stylesMain.borderStyle).toEqual('dashed');
            expect(stylesMain.display).toEqual('block'); // the computed style is different from the established.
            expect(stylesMain.position).toEqual('fixed');
            expect(stylesMain.padding).toEqual('10px 16px');
        });

        schemes.forEach((scheme: string) => {
            it(`should verify the applied styles are "${scheme}" when forcing the scheme locally`, () => {
                elementMain.setAttribute('color-scheme', scheme);
                const colors = INTEGRATION_TEST_COLOR_EQUIVALENCES[scheme];
                const padding: string = scheme === 'red' ? '20px' : '10px 16px';
                const display: string = scheme === 'blue' ? 'flex' : 'block'; // the computed style is different from the established.

                expect(stylesMain.backgroundColor).toEqual(colors.bgColor);
                expect(stylesMain.color).toEqual(colors.color);
                expect(stylesMain.borderColor).toEqual(colors.borderColor);
                expect(stylesMain.padding).toEqual(padding);
                expect(stylesMain.display).toEqual(display);
            });
        });

        it(`should verify the applied styles are "light" when the forced scheme locally does not exist`, () => {
            elementMain.setAttribute('color-scheme', 'purple');
            const colors = INTEGRATION_TEST_COLOR_EQUIVALENCES.light;

            expect(stylesMain.backgroundColor).toEqual(colors.bgColor);
            expect(stylesMain.color).toEqual(colors.color);
            expect(stylesMain.borderColor).toEqual(colors.borderColor);
        });
    });

    describe('Check set color scheme with a forced scheme', () => {
        beforeEach(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [TestColorSchemeComponent, TestColorSchemeFinalComponent],
                imports: [
                    A11yColorSchemeModule.setColorScheme({
                        ...INTEGRATION_TEST_CONFIG,
                        forceScheme: 'red',
                    }),
                ],
            }).compileComponents();

            initStuff();
        }));

        it('should verify the stylesheet has only the "red" scheme plus the generics', () => {
            const styles: string = getStylesheet();
            expect(styles.includes(':not([color-scheme])')).toBe(false);

            const stylesRed = INTEGRATION_TEST_STYLES.schemes.red;
            expect(styles.includes(`:${stylesRed.bgColor};`)).toBe(true);
            expect(styles.includes(`:${stylesRed.borderColor};`)).toBe(true);
            expect(styles.includes(`:${stylesRed.color};`)).toBe(true);

            // The override value for padding.
            expect(styles.includes(`--test-padding:${stylesRed.padding};`)).toBe(true);
            expect(styles.includes(`--test-padding:${INTEGRATION_TEST_STYLES.generics.padding};`)).toBe(false);

            const colorsLight = INTEGRATION_TEST_STYLES.schemes.light;
            expect(styles.includes(`:${colorsLight.bgColor};`)).toBe(false);
            expect(styles.includes(`:${colorsLight.borderColor};`)).toBe(false);
            expect(styles.includes(`:${colorsLight.color};`)).toBe(false);

            const stylesProps: string[] = styles.split('--');
            const stylesGenerics = { ...INTEGRATION_TEST_STYLES.generics };
            delete stylesGenerics['--test-undefined-prop']; // The undefined item

            const stylesPropsLength: number = Object.keys({
                ...stylesGenerics,
                ...INTEGRATION_TEST_STYLES.schemes.light,
            }).length;

            // -1 because the first one is the selector.
            expect(stylesProps.length - 1).toBe(stylesPropsLength);
        });

        const colorsRed = INTEGRATION_TEST_COLOR_EQUIVALENCES.red;

        schemes.forEach((scheme: string) => {
            it(`should verify the applied styles are "red" when forcing "${scheme}" locally`, () => {
                elementMain.setAttribute('color-scheme', scheme);

                expect(stylesMain.backgroundColor).toEqual(colorsRed.bgColor);
                expect(stylesMain.color).toEqual(colorsRed.color);
                expect(stylesMain.borderColor).toEqual(colorsRed.borderColor);
            });
        });
    });

    describe('Check set color scheme with a forced scheme that does not exist', () => {
        beforeEach(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [TestColorSchemeComponent, TestColorSchemeFinalComponent],
                imports: [
                    A11yColorSchemeModule.setColorScheme({
                        ...INTEGRATION_TEST_CONFIG,
                        forceScheme: 'purple',
                    }),
                ],
            }).compileComponents();

            initStuff();
        }));

        it('should verify the stylesheet has only the "light" scheme (since "purple" does not exist) plus the generics', () => {
            const styles: string = getStylesheet();
            expect(styles.includes(':not([color-scheme])')).toBe(false);

            const colorsLight = INTEGRATION_TEST_STYLES.schemes.light;
            expect(styles.includes(`:${colorsLight.bgColor};`)).toBe(true);
            expect(styles.includes(`:${colorsLight.borderColor};`)).toBe(true);
            expect(styles.includes(`:${colorsLight.color};`)).toBe(true);

            const stylesProps: string[] = styles.split('--');
            const stylesGenerics = { ...INTEGRATION_TEST_STYLES.generics };
            delete stylesGenerics['--test-undefined-prop']; // The undefined item

            const stylesPropsLength: number = Object.keys({
                ...stylesGenerics,
                ...INTEGRATION_TEST_STYLES.schemes.light,
            }).length;

            // -1 because the first one is the selector.
            expect(stylesProps.length - 1).toBe(stylesPropsLength);
        });

        const colorsLight = INTEGRATION_TEST_COLOR_EQUIVALENCES.light;

        schemes
            .filter((scheme: string) => scheme !== 'light')
            .forEach((scheme: string) => {
                it(`should verify the applied styles are "light" when forcing "${scheme}" locally`, () => {
                    elementMain.setAttribute('color-scheme', scheme);

                    expect(stylesMain.backgroundColor).toEqual(colorsLight.bgColor);
                    expect(stylesMain.color).toEqual(colorsLight.color);
                    expect(stylesMain.borderColor).toEqual(colorsLight.borderColor);
                });
            });
    });

    describe('Check set color scheme with a forced scheme with missing properties', () => {
        const INTEGRATION_TEST_STYLES_NEW = JSON.parse(JSON.stringify(INTEGRATION_TEST_STYLES));
        INTEGRATION_TEST_STYLES_NEW.schemes = {
            ...INTEGRATION_TEST_STYLES_NEW.schemes,
            ...INTEGRATION_TEST_GREEN_SCHEME,
        };

        beforeEach(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [TestColorSchemeComponent, TestColorSchemeFinalComponent],
                imports: [
                    A11yColorSchemeModule.setColorScheme({
                        ...{
                            ...INTEGRATION_TEST_CONFIG,
                            styles: INTEGRATION_TEST_STYLES_NEW,
                        },
                        forceScheme: 'green',
                    }),
                ],
            }).compileComponents();

            initStuff();
        }));

        it('should verify the stylesheet has only the mix of "green" & "light" schemes (since "green" is incomplete) plus the generics', () => {
            const styles: string = getStylesheet();
            expect(styles.includes(':not([color-scheme])')).toBe(false);

            const colorsGreen = INTEGRATION_TEST_STYLES_NEW.schemes.green;
            const colorsLight = INTEGRATION_TEST_STYLES_NEW.schemes.light;

            expect(styles.includes(`:${colorsGreen.bgColor};`)).toBe(true);
            expect(styles.includes(`:${colorsLight.borderColor};`)).toBe(true);
            expect(styles.includes(`:${colorsLight.color};`)).toBe(true);
        });

        const colorsGreen = INTEGRATION_TEST_COLOR_EQUIVALENCES.green;
        const colorsLight = INTEGRATION_TEST_COLOR_EQUIVALENCES.light;

        schemes.forEach((scheme: string) => {
            it(`should verify the applied styles are "light" when forcing "${scheme}" locally`, () => {
                elementMain.setAttribute('color-scheme', scheme);

                expect(stylesMain.backgroundColor).toEqual(colorsGreen.bgColor);
                expect(stylesMain.color).toEqual(colorsLight.color);
                expect(stylesMain.borderColor).toEqual(colorsLight.borderColor);
            });
        });
    });

    describe('Check set multiple color schemes without forcing a scheme', () => {
        beforeEach(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [TestColorSchemeComponent, TestColorSchemeFinalComponent],
                imports: [
                    A11yColorSchemeModule.setColorScheme([INTEGRATION_TEST_CONFIG, INTEGRATION_TEST_CONFIG_SPAN]),
                ],
            }).compileComponents();

            initStuff();
        }));

        it('should verify the applied styles for the current system scheme', () => {
            const color = INTEGRATION_TEST_SPAN_COLOR_EQUIVALENCES[currentScheme];
            expect(stylesSpan.color).toEqual(color);
        });

        schemes.forEach((scheme: string) => {
            it(`should verify the applied styles are "${scheme}" when forcing the scheme locally`, () => {
                elementSpan.setAttribute('color-scheme', scheme);
                const color = INTEGRATION_TEST_SPAN_COLOR_EQUIVALENCES[scheme];
                expect(stylesSpan.color).toEqual(color);
            });
        });

        it(`should verify the applied styles are "light" when the forced scheme locally does not exist`, () => {
            elementSpan.setAttribute('color-scheme', 'purple');
            const color = INTEGRATION_TEST_SPAN_COLOR_EQUIVALENCES.light;
            expect(stylesSpan.color).toEqual(color);
        });
    });

    describe('Check set multiple color schemes with a forced scheme', () => {
        beforeEach(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [TestColorSchemeComponent, TestColorSchemeFinalComponent],
                imports: [
                    A11yColorSchemeModule.setColorScheme([
                        INTEGRATION_TEST_CONFIG,
                        { ...INTEGRATION_TEST_CONFIG_SPAN, forceScheme: 'blue' },
                    ]),
                ],
            }).compileComponents();

            initStuff();
        }));

        const color = INTEGRATION_TEST_SPAN_COLOR_EQUIVALENCES.blue;

        schemes
            .filter((scheme: string) => scheme !== 'blue')
            .forEach((scheme: string) => {
                it(`should verify the applied styles are "blue" when forcing "${scheme}" locally`, () => {
                    elementSpan.setAttribute('color-scheme', scheme);
                    expect(stylesSpan.color).toEqual(color);
                });
            });
    });

    describe('Check set multiple color schemes with a forced scheme that does not exist', () => {
        beforeEach(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [TestColorSchemeComponent, TestColorSchemeFinalComponent],
                imports: [
                    A11yColorSchemeModule.setColorScheme([
                        INTEGRATION_TEST_CONFIG,
                        { ...INTEGRATION_TEST_CONFIG_SPAN, forceScheme: 'purple' },
                    ]),
                ],
            }).compileComponents();

            initStuff();
        }));

        const color = INTEGRATION_TEST_SPAN_COLOR_EQUIVALENCES.light;

        schemes
            .filter((scheme: string) => scheme !== 'light')
            .forEach((scheme: string) => {
                it(`should verify the applied styles are "light" when forcing "${scheme}" locally`, () => {
                    elementSpan.setAttribute('color-scheme', scheme);
                    expect(stylesSpan.color).toEqual(color);
                });
            });
    });
});
