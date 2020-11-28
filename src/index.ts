const container: HTMLDivElement = document.createElement("div");
const previous: HTMLSpanElement = container.appendChild(document.createElement("span"));
const actual: HTMLSpanElement = container.appendChild(document.createElement("span"));
const next: HTMLSpanElement = container.appendChild(document.createElement("span"));

container.style.position = "fixed";
container.style.top =
container.style.left =
container.style.width =
container.style.height = "0";

previous.tabIndex =
actual.tabIndex =
next.tabIndex = 0;

let currentOptions: IOptions = {};
actual.addEventListener("blur", function onActualBlur(event: FocusEvent): void {
    setTimeout(() => {
        const element: Element = document.activeElement;
        switch (element) {
            case previous: {
                if (currentOptions.onPrevious) {
                    currentOptions.onPrevious();
                }
                break;
            }
            case next: {
                if (currentOptions.onNext) {
                    currentOptions.onNext();
                }
                break;
            }
            default: {
                const mainElement: HTMLElement | undefined = currentOptions.element;
                let parent: Element | null = element;
                if (mainElement != null) {
                    while (parent && parent !== mainElement) {
                        parent = parent.parentElement;
                    }
                }
                if (parent != null) {
                    if (currentOptions.onFocusInside && currentOptions.onFocusInside(element)) {
                        container.removeChild(previous);
                        element.insertAdjacentElement("beforebegin", previous);
                        container.removeChild(next);
                        element.insertAdjacentElement("afterend", next);
                        element.addEventListener("blur", function onElementBlur(event: FocusEvent): void {
                            previous.parentElement.removeChild(previous);
                            actual.insertAdjacentElement("beforebegin", previous);
                            next.parentElement.removeChild(next);
                            actual.insertAdjacentElement("afterend", next);
                            element.removeEventListener("blur", onElementBlur);
                            onActualBlur.call(null, event);
                        });
                        return;
                    }
                } else {
                    if (currentOptions.onFocusOutside && currentOptions.onFocusOutside(element)) {
                        release();
                        return;
                    }
                }
            }
        }
        actual.focus();
    });
});

export interface IOptions {
    element?: HTMLElement;
    onFocusInside?: (element: Element) => boolean; // if true: prevent default
    onFocusOutside?: (element: Element) => boolean; // if true: prevent default
    onPrevious?: () => void;
    onNext?: () => void;
}

export function hold(options?: IOptions): void {
    currentOptions = {
        element: document.body,
        ...options
    };
    document.body.appendChild(container);
    actual.focus();
}
export function release(): void {
    if (!container.isConnected) {
        return;
    }
    currentOptions = {};
    document.body.removeChild(container);
}