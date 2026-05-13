import {
    Directive,
    Input,
    Inject,
    ComponentRef,
    ViewContainerRef,
    ComponentFactoryResolver,
    ComponentFactory,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

import type { IconInputComponent } from './icon.type';

@Directive({ selector: '[a11yIconDynamicComponent]' })
export class IconDynamicComponentDirective {
    @Input() set a11yIconDynamicComponent(data: IconInputComponent) {
        const sameComponent: boolean = this.componentRef?.componentType === data.component;
        const sameContent: boolean = this.data?.content === data.content;

        this.data = data;

        if (!sameComponent || !sameContent) this.createComponent();
        this.updateInputs();
    }

    private data!: IconInputComponent;
    private componentRef!: ComponentRef<unknown>;

    constructor(
        private vcr: ViewContainerRef,
        private cfr: ComponentFactoryResolver,
        @Inject(DOCUMENT) private document: Document
    ) {}

    /**
     * @description
     * Creates the given component dynamically.
     */
    private createComponent(): void {
        this.vcr.clear();

        const { component, content } = this.data;

        const factory: ComponentFactory<unknown> = this.cfr.resolveComponentFactory(component);

        const projectableNodes: Text[][] = content?.length ? [[this.document.createTextNode(content)]] : [];

        this.componentRef = this.vcr.createComponent(factory, undefined, undefined, projectableNodes);
    }

    /**
     * @description
     * Updates the component inputs.
     */
    private updateInputs(): void {
        const { inputs } = this.data;
        if (!inputs) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const componentRefSignals: any = this.componentRef as any;
        // We check if we can access to the "setInput" method in newer versions of Angular (v14+)
        /* istanbul ignore if: modern Angular (v14+) feature detection */
        if (typeof componentRefSignals.setInput === 'function') {
            Object.keys(inputs).forEach((key) => componentRefSignals.setInput(key, inputs[key]));
            return;
        }

        // We assign the inputs the old way
        const instance: Record<string, unknown> = this.componentRef.instance as Record<string, unknown>;
        Object.keys(inputs).forEach((key) => (instance[key] = inputs[key]));

        this.componentRef.changeDetectorRef.markForCheck();
    }
}
