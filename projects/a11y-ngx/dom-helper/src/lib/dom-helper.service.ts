import { Injectable, Optional, SkipSelf, RendererFactory2, Renderer2 } from '@angular/core';

import { TABBABLE_ELEMENTS_SELECTOR } from './dom-helper.type';

@Injectable({ providedIn: 'root' })
export class DOMHelperService {
    readonly r2: Renderer2 = this.rendererFactory.createRenderer(null, null);

    constructor(
        private rendererFactory: RendererFactory2,
        @Optional() @SkipSelf() private parentService?: DOMHelperService
    ) {
        if (this.parentService) {
            const errorMsg: string = `
                A11y DOM Helper:
                DOMHelperService is a singleton and has been provided more than once.
                Please remove the service from any 'providers' array you may have added it to.
            `;
            throw Error(errorMsg.replace(/ {2,}/g, ''));
        }
    }

    /**
     * @description
     * To get all the element's computed styles.
     *
     * @param { HTMLElement } element - The HTML Element to check.
     * @param { string } pseudoElement - The pseudo element, if needed.
     * @returns { CSSStyleDeclaration }
     */
    getStyles(element: HTMLElement, pseudoElement?: string): CSSStyleDeclaration {
        return getComputedStyle(element, pseudoElement ?? '');
    }

    /**
     * @description
     * To get the property's value from the element's computed styles.
     *
     * @param { HTMLElement } element - The HTML Element to check.
     * @param { keyof CSSStyleDeclaration } property - The property to check.
     * @param { string } pseudoElement - The pseudo element, if needed.
     * @returns { string | number | CSSRule } The property's value.
     */
    getStyle(
        element: HTMLElement,
        property: keyof CSSStyleDeclaration,
        pseudoElement?: string
    ): string | number | CSSRule {
        return this.getStyles(element, pseudoElement)[property] as string | number | CSSRule;
    }

    /**
     * @description
     * To get the property's value from the "before" pseudo element computed styles.
     *
     * @param { HTMLElement } element - The HTML Element to check.
     * @param { keyof CSSStyleDeclaration } property - The property to check.
     * @returns { string | number | CSSRule } The property's value.
     */
    getStyleBefore(element: HTMLElement, property: keyof CSSStyleDeclaration): string | number | CSSRule {
        return this.getStyle(element, property, '::before');
    }

    /**
     * @description
     * To get the property's value from the "after" pseudo element computed styles.
     *
     * @param { HTMLElement } element - The HTML Element to check.
     * @param { keyof CSSStyleDeclaration } property - The property to check.
     * @returns { string | number | CSSRule } The property's value.
     */
    getStyleAfter(element: HTMLElement, property: keyof CSSStyleDeclaration): string | number | CSSRule {
        return this.getStyle(element, property, '::after');
    }

    /**
     * @description
     * To check for element's visibility.
     *
     * @param { HTMLElement } element - The HTML Element to check the visibility.
     * @returns { boolean } If the element is visible.
     */
    isVisible(element: HTMLElement): boolean {
        const elementRects: DOMRectList | undefined = element.getClientRects?.();

        return (
            !!(elementRects?.length && elementRects?.[0]?.width && elementRects?.[0]?.height) &&
            !this.isAriaHidden(element) &&
            !this.isInert(element) &&
            this.getStyle(element, 'visibility') === 'visible'
        );
    }

    /**
     * @description
     * To check if the `aria-hidden` attribute is set to `true`.
     *
     * @param { HTMLElement } element - The HTML Element to check.
     * @returns { boolean }
     */
    isAriaHidden(element: HTMLElement): boolean {
        return this.getAttributeValue(element, 'aria-hidden') === 'true';
    }

    /**
     * @description
     * To check if the `inert` attribute is present.
     *
     * @param { HTMLElement } element - The HTML Element to check.
     * @returns { boolean }
     */
    isInert(element: HTMLElement): boolean {
        return this.hasAttribute(element, 'inert');
    }

