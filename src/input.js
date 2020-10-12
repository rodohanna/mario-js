export class Input {
  constructor() {
    this.inputs = {
      up: { pressed: false, justPressed: false },
      left: { pressed: false, justPressed: false },
      down: { pressed: false, justPressed: false },
      right: { pressed: false, justPressed: false },
      p: { pressed: false, justPressed: false },
    };

    window.addEventListener("keydown", this._handleKeyDown.bind(this));
    window.addEventListener("keyup", this._handleKeyUp.bind(this));
  }

  endFrame() {
    for (const input of ["up", "left", "down", "right", "p"]) {
      this.inputs[input].justPressed = false;
    }
  }

  _handleKeyDown(event) {
    this._setInput(event, true);
  }

  _handleKeyUp(event) {
    this._setInput(event, false);
  }

  _setInput(event, pressed) {
    if (event.repeat) {
      return;
    }
    function handled() {
      event.stopPropagation && event.stopPropagation();
      event.preventDefault && event.preventDefault();
    }
    switch (event.key) {
      case "a":
      case "ArrowLeft":
        this.inputs.left.pressed = pressed;
        this.inputs.left.justPressed = pressed;
        handled();
        break;
      case "w":
      case "ArrowUp":
        this.inputs.up.pressed = pressed;
        this.inputs.up.justPressed = pressed;
        handled();
        break;
      case "s":
      case "ArrowDown":
        this.inputs.down.pressed = pressed;
        this.inputs.down.justPressed = pressed;
        handled();
        break;
      case "d":
      case "ArrowRight":
        this.inputs.right.pressed = pressed;
        this.inputs.right.justPressed = pressed;
        handled();
        break;
      case "p":
        this.inputs.p.pressed = pressed;
        this.inputs.p.justPressed = pressed;
        handled();
        break;
    }
  }
}
