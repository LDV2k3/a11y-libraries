import { TestBed } from '@angular/core/testing';

import { DOMHelperService } from './dom-helper.service';

describe('DOM Helper', () => {
    let containerElement: HTMLElement;
    let DOMHelper: DOMHelperService;

    beforeAll(() => {
        containerElement = document.createElement('div');
        containerElement.setAttribute('id', 'dom-helper-test-container');

        document.body.appendChild(containerElement);
        DOMHelper = TestBed.inject(DOMHelperService);
    });

    afterEach(() => (containerElement.innerHTML = ''));

    describe('getStyle()', () => {
        let redBox: HTMLDivElement;

        beforeEach(() => {
            const redBoxStyles = document.createElement('style');
            redBoxStyles.innerHTML = `
                .red-box.before::before { content: ''; position: absolute; }
                .red-box.after::after { content: 'content after'; position: relative; }
            `;
            containerElement.append(redBoxStyles);
            redBox = document.createElement('div');
            redBox.classList.add('red-box');
            containerElement.append(redBox);
        });

        afterEach(() => redBox.remove());

        it('should return the proper styles for the red-box element', () => {
            redBox.style.borderColor = 'red';
            redBox.style.borderWidth = '1px';

            expect(DOMHelper.getStyle(redBox, 'display')).toEqual('block');
            expect(DOMHelper.getStyle(redBox, 'borderColor')).toEqual('rgb(255, 0, 0)');
            expect(DOMHelper.getStyle(redBox, 'borderStyle')).toEqual('none');
            expect(DOMHelper.getStyle(redBox, 'border')).toEqual('0px none rgb(255, 0, 0)');

            redBox.style.borderStyle = 'solid';

            expect(DOMHelper.getStyle(redBox, 'border')).toEqual('1px solid rgb(255, 0, 0)');
        });

        it('should return the proper styles for the red-box ::before pseudo element', () => {
            expect(DOMHelper.getStyleBefore(redBox, 'content')).toEqual('none');
            expect(DOMHelper.getStyleBefore(redBox, 'position')).toEqual('static');
            expect(DOMHelper.getStyleBefore(redBox, 'borderWidth')).toEqual('0px');

            redBox.classList.add('before');

            expect(DOMHelper.getStyleBefore(redBox, 'content')).toEqual('""');
            expect(DOMHelper.getStyleBefore(redBox, 'position')).toEqual('absolute');
        });

        it('should return the proper styles for the red-box ::after pseudo element', () => {
            expect(DOMHelper.getStyleAfter(redBox, 'content')).toEqual('none');

            redBox.classList.add('after');

            expect(DOMHelper.getStyleAfter(redBox, 'content')).toEqual('"content after"');
            expect(DOMHelper.getStyleAfter(redBox, 'position')).toEqual('relative');
        });
    });

    describe('isVisible()', () => {
        let visibleBox: HTMLDivElement;

        beforeEach(() => {
            visibleBox = document.createElement('div');
            visibleBox.style.height = '10px';
            containerElement.append(visibleBox);
        });

        afterEach(() => visibleBox.remove());

        it('should check the visibility based on the "aria-hidden" attribute', () => {
            visibleBox.setAttribute('aria-hidden', '');
            expect(DOMHelper.isVisible(visibleBox)).toBeTrue();

            visibleBox.setAttribute('aria-hidden', 'true');
            expect(DOMHelper.isVisible(visibleBox)).toBeFalse();

            visibleBox.setAttribute('aria-hidden', 'false');
            expect(DOMHelper.isVisible(visibleBox)).toBeTrue();
        });

        it('should check the visibility based on the "inert" attribute', () => {
            visibleBox.setAttribute('inert', '');
            expect(DOMHelper.isVisible(visibleBox)).toBeFalse();

            visibleBox.removeAttribute('inert');
            expect(DOMHelper.isVisible(visibleBox)).toBeTrue();
        });

        it('should check the visibility based on the "visibility" & "display" styles', () => {
            visibleBox.style.display = 'none';
            expect(DOMHelper.isVisible(visibleBox)).toBeFalse();

            visibleBox.style.display = 'block';
            visibleBox.style.visibility = 'hidden';
            expect(DOMHelper.isVisible(visibleBox)).toBeFalse();
        });

        it('should check the visibility based on the size', () => {
            visibleBox.style.display = 'inline-block';
            visibleBox.style.width = '0px';
            visibleBox.style.height = '0px';
            expect(DOMHelper.isVisible(visibleBox)).toBeFalse();

            visibleBox.style.width = '1px';
            expect(DOMHelper.isVisible(visibleBox)).toBeFalse();

            visibleBox.style.height = '1px';
            expect(DOMHelper.isVisible(visibleBox)).toBeTrue();

            visibleBox.style.width = '0px';
            expect(DOMHelper.isVisible(visibleBox)).toBeFalse();
        });
    });

    describe('isAriaHidden()', () => {
        let ariaHiddenBox: HTMLDivElement;

        beforeEach(() => {
            ariaHiddenBox = document.createElement('div');
            containerElement.append(ariaHiddenBox);
        });

        afterEach(() => ariaHiddenBox.remove());

        it('should check if the "aria-hidden" attribute is set to "true"', () => {
            ariaHiddenBox.setAttribute('aria-hidden', '');
            expect(DOMHelper.isAriaHidden(ariaHiddenBox)).toBeFalse();

            ariaHiddenBox.setAttribute('aria-hidden', 'true');
            expect(DOMHelper.isAriaHidden(ariaHiddenBox)).toBeTrue();

            ariaHiddenBox.setAttribute('aria-hidden', 'false');
            expect(DOMHelper.isAriaHidden(ariaHiddenBox)).toBeFalse();
        });
    });

    describe('isInert()', () => {
        let inertBox: HTMLDivElement;

        beforeEach(() => {
            inertBox = document.createElement('div');
            containerElement.append(inertBox);
        });

        afterEach(() => inertBox.remove());

        it('should check if the "inert" attribute is set or not', () => {
            inertBox.setAttribute('inert', '');
            expect(DOMHelper.isInert(inertBox)).toBeTrue();

            inertBox.removeAttribute('inert');
            expect(DOMHelper.isInert(inertBox)).toBeFalse();
        });
    });

    describe('isBoolean()', () => {
        it('should check that the given values are not boolean', () => {
            expect(DOMHelper.isBoolean(undefined)).toBeFalse();
            expect(DOMHelper.isBoolean(null)).toBeFalse();
            expect(DOMHelper.isBoolean(NaN)).toBeFalse();
            expect(DOMHelper.isBoolean({})).toBeFalse();
            expect(DOMHelper.isBoolean('')).toBeFalse();
            expect(DOMHelper.isBoolean('0')).toBeFalse();
            expect(DOMHelper.isBoolean('falsex')).toBeFalse();
            expect(DOMHelper.isBoolean(0)).toBeFalse();
        });

        it('should check that the given values are boolean', () => {
            expect(DOMHelper.isBoolean(true)).toBeTrue();
            expect(DOMHelper.isBoolean(false)).toBeTrue();
            expect(DOMHelper.isBoolean('true')).toBeTrue();
            expect(DOMHelper.isBoolean('false')).toBeTrue();
            expect(DOMHelper.isBoolean(' true ')).toBeTrue();
            expect(DOMHelper.isBoolean(' false ')).toBeTrue();
            expect(DOMHelper.isBoolean(!0)).toBeTrue();
            expect(DOMHelper.isBoolean(!1)).toBeTrue();
        });
    });

    describe('isNumeric()', () => {
        it('should check that the given values are not numeric', () => {
            expect(DOMHelper.isNumeric(undefined)).toBeFalse();
            expect(DOMHelper.isNumeric(null)).toBeFalse();
            expect(DOMHelper.isNumeric(NaN)).toBeFalse();
            expect(DOMHelper.isNumeric({})).toBeFalse();
            expect(DOMHelper.isNumeric('')).toBeFalse();
            expect(DOMHelper.isNumeric('200,25')).toBeFalse();
            expect(DOMHelper.isNumeric('0!')).toBeFalse();
            expect(DOMHelper.isNumeric('test')).toBeFalse();
        });

        it('should check that the given values are numeric', () => {
            expect(DOMHelper.isNumeric(0)).toBeTrue();
            expect(DOMHelper.isNumeric(10)).toBeTrue();
            expect(DOMHelper.isNumeric('0')).toBeTrue();
            expect(DOMHelper.isNumeric('10')).toBeTrue();
            expect(DOMHelper.isNumeric(' 200 ')).toBeTrue();
            expect(DOMHelper.isNumeric(' 200.25 ')).toBeTrue();
        });
    });

    describe('getAttributeValue() & getAttributeNumericValue()', () => {
        let attributeBox: HTMLDivElement;

        beforeEach(() => {
            attributeBox = document.createElement('div');
            containerElement.append(attributeBox);
        });

        afterEach(() => attributeBox.remove());

        it('should check if the requested attribute has the right string value', () => {
            // 'inert'
            expect(DOMHelper.getAttributeValue(attributeBox, 'inert')).toBeNull();

            attributeBox.setAttribute('inert', '');
            expect(DOMHelper.getAttributeValue(attributeBox, 'inert')).toBe('');

            // 'aria-hidden'
            attributeBox.setAttribute('aria-hidden', 'true');
            expect(DOMHelper.getAttributeValue(attributeBox, 'aria-hidden')).toBe('true');

            attributeBox.removeAttribute('aria-hidden');
            expect(DOMHelper.getAttributeValue(attributeBox, 'aria-hidden')).toBeNull();
        });

        it('should check if the requested attribute has the right numeric value', () => {
            // 'tabindex'
            expect(DOMHelper.getAttributeNumericValue(attributeBox, 'tabindex')).toBeNull();

            attributeBox.setAttribute('tabindex', '-1');
            expect(DOMHelper.getAttributeNumericValue(attributeBox, 'tabindex')).toBe(-1);

            // 'custom-attr'
            attributeBox.setAttribute('custom-attr', '10');
            expect(DOMHelper.getAttributeNumericValue(attributeBox, 'custom-attr')).toBe(10);

            attributeBox.setAttribute('custom-attr', '-10');
            expect(DOMHelper.getAttributeNumericValue(attributeBox, 'custom-attr')).toBe(-10);

            attributeBox.setAttribute('custom-attr', '  -10  ');
            expect(DOMHelper.getAttributeNumericValue(attributeBox, 'custom-attr')).toBe(-10);

            attributeBox.setAttribute('custom-attr', '  10.1005  ');
            expect(DOMHelper.getAttributeNumericValue(attributeBox, 'custom-attr')).toBe(10.1005);
            expect(DOMHelper.getAttributeNumericValue(attributeBox, 'custom-attr', NaN)).toBe(10.1005);
            expect(DOMHelper.getAttributeNumericValue(attributeBox, 'custom-attr', null)).toBe(10.1005);
            expect(DOMHelper.getAttributeNumericValue(attributeBox, 'custom-attr', undefined)).toBe(10.1005);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect(DOMHelper.getAttributeNumericValue(attributeBox, 'custom-attr', {} as any)).toBe(10.1005);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect(DOMHelper.getAttributeNumericValue(attributeBox, 'custom-attr', 'test' as any)).toBe(10.1005);
            expect(DOMHelper.getAttributeNumericValue(attributeBox, 'custom-attr', 0)).toBe(10);
            expect(DOMHelper.getAttributeNumericValue(attributeBox, 'custom-attr', 1)).toBe(10.1);
            expect(DOMHelper.getAttributeNumericValue(attributeBox, 'custom-attr', 2)).toBe(10.1);
            expect(DOMHelper.getAttributeNumericValue(attributeBox, 'custom-attr', 3)).toBe(10.101); // rounds up
            expect(DOMHelper.getAttributeNumericValue(attributeBox, 'custom-attr', 4)).toBe(10.1005);

            attributeBox.setAttribute('custom-attr', '  10,1  ');
            expect(DOMHelper.getAttributeNumericValue(attributeBox, 'custom-attr')).toBeNull();

            attributeBox.removeAttribute('custom-attr');
            expect(DOMHelper.getAttributeNumericValue(attributeBox, 'custom-attr')).toBeNull();
        });
    });

    describe('getBooleanValue()', () => {
        it('should check that the given values are not boolean and return "null"', () => {
            expect(DOMHelper.getBooleanValue(undefined)).toBeNull();
            expect(DOMHelper.getBooleanValue(null)).toBeNull();
            expect(DOMHelper.getBooleanValue({})).toBeNull();
            expect(DOMHelper.getBooleanValue('')).toBeNull();
            expect(DOMHelper.getBooleanValue(' TRUE ')).toBeNull();
            expect(DOMHelper.getBooleanValue(' FALSE ')).toBeNull();
            expect(DOMHelper.getBooleanValue(0)).toBeNull();
            expect(DOMHelper.getBooleanValue(1)).toBeNull();
        });

        it('should check that the given values are boolean and return the right boolean', () => {
            expect(DOMHelper.getBooleanValue(true)).toBeTrue();
            expect(DOMHelper.getBooleanValue(false)).toBeFalse();
            expect(DOMHelper.getBooleanValue('true')).toBeTrue();
            expect(DOMHelper.getBooleanValue('false')).toBeFalse();
            expect(DOMHelper.getBooleanValue(' true ')).toBeTrue();
            expect(DOMHelper.getBooleanValue(' false ')).toBeFalse();
            expect(DOMHelper.getBooleanValue(!0)).toBeTrue();
            expect(DOMHelper.getBooleanValue(!1)).toBeFalse();
        });
    });

    describe('getNumericValue()', () => {
        it('should check that the given values are not numeric and return "null"', () => {
            expect(DOMHelper.getNumericValue(undefined)).toBeNull();
            expect(DOMHelper.getNumericValue(null)).toBeNull();
            expect(DOMHelper.getNumericValue(true)).toBeNull();
            expect(DOMHelper.getNumericValue({})).toBeNull();
            expect(DOMHelper.getNumericValue([])).toBeNull();
            expect(DOMHelper.getNumericValue('')).toBeNull();
            expect(DOMHelper.getNumericValue('1,2')).toBeNull();
        });

        it('should check that the given values are numeric and return the right number', () => {
            expect(DOMHelper.getNumericValue('-1')).toBe(-1);
            expect(DOMHelper.getNumericValue('10')).toBe(10);
            expect(DOMHelper.getNumericValue('10', NaN)).toBe(10);
            expect(DOMHelper.getNumericValue('-10')).toBe(-10);
            expect(DOMHelper.getNumericValue('  -10  ')).toBe(-10);
            expect(DOMHelper.getNumericValue('10.1005')).toBe(10.1005);
            expect(DOMHelper.getNumericValue('10.1005', NaN)).toBe(10.1005);
            expect(DOMHelper.getNumericValue('10.1005', null)).toBe(10.1005);
            expect(DOMHelper.getNumericValue('10.1005', undefined)).toBe(10.1005);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect(DOMHelper.getNumericValue('10.1005', {} as any)).toBe(10.1005);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect(DOMHelper.getNumericValue('10.1005', 'test' as any)).toBe(10.1005);
            expect(DOMHelper.getNumericValue('10.1005', 0)).toBe(10);
            expect(DOMHelper.getNumericValue('10.1005', 1)).toBe(10.1);
            expect(DOMHelper.getNumericValue('10.1005', 2)).toBe(10.1);
            expect(DOMHelper.getNumericValue('10.1005', 3)).toBe(10.101); // rounds up
            expect(DOMHelper.getNumericValue('10.1005', 4)).toBe(10.1005);
        });
    });

    describe('tabbableElements()', () => {
        let tabbableElementsBox: HTMLDivElement;

        beforeEach(() => {
            tabbableElementsBox = document.createElement('div');

            const tabbableElementInput: HTMLInputElement = document.createElement('input');
            tabbableElementInput.type = 'text';
            tabbableElementsBox.append(tabbableElementInput);

            const tabbableElementInputHidden: HTMLInputElement = document.createElement('input');
            tabbableElementInputHidden.type = 'hidden';
            tabbableElementsBox.append(tabbableElementInputHidden);

            const tabbableElementButton: HTMLButtonElement = document.createElement('button');
            tabbableElementButton.type = 'button';
            tabbableElementButton.innerHTML = 'button';
            tabbableElementsBox.append(tabbableElementButton);

            const tabbableElementSubmitDisabled: HTMLButtonElement = document.createElement('button');
            tabbableElementSubmitDisabled.type = 'submit';
            tabbableElementSubmitDisabled.disabled = true;
            tabbableElementSubmitDisabled.innerHTML = 'submit';
            tabbableElementsBox.append(tabbableElementSubmitDisabled);

            const tabbableElementSpan: HTMLSpanElement = document.createElement('span');
            tabbableElementSpan.innerHTML = 'span';
            tabbableElementsBox.append(tabbableElementSpan);

            const tabbableElementAnchorNoHref: HTMLAnchorElement = document.createElement('a');
            tabbableElementAnchorNoHref.innerHTML = 'link';
            tabbableElementsBox.append(tabbableElementAnchorNoHref);

            const tabbableElementAnchor: HTMLAnchorElement = document.createElement('a');
            tabbableElementAnchor.href = 'http://www.test.com';
            tabbableElementAnchor.innerHTML = 'link';
            tabbableElementsBox.append(tabbableElementAnchor);

            const tabbableElementContenteditable1: HTMLDivElement = document.createElement('div');
            tabbableElementContenteditable1.setAttribute('contenteditable', 'false');
            tabbableElementContenteditable1.innerHTML = 'contenteditable 1';
            tabbableElementsBox.append(tabbableElementContenteditable1);

            const tabbableElementContenteditable2: HTMLDivElement = document.createElement('div');
            tabbableElementContenteditable2.setAttribute('contenteditable', '');
            tabbableElementContenteditable2.innerHTML = 'contenteditable 2';
            tabbableElementsBox.append(tabbableElementContenteditable2);

            const tabbableElementTabindex1: HTMLDivElement = document.createElement('div');
            tabbableElementTabindex1.setAttribute('tabindex', '-1');
            tabbableElementTabindex1.innerHTML = 'tabindex-1';
            tabbableElementsBox.append(tabbableElementTabindex1);

            const tabbableElementTabindex2: HTMLDivElement = document.createElement('div');
            tabbableElementTabindex2.setAttribute('tabindex', '');
            tabbableElementTabindex2.innerHTML = 'tabindex-2';
            tabbableElementsBox.append(tabbableElementTabindex2);

            const tabbableElementTabindex3: HTMLDivElement = document.createElement('div');
            tabbableElementTabindex3.setAttribute('tabindex', '0');
            tabbableElementTabindex3.innerHTML = 'tabindex-3';
            tabbableElementsBox.append(tabbableElementTabindex3);

            // This fieldset is disabled, so all its children are also disabled.
            const tabbableElementFieldset1: HTMLFieldSetElement = document.createElement('fieldset');
            tabbableElementFieldset1.innerHTML = `
                <input type="text" id="input-01">          <!-- not tabbable -->
                <input type="checkbox" id="checkbox-01">   <!-- not tabbable -->
                <button type="button" id="button-01">      <!-- not tabbable -->
                <input type="hidden" id="hidden-01">       <!-- not tabbable -->

                <fieldset>
                    <input type="text" id="input-02">      <!-- not tabbable -->
                </fieldset>
            `;
            tabbableElementFieldset1.disabled = true;
            tabbableElementsBox.append(tabbableElementFieldset1);

            // This fieldset is not disabled but contains a nested disabled fieldset and a couple of disabled/hidden children.
            const tabbableElementFieldset2: HTMLFieldSetElement = document.createElement('fieldset');
            tabbableElementFieldset2.innerHTML = `
                <input type="text" id="input-03">                  <!-- tabbable -->
                <input type="checkbox" disabled id="checkbox-02">  <!-- not tabbable -->
                <input type="checkbox" id="checkbox-03">           <!-- tabbable -->
                <button type="button" id="button-02">              <!-- tabbable -->
                <input type="hidden" id="hidden-02">               <!-- not tabbable -->

                <fieldset disabled>
                    <input type="text" id="input-04">              <!-- not tabbable -->
                </fieldset>

                <fieldset>
                    <input type="text" id="input-05">              <!-- tabbable -->
                </fieldset>
            `;
            tabbableElementsBox.append(tabbableElementFieldset2);

            const tabbableElementInputRadio: HTMLInputElement = document.createElement('input');
            tabbableElementInputRadio.type = 'radio';
            tabbableElementInputRadio.disabled = true;
            tabbableElementsBox.append(tabbableElementInputRadio);

            const tabbableElementInputCheckbox: HTMLInputElement = document.createElement('input');
            tabbableElementInputCheckbox.type = 'checkbox';
            tabbableElementsBox.append(tabbableElementInputCheckbox);

            containerElement.append(tabbableElementsBox);
        });

        afterEach(() => tabbableElementsBox.remove());

        it('should check that the returned elements are tabbable', () => {
            const allElements: HTMLElement[] = Array.from(tabbableElementsBox.querySelectorAll('*'));
            const tabbableElements: HTMLElement[] = DOMHelper.tabbableElements(tabbableElementsBox);

            expect(allElements.length).toBe(31);
            expect(tabbableElements.length).toBe(10);

            // input type text
            expect(DOMHelper.getAttributeValue(tabbableElements[0], 'type')).toBe('text');

            // button
            expect(DOMHelper.getAttributeValue(tabbableElements[1], 'type')).toBe('button');
            expect(tabbableElements[1].innerText.trim()).toBe('button');

            // anchor
            expect(DOMHelper.getAttributeValue(tabbableElements[2], 'href')).toBe('http://www.test.com');
            expect(tabbableElements[2].innerText.trim()).toBe('link');

            // div with contenteditable
            expect(DOMHelper.getAttributeValue(tabbableElements[3], 'contenteditable')).not.toBeNull();
            expect(tabbableElements[3].innerText.trim()).toBe('contenteditable 2');

            // div with tabindex 0
            expect(DOMHelper.getAttributeValue(tabbableElements[4], 'tabindex')).toBe('0');
            expect(tabbableElements[4].innerText.trim()).toBe('tabindex-3');

            // input type text inside fieldset
            expect(tabbableElements[5].nodeName).toBe('INPUT');
            expect(DOMHelper.getAttributeValue(tabbableElements[5], 'type')).toBe('text');
            expect(DOMHelper.getAttributeValue(tabbableElements[5], 'id')).toBe('input-03');

            // input type checkbox inside fieldset
            expect(tabbableElements[6].nodeName).toBe('INPUT');
            expect(DOMHelper.getAttributeValue(tabbableElements[6], 'type')).toBe('checkbox');
            expect(DOMHelper.getAttributeValue(tabbableElements[6], 'id')).toBe('checkbox-03');

            // button inside fieldset
            expect(tabbableElements[7].nodeName).toBe('BUTTON');
            expect(DOMHelper.getAttributeValue(tabbableElements[7], 'id')).toBe('button-02');

            // input type text inside fieldset
            expect(tabbableElements[8].nodeName).toBe('INPUT');
            expect(DOMHelper.getAttributeValue(tabbableElements[8], 'type')).toBe('text');
            expect(DOMHelper.getAttributeValue(tabbableElements[8], 'id')).toBe('input-05');

            // input type checkbox
            expect(DOMHelper.getAttributeValue(tabbableElements[9], 'type')).toBe('checkbox');
        });
    });
});
