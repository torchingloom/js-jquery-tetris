$.fn.tetris = function(options) {
    new Tetris(this, options);
};

$(document).on('keydown', function(e) {
    switch (e.keyCode) {
        default:
            break;
        case 37:
            TetrisController.moveByKey('left');
            break;
        case 38:
            TetrisController.rotateByKey('left');
            break;
        case 39:
            TetrisController.moveByKey('right');
            break;
        case 40:
            TetrisController.moveByKey('down');
            break;
    }
});


function TetrisController() {
}

TetrisController.objects = {};
TetrisController.handle_keyboard_keys_objects = [];

TetrisController.register = function (tetris)
{
    TetrisController.objects[tetris.id] = tetris;
    if (tetris.settings.handle_keyboard_keys) {
        TetrisController.handle_keyboard_keys_objects.push(tetris.id);
    }
};

TetrisController.switchPause = function (tetris_id)
{
    TetrisController.objects[tetris_id].switchPause();
};

TetrisController.start = function (tetris_id)
{
    TetrisController.objects[tetris_id].start();
};

TetrisController.rotate = function (tetris_id)
{
    TetrisController.objects[tetris_id].rotate();
};

TetrisController.rotateByKey = function ()
{
    for (var i = 0; i < TetrisController.handle_keyboard_keys_objects.length; i++) {
        TetrisController.objects[TetrisController.handle_keyboard_keys_objects[i]].rotate();
    }
};

TetrisController.move = function (tetris_id, direction)
{
    TetrisController.objects[tetris_id].move(direction);
};

TetrisController.moveByKey = function (direction)
{
    for (var i = 0; i < TetrisController.handle_keyboard_keys_objects.length; i++) {
        TetrisController.objects[TetrisController.handle_keyboard_keys_objects[i]].move(direction);
    }
};


function Tetris(element, options) {
    this.settings = $.extend(this.settings, options);
    this.startat = Date.now();
    this.id = Tetris.counter++;
    this.element = element;
    this.matrixInit();
    TetrisController.register(this);
    this.draw();
}

Tetris.counter = 0;

Tetris.prototype.settings = {
    cols: 10,
    rows: 5,
    cell_size: 26,
    colors: ['red', 'green', 'blue', 'navy', 'magenta', 'orange', 'olive'],
    background: '#f1f1f1',
    background_full: 'black',
    handle_keyboard_keys: true,
    border: '#e1e1e1',
    first_speed_ms: 1000,
    start_speed: 1,
    speed_multiplier: .1
};

Tetris.prototype.id = null;
Tetris.prototype.element = null;
Tetris.prototype.pause = false;
Tetris.prototype.speed = null;
Tetris.prototype.startat = null;
Tetris.prototype.matrix = null;
Tetris.prototype.tick = 0;
Tetris.prototype.score = 0;
Tetris.prototype.figure = null;
Tetris.prototype.figure_position = null;
Tetris.prototype.next_figure = null;
Tetris.prototype.game_over = false;
Tetris.prototype.in_progress = false;
Tetris.prototype.view_template = '<div id="tetris-gameover-%id%" style="\
z-index: 10; display: %game_over_display%; position: absolute; width: %glass_width%px; height: %glass_height%px; \
background-color: %background_full_color%; color: %backgroud_color%; filter:alpha(opacity=60); opacity:.6;\
text-align: center;">\
    <div style="margin-top: %cell_size%px;">GAME OVER</div>\
    <div style="margin-top: %cell_size%px;">SCORE %score%</div>\
    <div style="margin-top: %cell_size%px;" onclick="TetrisController.start(%id%);">&lt; START &gt;</div>\
</div>\
<div id="tetris-start-%id%" style="\
z-index: 10; display: %start_display%; position: absolute; width: %glass_width%px; height: %glass_height%px; \
background-color: %background_full_color%; color: %backgroud_color%; filter:alpha(opacity=60); opacity:.6;\
text-align: center;"><div style="margin-top: %cell_size%px;" onclick="TetrisController.start(%id%);">&lt; START &gt;</div></div>\
<div id="tetris-figure-%id%" style="\
position: absolute; top: %figure_position_top%px; left: %figure_position_left%px">%figure%</div>\
<div id="tetris-glass-%id%" style="\
    float: left; background-color: %backgroud_color%; \
    border-style: solid; border-width: 1px 0 0 1px; border-color: %border%">%glass%</div>\
    <!-- in play only -->\
<div id="tetris-info-%id%" style="float: left; margin-left: 20px;">\
    <div><button onclick="TetrisController.switchPause(%id%);">%pause_title%</button></div>\
    <div><h4>Score</h4>%score%</div>\
    <div><h4>Next</h4>%next_figure%</div>\
    <div style="text-align: center;">\
        <div><button onclick="TetrisController.rotate(%id%);">&#8635;</button></div>\
        <div>\
            <button onclick="TetrisController.move(%id%, \'left\');">&larr;</button>\
            <button onclick="TetrisController.move(%id%, \'right\');">&rarr;</button>\
        </div>\
        <div><button onclick="TetrisController.move(%id%, \'down\');">&darr;</button></div>\
    </div>\
</div>\
    <!-- / in play only -->\
<div style="clear: both;">';

