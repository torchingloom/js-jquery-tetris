$.fn.tetris = function(options) {
    new Tetris(this, options);
};

function Tetris(element, options) {
    this.settings = $.extend(this.settings, options);
    this.start = Date.now();
    this.id = Tetris.counter++;
    this.element = element;
    this.doTick();
}

Tetris.counter = 0;

Tetris.prototype.settings = {
    cols: 10,
    rows: 20,
    cell_size: 20,
    colors: ['red', 'green', 'blue'],
    show_lines: true,
    background: 'white',
    first_speed_ms: 1000,
    start_speed: 1,
    speed_multiplier: .1
};

Tetris.prototype.id = null;
Tetris.prototype.element = null;
Tetris.prototype.pause = false;
Tetris.prototype.speed = null;
Tetris.prototype.start = null;
Tetris.prototype.matrix = null;
Tetris.prototype.tick = 0;
Tetris.prototype.score = 0;
Tetris.prototype.figure = null;
Tetris.prototype.figure_position = null;
Tetris.prototype.next_figure = null;
Tetris.prototype.pause_button_template = '<div style="border: 1px solid red"></div>';
Tetris.prototype.view_template = '\
<div id="tetris-figure-%id%" style="position: absolute; top: %figure_position_top%px; left: %figure_position_left%px">%figure%</div>\
<div id="tetris-glass-%id%" style="float: left; border: 1px solid black; width:%glass_width%px;">%glass%</div>\
<div id="tetris-info-%id%" style="float: left; margin-left: 20px;">\
   <div><h4>Score</h4>%score%</div>\
   <div><h4>Next</h4>%next_figure%</div>\
</div>\
<div style="clear: both;">';

Tetris.prototype.draw = function ()
{
    var html_repalce = {
        glass: '',
        score: this.score,
        next_figure: this.next_figure.draw(this.settings.cell_size),
        figure: this.figure.draw(this.settings.cell_size),
        figure_position_top: this.figure_position[0] * this.settings.cell_size + this.figure_position[0] + 1,
        figure_position_left: this.figure_position[1] * this.settings.cell_size + this.figure_position[1] + 1,
        id: this.id,
        glass_width: this.settings.cell_size * this.matrix[0].length + this.matrix[0].length,
        cell_size: this.settings.cell_size,
    };
    if (this.settings.show_lines) {
        var bricks_count = this.matrix.length * this.matrix[0].length;
        for (var i = 0; i < bricks_count; i++) {
            html_repalce.glass += '\
<div style="float: left; width: %cell_size%px; height: %cell_size%px; border: 1px solid black; margin-left: -1px; margin-top: -1px"></div>';
        }
    }
    var html = this.view_template;
    for (var a in html_repalce) {
        var reg = new RegExp('%'+ a +'%', 'g');
        html = html.replace(reg, html_repalce[a]);
    }
    this.element.html(html);
};

Tetris.prototype.doTick = function ()
{
    this.tick++;
    //console.log(this.tick);
    if (!this.matrix) {
        this.matrixInit();
    }
    if (!this.figure) {
        this.createFigure();
        var xpos = Math.round(parseFloat(this.matrix[0].length) / 2 - parseFloat(this.figure.matrix[0].length) / 2);
        this.figure_position = [0, xpos];
    }
    else {
        this.figure_position[0] += 1;
    }
    this.draw();
    //this.futureTick();
};

Tetris.prototype.createFigure = function ()
{
    if (!this.next_figure) {
        this.next_figure = TetrisFigure.create();
    }
    this.figure = this.next_figure;
    this.next_figure = TetrisFigure.create();
};

Tetris.prototype.matrixInit = function ()
{
    this.matrix = [];
    for (var i = 0; i < this.settings.rows; i++) {
        this.matrix[i] = [];
        for (var j = 0; j < this.settings.cols; j++) {
            this.matrix[i][j] = 0;
        }
    }
};

