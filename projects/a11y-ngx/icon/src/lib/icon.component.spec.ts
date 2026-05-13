import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By, DomSanitizer } from '@angular/platform-browser';

import { Component, ViewChild, TemplateRef, Input, Provider, DebugElement, SecurityContext } from '@angular/core';
import { CommonModule } from '@angular/common';

import { A11yIconModule } from './icon.module';
import { IconComponent } from './icon.component';

import {
    ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE,
    ERROR_SERVICE_PROVIDED_MORE_THAN_ONCE,
    ERROR_WRONG_TOKEN,
} from './icon.errors';

import { initIconRootConfigFactory } from './icon.module.providers.private';
import { ICON_CUSTOM_STRATEGY, provideA11yIcon, provideCustomA11yIcon } from './icon.module.providers';

import { IconService } from './icon.service';

import type { Icon, IconCustomStrategy, IconDefaultComponent, IconGlobalStrategy } from './icon.type';

@Component({ providers: [IconService] })
class TestIconDuplicatedServiceComponent {
    constructor(private service: IconService) {}
}

@Component({
    selector: 'a11y-test-icon',
    template: `
        <ng-container *ngIf="icon; else theNgContent">
            <em>{{ icon }}</em>
        </ng-container>
        <ng-template #theNgContent><ng-content></ng-content></ng-template>
    `,
})
class TestIconComponent {
    @Input() icon: string | undefined = undefined;
}

@Component({
    template: `
        <a11y-icon [icon]="icon" [label]="label"></a11y-icon>
        <ng-template #template>template text</ng-template>
        <ng-template #templateString let-text>{{ text }}</ng-template>
    `,
})
class TestIconMainComponent {
    icon: Icon | undefined;
    label!: string;
    @ViewChild(IconComponent) iconComp!: IconComponent;
    @ViewChild('template') templateRef!: TemplateRef<unknown>;
    @ViewChild('templateString') templateStringRef!: TemplateRef<unknown>;
}