Tetris.prototype.draw = function ()
{
    var html_repalce = {
        pause_title: this.pause ? '&#9658;' : '&#9616;&#9616;',
        glass: '',
        score: this.score,
        next_figure: this.next_figure ? this.next_figure.draw(this.settings.cell_size) : '',
        figure: this.figure ? this.figure.draw(this.settings.cell_size) : '',
        figure_position_top: this.figure_position ? this.figure_position[0] * this.settings.cell_size + this.figure_position[0] + 1 : 0,
        figure_position_left: this.figure_position ? this.figure_position[1] * this.settings.cell_size + this.figure_position[1] + 1 : 0,
        id: this.id,
        glass_width: this.settings.cell_size * this.matrix[0].length + this.matrix[0].length,
        glass_height: this.settings.cell_size * this.matrix.length + this.matrix.length,
        cell_style: 'float: left; width: %cell_size%px; height: %cell_size%px; margin:-1px 0 0 -1px; ',
        cell_size: this.settings.cell_size,
        backgroud_color: this.settings.background,
        background_full_color: this.settings.background_full,
        border: this.settings.border,
        game_over_display: this.game_over ? 'block' : 'none',
        start_display: !this.in_progress && !this.game_over ? 'block' : 'none'
    };
    for (var i = 0; i < this.matrix.length; i++) {
        html_repalce.glass += '<div style="overflow: hidden; width: %glass_width%px">';
        for (var j = 0; j < this.matrix[i].length; j++) {
            var cell_style = 'border: 1px solid %border%;';
            if (this.matrix[i][j]) {
                cell_style = 'background: %background_full_color%; border: 1px solid %background_full_color%;';
            }
            html_repalce.glass += '<div style="%cell_style%'+ cell_style +'"></div>';
        }
        html_repalce.glass += '</div>';
    }
    var html = this.view_template;
    for (var a in html_repalce) {
        var reg = new RegExp('%'+ a +'%', 'g');
        html = html.replace(reg, html_repalce[a]);
    }
    if (!this.in_progress) {
        html = html.replace(/<!-- in play only.*?only -->/, '');
    }
    this.element.html(html);
};

Tetris.prototype.start = function ()
{
    this.matrixInit();
    this.in_progress = true;
    this.game_over = false;
    this.doTick();
};

