import { Component, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ColorSchemeService } from '../../color-scheme.service';

import { ColorScheme, ColorSchemeChange, ColorSchemeItem } from '../../color-scheme.type';

let uid: number = 0;

@Component({
    selector: 'a11y-color-scheme-select',
    templateUrl: './color-scheme-select.component.html',
    styleUrls: ['./color-scheme-select.component.scss'],
})
export class ColorSchemeSelectComponent implements OnDestroy {
    @Input()
    get label(): string {
        return this.inputLabel || 'Color Scheme';
    }
    set label(label: string) {
        this.inputLabel = label.trim();
    }

    @Input()
    get disabled(): boolean {
        return !this.service.allowUserToChangeScheme || (this.inputDisabled ?? false);
    }
    set disabled(disabled: boolean) {
        this.inputDisabled = disabled;
    }

    colorScheme!: ColorScheme;

    get schemes(): ColorSchemeItem[] {
        return this.service.colorSchemes;
    }

    private inputLabel!: string;
    private inputDisabled!: boolean;

    readonly id: string = `a11y-color-scheme-select-${uid++}`;

    private readonly destroy$: Subject<void> = new Subject<void>();

    constructor(private service: ColorSchemeService) {
        this.service.colorSchemeChanged.pipe(takeUntil(this.destroy$)).subscribe((colorScheme: ColorSchemeChange) => {
            this.colorScheme = this.service.userChosen === 'auto' ? 'auto' : colorScheme.colorSchemeCurrent;
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    changeColorScheme(): void {
        if (this.disabled) return;
        this.service.userChosen = this.colorScheme;
    }
}