describe('A11y Icon', () => {
    let component: TestIconMainComponent;
    let fixture: ComponentFixture<TestIconMainComponent>;
    let a11yEl: DebugElement;
    let image!: DebugElement;
    let testIcon!: DebugElement;

    const getImage = (): void => {
        getDebugEl();
        image = a11yEl.query(By.css('img'));
    };

    const getTestIcon = (): void => {
        getDebugEl();
        testIcon = a11yEl.query(By.css('a11y-test-icon'));
    };

    const setupTestBed = async (providers: Provider[] = []): Promise<void> => {
        await TestBed.configureTestingModule({
            declarations: [TestIconMainComponent, TestIconComponent],
            imports: [CommonModule, A11yIconModule],
            providers,
        }).compileComponents();

        setupComponent();
    };

    const setupTestBedStrategy = async (strategy: IconGlobalStrategy, useModule: boolean): Promise<void> => {
        await TestBed.configureTestingModule({
            declarations: [TestIconMainComponent, TestIconComponent],
            imports: [CommonModule, useModule ? A11yIconModule.rootConfig({ strategy }) : A11yIconModule],
            providers: [...(!useModule ? [provideA11yIcon({ strategy })] : [])],
        }).compileComponents();

        setupComponent();
    };

    const setupTestBedCustomStrategy = async (
        strategy: IconGlobalStrategy,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        factory: (...args: any[]) => IconCustomStrategy,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        deps?: any[]
    ): Promise<void> => {
        const providers: Provider[] = [];

        if (deps) providers.push({ provide: deps[0], useClass: deps[0] });
        providers.push(provideCustomA11yIcon(factory, deps));

        await TestBed.configureTestingModule({
            declarations: [TestIconMainComponent, TestIconComponent],
            imports: [CommonModule, A11yIconModule.rootConfig({ strategy })],
            providers,
        }).compileComponents();

        setupComponent();
    };

    const setupComponent = (): void => {
        fixture = TestBed.createComponent(TestIconMainComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    };

    const setIcon = (icon: Icon): void => {
        component.icon = icon;
        fixture.detectChanges();
    };

    const getDebugEl = (): void => {
        a11yEl = fixture.debugElement.query(By.css('a11y-icon'));
    };

    beforeEach(async () => await setupTestBed());

    describe('Should check the type "string"', () => {
        it('should set the type as "string" when a simple string is passed', () => {
            const sanitizer: DomSanitizer = TestBed.inject(DomSanitizer);

            setIcon('<i></i>');
            expect(component.iconComp.iconType).toBe('string');

            const resolvedHtml: string | null = sanitizer.sanitize(SecurityContext.HTML, component.iconComp.stringIcon);
            expect(resolvedHtml).toBe('<i></i>');

            getDebugEl();
            const span: DebugElement = a11yEl.query(By.css('span'));
            expect(span).toBeTruthy();
            expect(span.query(By.css('i'))).toBeTruthy();
        });

        it('should set the type as "string" when the html object is passed', () => {
            const sanitizer: DomSanitizer = TestBed.inject(DomSanitizer);

            setIcon({ html: 'hello' });
            expect(component.iconComp.iconType).toBe('string');

            const resolvedHtml: string | null = sanitizer.sanitize(SecurityContext.HTML, component.iconComp.stringIcon);
            expect(resolvedHtml).toBe('hello');

            getDebugEl();
            const span: DebugElement = a11yEl.query(By.css('span'));
            expect(span).toBeTruthy();
            expect(span.nativeElement.textContent).toEqual('hello');
        });
    });

    it('should set the type as "component"', () => {
        setIcon({ component: TestIconComponent });
        expect(component.iconComp['iconStrategyComponent']).toBeUndefined();
        expect(component.iconComp.iconType).toBe('component');

        getTestIcon();
        expect(testIcon).toBeTruthy();
        expect(testIcon.nativeElement.textContent).toEqual('');
    });

    it('should set the type as "image"', () => {
        const imageSrc: string = '../image.png';
        setIcon({ src: imageSrc });
        expect(component.iconComp.iconType).toBe('image');

        getImage();
        expect(image).toBeTruthy();
        expect(image.attributes.src).toEqual(imageSrc);
    });

    it('should set the type as "template-ref"', () => {
        setIcon(component.templateRef);
        expect(component.iconComp.iconType).toBe('template-ref');

        getDebugEl();
        expect(a11yEl.nativeElement.textContent).toEqual('template text');
    });

    describe('Should check with "TemplateRef" token', () => {
        let templateRef!: TemplateRef<unknown>;

        beforeEach(async () => {
            TestBed.resetTestingModule();
            templateRef = fixture.componentInstance.templateStringRef;
            await setupTestBed([{ provide: ICON_CUSTOM_STRATEGY, useValue: templateRef }]);
        });

        it('should set the type as "template"', () => {
            const value: string = 'text for the template ref string';
            setIcon(value);
            expect(component.iconComp['iconStrategyTemplate']).toBe(templateRef);
            expect(component.iconComp.iconType).toBe('template');

            getDebugEl();
            expect(a11yEl.nativeElement.textContent).toEqual(value);

            setIcon({ src: './test.png' });
            expect(component.iconComp['iconStrategyTemplate']).toBeUndefined();
        });
    });

    describe('Should check with "default component" token', () => {
        describe('Should check main entry as "content"', () => {
            beforeEach(async () => {
                TestBed.resetTestingModule();
                await setupTestBed([
                    {
                        provide: ICON_CUSTOM_STRATEGY,
                        useValue: { component: TestIconComponent, mainEntry: 'content' },
                    },
                ]);
            });

            it('should set the type as "component"', () => {
                const value: string = 'some content';
                setIcon(value);

                const defaultComponent = component.iconComp['iconStrategyComponent'];
                expect(defaultComponent).not.toBeUndefined();
                expect(defaultComponent?.component).toBeDefined();
                expect(defaultComponent?.content).toEqual(value);
                expect(defaultComponent?.inputs).toEqual({});
                expect(component.iconComp.iconType).toBe('component');

                getTestIcon();
                expect(testIcon).toBeTruthy();
                expect(testIcon.query(By.css('em'))).toBeFalsy();
                expect(testIcon.nativeElement.textContent).toEqual(value);

                setIcon({ src: './test.png' });
                expect(component.iconComp['iconStrategyComponent']).toBeUndefined();
            });
        });

        describe('Should check main entry as "input"', () => {
            describe('Should check with NO inputs already defined', () => {
                beforeEach(async () => {
                    TestBed.resetTestingModule();
                    await setupTestBed([
                        {
                            provide: ICON_CUSTOM_STRATEGY,
                            useValue: { component: TestIconComponent, mainEntry: 'input', inputName: 'icon' },
                        },
                    ]);
                });

                it('should set the type as "component"', () => {
                    const value: string = 'home input 1';
                    setIcon(value);

                    const defaultComponent = component.iconComp['iconStrategyComponent'];
                    expect(defaultComponent).not.toBeUndefined();
                    expect(defaultComponent?.component).toBe(TestIconComponent);
                    expect(defaultComponent?.inputs).toEqual({ icon: value });
                    expect(defaultComponent?.content).toBeUndefined();
                    expect(component.iconComp.iconType).toBe('component');

                    getTestIcon();
                    expect(testIcon).toBeTruthy();
                    expect(testIcon.query(By.css('em'))).toBeTruthy();
                    expect(testIcon.nativeElement.textContent).toEqual(value);
                });
            });

            describe('Should check with extra inputs already defined', () => {
                beforeEach(async () => {
                    TestBed.resetTestingModule();
                    await setupTestBed([
                        {
                            provide: ICON_CUSTOM_STRATEGY,
                            useValue: {
                                component: TestIconComponent,
                                mainEntry: 'input',
                                inputName: 'icon',
                                inputs: { something: 'yes' },
                            },
                        },
                    ]);
                });

                it('should set the type as "component"', () => {
                    const value: string = 'home input 2';
                    setIcon(value);

                    const defaultComponent = component.iconComp['iconStrategyComponent'];
                    expect(defaultComponent).not.toBeUndefined();
                    expect(defaultComponent?.component).toBeDefined();
                    expect(defaultComponent?.inputs).toEqual({ icon: value, something: 'yes' });
                    expect(defaultComponent?.content).toBeUndefined();
                    expect(component.iconComp.iconType).toBe('component');

                    getTestIcon();
                    expect(testIcon).toBeTruthy();
                    expect(testIcon.query(By.css('em'))).toBeTruthy();
                    expect(testIcon.nativeElement.textContent).toEqual(value);
                });
            });
        });
    });

    it('should update the icon appropriately', () => {
        getDebugEl();

        // Create first icon (component with content)
        setIcon({ component: TestIconComponent, content: 'home' });
        getTestIcon();
        expect(testIcon).toBeTruthy();
        expect(testIcon.nativeElement.textContent).toEqual('home');

        // Update to second icon (updated the content)
        setIcon({ component: TestIconComponent, content: 'share' });
        getTestIcon();
        expect(testIcon).toBeTruthy();
        expect(testIcon.nativeElement.textContent).toEqual('share');

        // Update to third icon (no more content, now inputs)
        setIcon({ component: TestIconComponent, inputs: { icon: 'download' } });
        getTestIcon();
        expect(testIcon).toBeTruthy();
        expect(testIcon.nativeElement.textContent).toEqual('download');

        // Update to fourth icon (updated the inputs)
        setIcon({ component: TestIconComponent, inputs: { icon: 'upload' } });
        getTestIcon();
        expect(testIcon).toBeTruthy();
        expect(testIcon.nativeElement.textContent).toEqual('upload');

        // Update to fifth icon (no more component, now a string)
        setIcon('save');
        getTestIcon();
        expect(testIcon).toBeFalsy();
        expect(a11yEl.nativeElement.textContent).toEqual('save');

        // Update to sixth icon (no more string, now a template ref)
        setIcon(component.templateRef);
        expect(a11yEl.nativeElement.textContent).toEqual('template text');

        // Update to seventh icon (no more template ref, now a string from "src")
        setIcon({ src: './menu.jpg' });
        const image: DebugElement = a11yEl.query(By.css('img'));
        expect(image.attributes.src).toEqual('./menu.jpg');

        // Update to eighth icon (no more "src", now a string from "html")
        setIcon({ html: 'menu' });
        expect(a11yEl.nativeElement.textContent).toEqual('menu');
    });

    describe('Should check with "image" token', () => {
        beforeEach(async () => {
            TestBed.resetTestingModule();
            await setupTestBed([{ provide: ICON_CUSTOM_STRATEGY, useValue: 'image' }]);
        });

        it('should set the type as "image"', () => {
            const imageSrc: string = '../token-image.png';
            setIcon(imageSrc);
            expect(component.iconComp['iconStrategyImage']).toBe(true);
            expect(component.iconComp.iconType).toBe('image');

            getImage();
            expect(image).toBeTruthy();
            expect(image.attributes.src).toEqual(imageSrc);

            setIcon({ component: TestIconComponent });
            expect(component.iconComp['iconStrategyImage']).toBe(false);
        });
    });

    describe('Should check with wrong token', () => {
        beforeEach(async () => {
            TestBed.resetTestingModule();
            await setupTestBed([{ provide: ICON_CUSTOM_STRATEGY, useValue: 'whatever' }]);
        });

        it('should throw an error when checking for the token', () => {
            const spyOnConsoleWarn = spyOn(console, 'error');

            setIcon('home.png');
            expect(spyOnConsoleWarn).toHaveBeenCalledWith(ERROR_WRONG_TOKEN());
        });
    });

    describe('Should check the host attributes', () => {
        describe('Should check the "role" attribute', () => {
            it('should have the "role" attribute NOT set when label is not provided', () => {
                getDebugEl();
                expect(a11yEl.attributes.role).toBeUndefined();
            });

            it('should have the "role" attribute set to "img" when a label is provided', () => {
                component.label = 'the label';
                fixture.detectChanges();
                getDebugEl();
                expect(a11yEl.attributes.role).toBe('img');
            });
        });

        describe('Should check the "aria-label" attribute', () => {
            it('should have the "aria-label" attribute NOT set when label is not provided', () => {
                getDebugEl();
                expect(a11yEl.attributes['aria-label']).toBeUndefined();
            });

            it('should have the "aria-label" attribute set when a label is provided', () => {
                component.label = 'the label';
                fixture.detectChanges();
                getDebugEl();
                expect(a11yEl.attributes['aria-label']).toBe('the label');
            });
        });

        describe('Should check the "aria-hidden" attribute', () => {
            it('should have the "aria-hidden" attribute NOT set when label is not provided', () => {
                getDebugEl();
                expect(a11yEl.attributes['aria-hidden']).toBe('true');
            });

            it('should have the "aria-hidden" attribute set when a label is provided', () => {
                component.label = 'the label';
                fixture.detectChanges();
                getDebugEl();
                expect(a11yEl.attributes['aria-hidden']).toBeUndefined();
            });
        });
    });

    describe('Should check the "rootConfig()" method & "provideA11yIcon" function', () => {
        describe('Should check the "component" strategy', () => {
            beforeEach(async () => {
                TestBed.resetTestingModule();
                await setupTestBedStrategy(
                    { component: TestIconComponent, mainEntry: 'input', inputName: 'icon' },
                    true
                );
            });

            it('should set the type as "component"', () => {
                const value: string = 'home input 1';
                setIcon(value);

                const defaultComponent = component.iconComp['iconStrategyComponent'];
                expect(defaultComponent).not.toBeUndefined();
                expect(defaultComponent?.component).toBe(TestIconComponent);
                expect(defaultComponent?.inputs).toEqual({ icon: value });
                expect(defaultComponent?.content).toBeUndefined();
                expect(component.iconComp.iconType).toBe('component');

                getTestIcon();
                expect(testIcon).toBeTruthy();
                expect(testIcon.query(By.css('em'))).toBeTruthy();
                expect(testIcon.nativeElement.textContent).toEqual(value);
            });
        });

        describe('Should check the "image" strategy', () => {
            beforeEach(async () => {
                TestBed.resetTestingModule();
                await setupTestBedStrategy('image', false);
            });

            it('should set the type as "image" and then to "component"', () => {
                const imageSrc: string = '../token-image.png';
                setIcon(imageSrc);
                expect(component.iconComp['iconStrategyImage']).toBe(true);
                expect(component.iconComp.iconType).toBe('image');

                getImage();
                expect(image).toBeTruthy();
                expect(image.attributes.src).toEqual(imageSrc);

                setIcon({ component: TestIconComponent });
                expect(component.iconComp['iconStrategyImage']).toBe(false);
                expect(component.iconComp.iconType).toBe('component');
            });
        });

        describe('Should check the "basePath" property', () => {
            const basePath: string = '/assets/icons/';
            const imageSrc: string = 'base-path-image.png';

            beforeEach(async () => {
                TestBed.resetTestingModule();
                await TestBed.configureTestingModule({
                    declarations: [TestIconMainComponent, TestIconComponent],
                    imports: [CommonModule, A11yIconModule.rootConfig({ basePath, strategy: 'image' })],
                }).compileComponents();

                setupComponent();
            });

            it('should set the image source path using "basePath" and the given "imageSrc"', () => {
                setIcon(imageSrc);
                getImage();

                expect(image.attributes.src).toEqual(basePath + imageSrc);
            });

            it('should set the image source path using only the given "imageSrc" when "ignoreBasePath" is set to true', () => {
                setIcon({ src: imageSrc, ignoreBasePath: true });
                getImage();

                expect(image.attributes.src).toEqual(imageSrc);
            });
        });

        describe('Should check the "rootConfig()" method not being called twice', () => {
            let service!: IconService;

            beforeEach(() => {
                TestBed.resetTestingModule();
                TestBed.configureTestingModule({
                    imports: [
                        A11yIconModule.rootConfig({
                            strategy: {
                                component: TestIconComponent,
                                mainEntry: 'input',
                                inputName: 'icon',
                            },
                        }),
                    ],
                });
                service = TestBed.inject(IconService);
            });

            it('should throw the error if invoked more than once', () => {
                expect(() => initIconRootConfigFactory(service, { strategy: 'image' })).toThrowError(
                    ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE()
                );
            });
        });
    });

    describe('Should check the "provideCustomA11yIcon" function', () => {
        describe('Check with Dependencies', () => {
            beforeEach(async () => {
                class MockMyService {
                    theStrategy: IconDefaultComponent = {
                        component: TestIconComponent,
                        mainEntry: 'input',
                        inputName: 'icon',
                    };
                }

                TestBed.resetTestingModule();
                await setupTestBedCustomStrategy('image', (service: MockMyService) => service.theStrategy, [
                    MockMyService,
                ]);
            });

            it('should set the type as "component"', () => {
                const value: string = 'home input 1';
                setIcon(value);

                const defaultComponent = component.iconComp['iconStrategyComponent'];
                expect(defaultComponent).not.toBeUndefined();
                expect(defaultComponent?.component).toBe(TestIconComponent);
                expect(defaultComponent?.inputs).toEqual({ icon: value });
                expect(defaultComponent?.content).toBeUndefined();
                expect(component.iconComp.iconType).toBe('component');

                getTestIcon();
                expect(testIcon).toBeTruthy();
                expect(testIcon.query(By.css('em'))).toBeTruthy();
                expect(testIcon.nativeElement.textContent).toEqual(value);
            });
        });

        describe('Check without Dependencies', () => {
            beforeEach(async () => {
                TestBed.resetTestingModule();
                await setupTestBedCustomStrategy(
                    { component: TestIconComponent, mainEntry: 'input', inputName: 'icon' },
                    () => 'image'
                );
            });

            it('should set the type as "image"', () => {
                const imageSrc: string = '../custom-token-image.png';
                setIcon(imageSrc);
                expect(component.iconComp['iconStrategyImage']).toBe(true);
                expect(component.iconComp.iconType).toBe('image');

                getImage();
                expect(image).toBeTruthy();
                expect(image.attributes.src).toEqual(imageSrc);

                setIcon({ component: TestIconComponent });
                expect(component.iconComp['iconStrategyImage']).toBe(false);
            });
        });
    });

    describe('Should check the service provided more than once error', () => {
        beforeEach(() => {
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                declarations: [TestIconDuplicatedServiceComponent],
                providers: [IconService],
            });
        });

        it('should throw error when provided more than once', () => {
            expect(() => TestBed.createComponent(TestIconDuplicatedServiceComponent)).toThrowError(
                ERROR_SERVICE_PROVIDED_MORE_THAN_ONCE('IconService')
            );
        });
    });
});
