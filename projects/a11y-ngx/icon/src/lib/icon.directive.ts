import { Directive, Input, inject, ComponentRef, ViewContainerRef } from '@angular/core';
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

    private readonly vcr: ViewContainerRef = inject(ViewContainerRef);
    private readonly document: Document = inject(DOCUMENT);

    /**
     * @description
     * Creates the given component dynamically.
     */
    private createComponent(): void {
        this.vcr.clear();

        const { component, content } = this.data;

        const projectableNodes: Text[][] = content?.length ? [[this.document.createTextNode(content)]] : [];

        this.componentRef = this.vcr.createComponent(component, { projectableNodes });
    }

    /**
     * @description
     * Updates the component inputs.
     */
    private updateInputs(): void {
        const { inputs } = this.data;
        if (!inputs) return;

        Object.keys(inputs).forEach((key) => this.componentRef.setInput(key, inputs[key]));
    }
}
