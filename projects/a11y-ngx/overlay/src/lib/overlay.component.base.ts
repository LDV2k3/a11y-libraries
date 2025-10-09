import { Component, OnInit, ViewEncapsulation, TemplateRef } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import { OverlayDirective } from './overlay.directive';

import { OVERLAY_SELECTOR_BASE } from './overlay.type.private';

@Component({
    selector: OVERLAY_SELECTOR_BASE,
    template: '',
    styleUrls: ['./overlay.component.base.scss'],
    host: {
        '[attr.updating]': 'attrUpdating',
    },
    encapsulation: ViewEncapsulation.None,
})
export class OverlayBaseComponent extends OverlayDirective implements OnInit {
    // To extend custom components
    customContent!: TemplateRef<unknown> | string;

    private attrUpdating!: string | null;

    ngOnInit(): void {
        if (this.fluidSize) {
            this.overlayUpdated$.pipe(takeUntil(this.destroy$)).subscribe(() => this.setUpdatingAttr());
        }
    }

    /**
     * Updates the "updating" attribute, which serves in case the size of the Overlay
     * shrinks and overflows (or vice versa) and the scrollbars can (dis)appear properly.
     */
    private setUpdatingAttr(): void {
        this.attrUpdating = '';
        setTimeout(() => {
            this.attrUpdating = null;
            this.detectChanges();
        }, 10);
    }
}