    /**
     * @description
     * To check if the given value is boolean or not.
     *
     * @param { unknown } value - The given value.
     * @returns { boolean }
     */
    isBoolean(value: unknown): boolean {
        const valueStr: string = String(value).trim();
        return ['true', 'false'].indexOf(valueStr) !== -1;
    }

    /**
     * @description
     * To check if the given value is numeric or not.
     *
     * @param { unknown } value - The value to check.
     * @returns { boolean }
     */
    isNumeric(value: unknown): boolean {
        return String(value)?.trim().length > 0 && !isNaN(Number(value ?? '!'));
    }

    /**
     * @description
     * To check if the given attribute is present in the element.
     *
     * @param { HTMLElement } element - The HTML Element to check.
     * @param { string } attribute - The attribute to check.
     * @returns { boolean }
     */
    hasAttribute(element: HTMLElement, attribute: string): boolean {
        return element.hasAttribute(attribute);
    }

    /**
     * @description
     * To get the value from an attribute.
     *
     * @param { HTMLElement } element - The HTML Element to check.
     * @param { string } attribute - The attribute's name.
     * @returns { string | null } The `string` value, `null` otherwise
     */
    getAttributeValue(element: HTMLElement, attribute: string): string | null {
        return element.getAttribute(attribute);
    }

    /**
     * @description
     * To check and get the numeric value from an attribute.
     *
     * @param { HTMLElement } element - The HTML Element to check.
     * @param { string } attribute - The attribute's name.
     * @param { number } decimals - The decimals (_unset_ by default, all available decimals).
     * @returns { number | null } The numberic value if the validation is true, `null` otherwise
     */
    getAttributeNumericValue(element: HTMLElement, attribute: string, decimals?: number): number | null {
        const value: string | null = this.getAttributeValue(element, attribute);
        return this.getNumericValue(value, decimals);
    }

    /**
     * @description
     * To check and get the boolean value.
     *
     * @param { unknown } value - The given value.
     * @returns { boolean | null } The boolean value, `null` otherwise.
     */
    getBooleanValue(value: unknown): boolean | null {
        try {
            return this.isBoolean(value) ? JSON.parse(String(value)) : null;
        } catch {
            return null;
        }
    }

    /**
     * @description
     * To check and get the numeric value.
     *
     * @param { unknown } value - The value to check.
     * @param { number } decimals - The decimals (_unset_ by default, all available decimals).
     * @returns { number | null } The numeric value, `null` otherwise.
     */
    getNumericValue(value: unknown, decimals?: number): number | null {
        const numericValue: number = parseFloat(String(value ?? ''));
        if (!this.isNumeric(value) || isNaN(numericValue)) return null;

        if (typeof decimals === 'number' && !isNaN(decimals)) {
            decimals = Math.max(0, decimals ?? 0);
            return +numericValue.toFixed(decimals);
        }

        return numericValue;
    }

    /**
     * @description
     * Check and returns all tabbable and visible elements within a host.
     *
     * @param { HTMLElement } hostElement - The host element.
     */
    tabbableElements(hostElement: HTMLElement): HTMLElement[] {
        const tabbableElements = Array.from(hostElement.querySelectorAll(TABBABLE_ELEMENTS_SELECTOR)) as HTMLElement[];
        return tabbableElements.filter(this.isVisible.bind(this));
    }

    private filterNonFormElementOrFormElementNotDisabled(element: HTMLElement): boolean {
        if (['BUTTON', 'SELECT', 'TEXTAREA', 'INPUT'].indexOf(element.nodeName) === -1) return true;

        const formElement = element as HTMLButtonElement | HTMLSelectElement | HTMLTextAreaElement | HTMLInputElement;
        return !(!!formElement.disabled || !!formElement.closest('fieldset')?.disabled);
    }
}