Tetris.prototype.doTick = function ()
{
    if (!this.in_progress || this.pause || this.game_over) {
        this.draw();
        return;
    }
    if (this.figure) {
        var mtpos = this.getFigureMaxTopPosition();
        if (mtpos <= 0) {
            this.holdFigure();
            this.gameOver();
            return;
        }
        if (this.figure_position[0] == mtpos) {
            this.holdFigure();
            this.figure = null;
        }
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
    this.futureTick();
    this.tick++;
};

Tetris.prototype.gameOver = function ()
{
    this.in_progress = false;
    this.game_over = true;
    this.figure = null;
    this.next_figure = null;
    this.draw();
};

Tetris.prototype.getFigureMaxTopPosition = function ()
{
    var matrix = [];
    for (var i = 0; i < this.matrix.length; i++) {
        matrix[i] = [];
        for (var j = this.figure_position[1]; j < this.figure_position[1] + this.figure.matrix_real_size[1]; j++) {
            matrix[i].push(this.matrix[i][j]);
        }
    }
    for (var i = 0; i < matrix.length; i++) {
        for (var j = 0; j < matrix[i].length; j++) {
            if (matrix[i][j] && this.figure.matrix[this.figure.matrix_real_size[0] - 1][j]) {
                return i - this.figure.matrix_real_size[0];
            }
        }
    }
	return this.settings.rows - this.figure.matrix_real_size[0];
};

Tetris.prototype.holdFigure = function ()
{
    var fi = this.figure_position[0];
    var fj = this.figure_position[1];
    for (var i = 0; i < this.figure.matrix_real_size[0]; i++) {
        for (var j = 0; j < this.figure.matrix_real_size[1]; j++) {
            this.matrix[fi + i][fj + j] = Math.max(this.matrix[fi + i][fj + j], this.figure.matrix[i][j]);
        }
    }
};

Tetris.prototype.switchPause = function () {
    this.pause = !this.pause;
    this.doTick();
};

Tetris.prototype.rotate = function () {
    this.figure.rotate();
    this.draw();
};

Tetris.prototype.move = function (direction) {
    switch (direction) {
        default:
            this.figure_position[1] = Math.max(this.figure_position[1] - 1, 0);
            break;
        case 'right':
            this.figure_position[1] = Math.min(
                this.figure_position[1] + 1,
                this.matrix[0].length - this.figure.matrix_real_size[1]
            );
            break;
        case 'down':
            break;
    }
    this.draw();
};

Tetris.prototype.createFigure = function ()
{
    if (!this.next_figure) {
        this.next_figure = TetrisFigure.create(this.settings.colors);
    }
    this.figure = this.next_figure;
    this.next_figure = TetrisFigure.create(this.settings.colors);
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
    //for (var i = 0; i < this.matrix[0].length; i++) {
    //    this.matrix[this.matrix.length - 1][i] = 1;
    //}
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


function TetrisFigure() { this.init(); }

TetrisFigure.classes = [
    TetrisFigure1, TetrisFigure2, TetrisFigure3, TetrisFigure4, TetrisFigure5,
    TetrisFigure6, TetrisFigure7
];
TetrisFigure.prototype.base_matrix = [ [0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0] ];
TetrisFigure.prototype.matrix_real_size = null;
TetrisFigure.prototype.matrix = null;
TetrisFigure.prototype.color = null;

TetrisFigure.prototype.init = function ()
{
    this.matrix = this.base_matrix;
    this.rotate('random');
};

TetrisFigure.prototype.rotate = function (random)
{
    if (random) {
        for (var i = 0; i < Math.round(Math.random() * 3); i++) {
            this.rotate();
        }
        return;
    }
    var matrix = [ [0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0] ];
    var matrix_size = matrix.length;
    for (var i = 0; i < matrix_size; i++) {
        for (var j = 0; j < matrix_size; j++) {
            matrix[j][matrix_size - 1 - i] = this.matrix[i][j];
        }
    }
    this.matrix = matrix;
    this.fixMatrix();
};

TetrisFigure.prototype.fixMatrix = function ()
{
    this.matrix_real_size = [4, 4];
    var matrix = [];
    var matrix_size = this.matrix.length;
    for (var i = 0; i < matrix_size; i++) {
        var row_exists = false;
        for (var j = 0; j < matrix_size; j++) {
            if (this.matrix[i][j]) {
                row_exists = true;
            }
        }
        if (row_exists) {
            matrix[matrix.length] = this.matrix[i];
        }
    }
    this.matrix_real_size[0] = matrix.length;
    while (matrix.length < matrix_size) {
        matrix[matrix.length] = [0,0,0,0];
    }
    var empty_left = true;
    while (empty_left) {
        for (var i = 0; i < matrix_size; i++) {
            if (matrix[i][0]) {
                empty_left = false;
                break;
            }
        }
        if (empty_left) {
            for (var i = 0; i < matrix_size; i++) {
                for (var j = 1; j < matrix_size; j++) {
                    matrix[i][j - 1] = matrix[i][j];
                }
                matrix[i][matrix_size - 1] = 0;
            }
            this.matrix_real_size[1] -= 1;
        }
    }
    this.matrix = matrix;
};

TetrisFigure.create = function (colors)
{
    var c = TetrisFigure.getRandomClass();
    var obj = new c();
    while (obj.color == TetrisFigure.prev_selected_color) {
        obj.color = TetrisFigure.getArrayRandomElement(colors);
    }
    return obj;
};

TetrisFigure.prev_selected_class = null;
TetrisFigure.prev_selected_color = null;

TetrisFigure.getRandomClass = function ()
{
    var c = null;
    while (c == TetrisFigure.prev_selected_class) {
        c = TetrisFigure.getArrayRandomElement(TetrisFigure.classes);
    }
    return TetrisFigure1;
    return c;
};

TetrisFigure.getArrayRandomElement = function (arr)
{
	return arr[Math.floor(Math.random() * arr.length)];
};

TetrisFigure.prototype.draw = function (cell_size)
{
    var html = '';
    var style = 'width: '+ (cell_size + 1) +'px; height: '+ (cell_size + 1) +'px; float: left; ';
    for (var i = 0; i < this.matrix.length; i++) {
        for (var j = 0; j < this.matrix.length; j++) {
            var this_style = style;
            if (this.matrix[i][j]) {
                this_style += 'background: '+ this.color +';';
            }
            html += '<div style="'+ this_style +'"></div>';
        }
    }
    return '<div style="width: '+ (cell_size * 4 + 4) +'px">'+ html +'</div><div style="clear: both"></div>';
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
