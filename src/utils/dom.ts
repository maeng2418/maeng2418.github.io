const BODY = "body";

export const getElements = (selector: string): NodeListOf<Element> =>
  document.querySelectorAll(selector);
export const getElement = (selector: string) => document.querySelector(selector);
export const addClass = (element: HTMLElement, className: string) =>
  element.classList.add(className);
export const removeClass = (element: HTMLElement, className: string) =>
  element.classList.remove(className);
export const hasClass = (element: HTMLElement, className: string) =>
  element.classList.contains(className);
export const getBody = (): Element | null => getElement(BODY);
export const addClassToBody = (className: string) => addClass(getBody() as HTMLElement, className);
export const removeClassToBody = (className: string) =>
  removeClass(getBody() as HTMLElement, className);
export const hasClassOfBody = (className: string) => hasClass(getBody() as HTMLElement, className);
export const getRect = (className: string) =>
  (getElement(className) as HTMLElement).getBoundingClientRect();
export const getPosY = (className: string) => getRect(className).y;

export const getDocumentHeight = () => document.documentElement.offsetHeight;
