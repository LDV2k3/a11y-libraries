import { Component, ChangeDetectionStrategy, TemplateRef } from '@angular/core';

import { OverlayBaseComponent } from './overlay.component.base';

import { OVERLAY_SELECTOR, OVERLAY_SELECTOR_EXPORT } from './overlay.type.private';

@Component({
    selector: OVERLAY_SELECTOR,
    template: `
        <div overlay-wrapper>
            <div overlay-content>
                <ng-container *ngIf="isCustomContentString; else defaultTemplate">
                    <span [innerHTML]="customContent"></span>
                </ng-container>
                <ng-template #defaultTemplate>
                    <ng-template
                        [ngTemplateOutlet]="(customContent | overlayTemplate) || defaultTemplateRef"></ng-template>
                    <ng-template #defaultTemplateRef><ng-content></ng-content></ng-template>
                </ng-template>
            </div>
        </div>
    `,
    styleUrls: ['./overlay.component.scss'],
    host: {
        '[attr.use-bs]': `useBootstrapStyles ? '' : null`,
        '[class.popover]': 'useBootstrapStyles',
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: OVERLAY_SELECTOR_EXPORT,
})
export class OverlayComponent extends OverlayBaseComponent {
    override customContent!: TemplateRef<unknown> | string;

    get isCustomContentString(): boolean {
        return this.customContent !== undefined && typeof this.customContent === 'string';
    }

    /**
     * @description
     * For the Create Service to assign.
     *
     * To destroy the Overlay instance from the DOM created from the Service.
     */
    destroyOverlay = (): void => {
        return;
    };
}
