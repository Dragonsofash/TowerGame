class Building {
  constructor({ position = { x: 0, y: 0 } }) {
    this.position = position;
    this.width = 64 * 2;
  }

  draw() {
    c.fillStyle = "blue";
    c.fillRect(this.position.x, this.position.y, this.width, 64);
  }
}
