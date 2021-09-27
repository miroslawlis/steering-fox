var modalClasses = ["background", "modal"];
var linkModal = document.querySelector('link[rel="import"]');

function modalClose(element) {
  let elParentToClose = element.offsetParent.offsetParent;

  // if parent of parent constains classes 'background' and 'modal', then close/destroy modal popup
  if (
    elParentToClose.classList.contains(modalClasses[0]) &&
    elParentToClose.classList.contains(modalClasses[1])
  ) {
    // elParentToClose.classList.toggle('hide');
    elParentToClose.remove();
  }
}

document.onclick = function (event) {
  // if clicked out side of popup content and popup is visible then hide popup
  if (
    event.target.classList.contains(modalClasses[0]) &&
    event.target.classList.contains(modalClasses[1])
  ) {
    event.target.remove();
  }
};
