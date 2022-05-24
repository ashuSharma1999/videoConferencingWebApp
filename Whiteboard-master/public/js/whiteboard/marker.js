class Marker {
    constructor() {
        this.color = COLOR_BLACK;
        this.radius = 1;
    }
    setColor(context, color) {
        this.color = color;
        context.fillStyle = this.color;
        context.strokeStyle = this.color;
        context.lineJoin = "round";
        context.lineCap = "round";
    }
    setRadius(context, radius) {
        this.radius = radius;
        context.lineWidth = this.radius;
    }
    getColor() {
        return this.color;
    }
    getRadius() {
        return this.radius;
    }
    draw(context, x1, y1, x2, y2) {
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.closePath();
        context.stroke();
    }
}