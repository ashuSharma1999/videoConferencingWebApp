class Whiteboard {
    constructor(canvas, width, height, resolution) {
        // Class members
        this.canvas = canvas;
        this.height = height;
        this.width = width;
        this.resolution = resolution;
        this.context = this._setupContextBoard();
        this.marker = new Marker();
        this.mode = MODE_IDLE;
        this.state = STATE_PEN_UP;
        this.origin = this.canvas.getBoundingClientRect();
        this.currX = 0;
        this.currY = 0;
        this.background = COLOR_WHITE;
        this.buffer = {};
        this.cursor = null;
        // Mouse event Handlers
        this._penDownHandler = null;
        this._penUpHandler = null;
        this._executeActionHandler = null;
        this._mouseLeaveHandler = null;
        this._windowChangeHandler = null;
        // Touch event Handlers
        this._touchDownHandler = null;
        this._touchUpHandler = null;
        this._executeTouchActionHandler = null;
        this._touchCancelHandler = null;
    }
    _setupContextBoard() {
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;
        this.canvas.width = Math.ceil(this.width * this.resolution);
        this.canvas.height = Math.ceil(this.height * this.resolution);
        let context = this.canvas.getContext('2d');
        context.scale(this.resolution, this.resolution);
        return context;
    }
    _executeAction(event) {
        if (this.state == STATE_PEN_DOWN) {
            switch(this.mode) {
                case MODE_DRAW      : this._draw(event); break;
                case MODE_ERASE     : this._erase(event); break;
                case MODE_LINE      : this._line(event); break;
                case MODE_IDLE      : console.log("I'm on a break!"); break;
            }
        }
    }
    _penDown(event) {
        this._saveBuffer();
        let clientX, clientY;
        if (event.touches) { 
            clientX = event.touches[0].pageX; 
            clientY = event.touches[0].pageY; 
        } else {
            clientX = event.pageX; 
            clientY = event.pageY;
        }
        this.currX = clientX - this.origin.x
        this.currY = clientY - this.origin.y;
        this.setState(STATE_PEN_DOWN);
    }
    _penUp(event) {
        this._draw(event);
        this._loadBuffer();
    }
    _windowChange(_) {
        console.log("changed");
        this.origin = this.canvas.getBoundingClientRect();
    }
    _mouseLeave() {
        this._loadBuffer();
    }
    _touchUp(event) {
        this._penUp(event);
        event.preventDefault();
        event.stopPropagation();
    }
    _touchDown(event) {
        this._penDown(event);
        event.preventDefault();
        event.stopPropagation();
    }
    _executeTouchAction(event) {
        this._executeAction(event);
        event.preventDefault();
        event.stopPropagation();
    }
    _touchCancel(event) {
        this._mouseLeave();
        event.preventDefault();
        event.stopPropagation();
    }
    _sizeChange(event) {
        this._windowChange();
        event.preventDefault();
        event.stopPropagation();
    }
    _loadBuffer() {
        this.setState(this.buffer.state);
        this.setColor(this.buffer.color);
        this.setWidth(this.buffer.width);
    }
    _saveBuffer() {
        this.buffer.state = this.getState();
        this.buffer.color = this.getColor();
        this.buffer.width = this.getWidth();
    }
    _draw(event) {
        let clientX, clientY;
        if (event.touches) { 
            clientX = event.touches[0].pageX; 
            clientY = event.touches[0].pageY; 
        } else {
            clientX = event.pageX; 
            clientY = event.pageY;
        }
        const nextX = clientX - this.origin.x;
        const nextY = clientY - this.origin.y;
        this.marker.draw(this.context, this.currX, this.currY, nextX, nextY);
        this.currX = nextX;
        this.currY = nextY;
    }
    _erase(event) {
        if (this.getColor() != this.background) {
            this.setColor(this.background);
            this.setWidth(this.getWidth() * 5);
        }
        this._draw(event);
    }
    _line(_) {
        console.log("making line! Keep going");
    }
    startEventLoop() {
        if (this._penDownHandler===null)                { this._penDownHandler = this._penDown.bind(this); }
        if (this._executeActionHandler===null)          { this._executeActionHandler = this._executeAction.bind(this); }
        if (this._penUpHandler===null)                  { this._penUpHandler = this._penUp.bind(this); }
        if (this._mouseLeaveHandler===null)             { this._mouseLeaveHandler = this._mouseLeave.bind(this); }
        if (this._windowChangeHandler===null)           { this._windowChangeHandler = this._windowChange.bind(this); }
        if (this._touchDownHandler === null)            { this._touchDownHandler = this._touchDown.bind(this); }
        if (this._touchUpHandler === null)              { this._touchUpHandler = this._touchUp.bind(this); }
        if (this._executeTouchActionHandler === null)   { this._executeTouchActionHandler = this._executeTouchAction.bind(this); }
        if (this._touchCancelHandler === null)          { this._touchCancelHandler = this._touchCancel.bind(this); }
        this.canvas.addEventListener('mousedown', this._penDownHandler, true);
        this.canvas.addEventListener('mousemove', this._executeActionHandler, true);
        this.canvas.addEventListener('mouseup', this._penUpHandler, true);
        this.canvas.addEventListener('mouseleave', this._mouseLeaveHandler, true);
        this.canvas.addEventListener('touchstart', this._touchDownHandler, true);
        this.canvas.addEventListener('touchend', this._touchUpHandler, true);
        this.canvas.addEventListener('touchmove', this._executeTouchActionHandler, true);
        this.canvas.addEventListener('touchcancel', this._touchCancelHandler, true);
        window.addEventListener('resize', this._windowChangeHandler, true);
    }
    stopEventLoop() {
        this.canvas.removeEventListener('mousedown', this._penDownHandler, true);
        this.canvas.removeEventListener('mousemove', this._executeActionHandler, true);
        this.canvas.removeEventListener('mouseup', this._penUpHandler, true);
        this.canvas.removeEventListener('mouseleave', this._mouseLeaveHandler, true);
        this.canvas.removeEventListener('touchstart', this._touchDownHandler, true);
        this.canvas.removeEventListener('touchend', this._touchUpHandler, true);
        this.canvas.removeEventListener('touchmove', this._executeTouchActionHandler, true);
        this.canvas.removeEventListener('touchcancel', this._touchCancelHandler, true);
        window.removeEventListener('resize', this._windowChangeHandler, true);
    }    
    setBackground(background) {
        this.background = background;
        this.context.globalCompositeOperation = 'destination-over';
        this.context.fillStyle = this.background;
        this.context.fillRect(0, 0, this.width, this.height);
        this.context.globalCompositeOperation = 'source-over';
    }
    resetBoard() {
        this.context = this._setupContextBoard();
        this.setCursor(this.cursor);
        this.setBackground(this.background);
        this.setMode(this.mode);
        this.setColor(this.marker.color);
        this.setWidth(this.marker.radius);
    }
    attachSocket(socket, socketName, functionType) {
        switch (functionType) {
            case FUNCTION_DRAW: {
                let draw = this._draw.bind(this);
                this._draw = function(event) {
                    draw(event);
                    let payload = {x:this.currX, y:this.currY, c:this.getColor(), w:this.getWidth()};
                    socket.emit(socketName, payload);
                }
            }
            case FUNCTION_PENDOWN: {
                let penDown = this._penDown.bind(this);
                this._penDown = function(event) {
                    penDown(event);
                    let payload = {x:this.currX, y:this.currY, c:this.getColor(), w:this.getWidth()};
                    socket.emit(socketName, payload);
                }
            }
        };
    }
    // setters and getters
    setColor(color) {
        this.marker.setColor(this.context, color);
    }
    getColor() {
        return this.marker.getColor();
    }
    setWidth(width) {
        this.marker.setRadius(this.context, width);
    }
    getWidth() {
        return this.marker.getRadius();
    }
    setMode(mode) {
        this.mode = mode;
    }
    getMode() {
        return this.mode;
    }
    setState(state) {
        this.state = state;
    }
    getState() {
        return this.state;
    }
    setCursor(cursor) {
        this.cursor = cursor;
        this.canvas.style.cursor = this.cursor;
    }
};