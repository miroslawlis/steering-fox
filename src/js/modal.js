export const modalClasses = ["background", "modal"];

export default function dialogCloseHandler(element) {
  element.closest("dialog").close();
}
