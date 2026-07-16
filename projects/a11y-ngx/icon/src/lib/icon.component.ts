import {
    Component,
    Input,
    OnChanges,
    Inject,
    Optional,
    SimpleChanges,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    TemplateRef,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { ERROR_WRONG_TOKEN } from './icon.errors';
import { ICON_CUSTOM_STRATEGY } from './icon.module.providers';

import { IconService } from './icon.service';

import type { IconType, IconDefaultEntryInput } from './icon.type.private';
import type {
    Icon,
    IconInputHTML,
    IconInputImage,
    IconInputTemplate,
    IconInputComponent,
    IconCustomStrategy,
} from './icon.type';

@Component({
    selector: 'a11y-icon',
    template: `
        <ng-container [ngSwitch]="iconType">
            <ng-container *ngSwitchCase="'string'">
                <span [innerHTML]="stringIcon"></span>
            </ng-container>
            <ng-container *ngSwitchCase="'image'">
                <img [src]="imageIcon" alt="" />
            </ng-container>
            <ng-container *ngSwitchCase="'template'">
                <ng-container
                    *ngTemplateOutlet="templateRefIcon; context: { $implicit: stringTemplateIcon }"></ng-container>
            </ng-container>
            <ng-container *ngSwitchCase="'template-ref'">
                <ng-container *ngTemplateOutlet="templateRefIcon"></ng-container>
            </ng-container>
            <ng-container *ngSwitchCase="'component'" [a11yIconDynamicComponent]="componentIcon"></ng-container>
        </ng-container>
    `,
    styleUrls: ['./icon.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        ngSkipHydration: '', // To work on SSR with hydration
        '[attr.role]': `label ? 'img' : null`,
        '[attr.aria-label]': 'label ?? null',
        '[attr.aria-hidden]': '!label ? true : null',
    },
})
export class IconComponent implements OnChanges {
    @Input() icon: Icon | undefined = undefined;
    @Input() label: string | number | undefined = undefined;

    /** @description The icon's type. */
    iconType: IconType | '' = '';

    /** @description The main strategy. */
    private iconStrategy: IconCustomStrategy | null = null;
    /** @description The template strategy. */
    private iconStrategyTemplate: IconInputTemplate | undefined = undefined;
    /** @description The component strategy. */
    private iconStrategyComponent: IconInputComponent | undefined = undefined;
    /** @description The image strategy. */
    private iconStrategyImage: boolean = false;

    /** @description To use as a simple string to inject via `innerHTML`. */
    get stringIcon(): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml((this.icon as IconInputHTML).html ?? (this.icon as string));
    }

    /** @description To use as an image. */
    get imageIcon(): string {
        const { src, ignoreBasePath = false } = this.icon as IconInputImage;
        const basePath: string = !ignoreBasePath ? this.service.config.basePath ?? '' : '';
        const imageSrc: string = src ?? (this.icon as string);
        return `${basePath}${imageSrc}`;
    }

    /** @description To use as the `$implicit` context of the template. */
    get stringTemplateIcon(): string {
        return this.icon as string;
    }

    /** @description To use as template reference. */
    get templateRefIcon(): IconInputTemplate {
        return this.iconStrategyTemplate ?? (this.icon as IconInputTemplate);
    }

    /** @description To use as component. */
    get componentIcon(): IconInputComponent {
        return this.iconStrategyComponent ?? (this.icon as IconInputComponent);
    }

    /** @description Returns the icon's type based on the input/token. */
    private get theIconType(): IconType {
        const icon: Icon = this.icon as Icon;

        if (typeof icon === 'string') {
            if (this.iconStrategyComponent) return 'component';
            if (this.iconStrategyTemplate) return 'template';
            if (this.iconStrategyImage) return 'image';
            return 'string';
        }

        if (icon instanceof TemplateRef) return 'template-ref';

        if ('html' in icon) return 'string';
        if ('src' in icon) return 'image';

        return 'component';
    }

    constructor(
        @Optional()
        @Inject(ICON_CUSTOM_STRATEGY)
        private customStrategy: IconCustomStrategy | null,
        private service: IconService,
        private sanitizer: DomSanitizer,
        private cdr: ChangeDetectorRef
    ) {
        this.iconStrategy = this.customStrategy ?? this.service.config.strategy ?? null;
    }

    ngOnChanges({ icon: iconChange }: SimpleChanges): void {
        const icon: Icon | undefined = iconChange?.currentValue;
        if (!icon) {
            this.iconType = '';
            return;
        }

        const strategy: IconCustomStrategy | null = this.iconStrategy;

        // When icon is of type "string" and we have a strategy...
        if (typeof icon === 'string' && strategy) {
            // ... we check for "template" presence
            if (strategy instanceof TemplateRef) this.iconStrategyTemplate = strategy;
            // ... we check for "default component" presence
            else if (typeof strategy === 'object' && 'component' in strategy) {
                const { component, mainEntry, inputs = {} } = strategy;
                const data: Omit<IconInputComponent, 'component'> = { inputs };

                // If main entry is "content"
                if (mainEntry === 'content') data.content = icon;
                // If main entry is "input"
                else {
                    const { inputName } = strategy as IconDefaultEntryInput;
                    // We set the given "inputName" with the icon's string value
                    (data.inputs as Record<string, unknown>)[inputName] = icon;
                }

                // We create the component structure
                this.iconStrategyComponent = { component, ...data };
            }
            // ... we check for "image" presence
            else if (strategy === 'image') this.iconStrategyImage = true;
            // Fallback for wrong token
            else {
                console.error(ERROR_WRONG_TOKEN());
                return;
            }
        }
        // At this point, icon is not under a strategy (ergo => simple string, template, component, html/image objects)
        else {
            // We reset the template/component/image vars in case it exists
            this.iconStrategyTemplate = undefined;
            this.iconStrategyComponent = undefined;
            this.iconStrategyImage = false;
        }

        // We set the icon type
        this.iconType = this.theIconType;

        this.cdr.markForCheck();
    }
}
