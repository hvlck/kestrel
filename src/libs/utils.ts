// Utilities

/**
 * A restrictive method of generating HTML elements for the b() function
 */
export enum ElementTag {
    H1,
    H2,
    H3,
    H4,
    H5,
    H6,
    P,
    Img,
    Canvas,
    Script,
    Link,
    Title,
    Meta,
    Div,
    Input,
    Button,
    Label,
    Select,
    Option,
    A,
    Nav,
    Hr,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Span,
}

/**
 * scaffolding for easily creating an html element
 * @param type The type of HTML element to create
 * @param text Optional text of the HTML element
 * @param attributes - Attributes to apply to the HTML element
 */
export function b(type: ElementTag, text?: string, attributes?: { [key: string]: string }) {
    let element = document.createElement(type.toString());
    element.innerText = text || '';
    if (attributes) {
        Object.keys(attributes).forEach((item) => {
            if (element.hasAttribute(item)) {
                if (item.includes('data_')) {
                    element.setAttribute(item.replace(new RegExp('_', 'g'), '-'), attributes[item]);
                } else {
                    element.setAttribute(item, attributes[item]);
                }
            }
        });
    }
    return element;
}