Tetris.prototype.futureTick = function ()
{
    if (!this.speed) {
        this.speed = this.settings.start_speed;
    }
    //TODO calc delay
    var delay = this.settings.first_speed_ms;
    var self = this;
    setTimeout(function () { self.doTick() }, delay);
};




function TetrisFigure(kind) {}

TetrisFigure.classes = [
    TetrisFigure1, TetrisFigure2, TetrisFigure3, TetrisFigure4, TetrisFigure5,
    TetrisFigure6, TetrisFigure7
];
TetrisFigure.prototype.base_matrix = [ [0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0] ];
TetrisFigure.prototype.matrix = null;
TetrisFigure.prototype.color = 'green';

TetrisFigure.prototype.init = function ()
{
    this.rotate();
};

TetrisFigure.create = function ()
{
    var c = TetrisFigure.getRandomClass();
    return new c();
};

TetrisFigure.prev_random_class = null;

TetrisFigure.getRandomClass = function ()
{
    var c = null;
    while (c == TetrisFigure.prev_random_class) {
        c = TetrisFigure.classes[Math.floor(Math.random() * TetrisFigure.classes.length)];
    }
    return c;
};

TetrisFigure.prototype.rotate = function (direction)
{
    if (!this.matrix) {
        this.matrix = this.base_matrix;
        return 0;
    }
};

TetrisFigure.prototype.draw = function (cell_size)
{
    var html = '';
    var style = 'width: '+ (cell_size + 1) +'px; height: '+ (cell_size + 1) +'px; float: left; ';
    for (var i = 0; i < this.matrix.length; i++) {
        for (var j = 0; j < this.matrix.length; j++) {
            var this_style = style;
            if (this.matrix[i][j]) {
                this_style += 'background: red;';
            }
            html += '<div style="'+ this_style +'"></div>';
        }
    }
    return '<div style="width: '+ (cell_size * 4 + 10) +'px">'+ html +'</div><div style="clear: both"></div>';
};


function TetrisFigure1() { this.init(); }
TetrisFigureSetup(TetrisFigure, TetrisFigure1);
TetrisFigure1.prototype.base_matrix = [ [1,1,0,0], [1,1,0,0], [0,0,0,0], [0,0,0,0] ];


function TetrisFigure2() { this.init(); }
TetrisFigureSetup(TetrisFigure, TetrisFigure2);
TetrisFigure2.prototype.base_matrix = [ [1,1,1,1], [0,0,0,0], [0,0,0,0], [0,0,0,0] ];


function TetrisFigure3() { this.init(); }
TetrisFigureSetup(TetrisFigure, TetrisFigure3);
TetrisFigure3.prototype.base_matrix = [ [1,1,1,0], [0,1,0,0], [0,0,0,0], [0,0,0,0] ];


function TetrisFigure4() { this.init(); }
TetrisFigureSetup(TetrisFigure, TetrisFigure4);
TetrisFigure4.prototype.base_matrix = [ [1,0,0,0], [1,1,1,0], [0,0,1,0], [0,0,0,0] ];


function TetrisFigure5() { this.init(); }
TetrisFigureSetup(TetrisFigure, TetrisFigure5);
TetrisFigure5.prototype.base_matrix = [ [0,0,1,0], [1,1,1,0], [1,0,0,0], [0,0,0,0] ];


function TetrisFigure6() { this.init(); }
TetrisFigureSetup(TetrisFigure, TetrisFigure6);
TetrisFigure6.prototype.base_matrix = [ [1,1,1,0], [0,0,1,0], [0,0,0,0], [0,0,0,0] ];

function TetrisFigure7() { this.init(); }
TetrisFigureSetup(TetrisFigure, TetrisFigure7);
TetrisFigure7.prototype.base_matrix = [ [1,1,1,0], [1,0,0,0], [0,0,0,0], [0,0,0,0] ];


function TetrisFigureSetup(Parent, Child) {
    var F = function() { };
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Child;
    Child.superclass = Parent.prototype;
}
