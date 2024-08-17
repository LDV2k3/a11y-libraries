import { Component, HostBinding, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ColorSchemeService } from '../../color-scheme.service';

import { ColorSchemeChange } from '../../color-scheme.type';

let uid: number = 0;

@Component({
    selector: 'a11y-color-scheme-checkbox',
    templateUrl: './color-scheme-checkbox.component.html',
    styleUrls: ['./color-scheme-checkbox.component.scss'],
})
export class ColorSchemeCheckboxComponent implements OnDestroy {
    @Input()
    get label(): string {
        return this.inputLabel || 'Dark Mode';
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

    @Input() useBootstrapStyles: boolean = false;

    @HostBinding('attr.use-bs') private get attrBS(): string | null {
        return this.useBootstrapStyles ? '' : null;
    }
    @HostBinding('class.form-check') private get classBSFormCheck(): boolean {
        return this.useBootstrapStyles;
    }

    colorSchemeDark!: boolean;

    private inputLabel!: string;
    private inputDisabled!: boolean;

    readonly id: string = `a11y-color-scheme-check-${uid++}`;

    private readonly destroy$: Subject<void> = new Subject<void>();

    constructor(private service: ColorSchemeService) {
        this.service.colorSchemeChanged.pipe(takeUntil(this.destroy$)).subscribe((colorScheme: ColorSchemeChange) => {
            const currentScheme: string = colorScheme.colorSchemeCurrent;
            this.colorSchemeDark = currentScheme === 'auto' ? this.service.isSystemThemeDark : currentScheme === 'dark';
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    changeColorScheme(): void {
        if (this.disabled) return;
        this.service.userChosen = this.colorSchemeDark ? 'dark' : 'light';
    }
}
