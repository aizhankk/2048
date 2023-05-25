var config = {
    bonus_point: 4,
    max : 2048,
}

var log = console.log.bind(console);
var random = function (start, end) {
    start = start === void 0 ? 0 : start;
    end = end === void 0 ? 1 : end;
    end = end + 1;
    var rand = Math.random() * (end - start) + start;
    return Math.floor(rand);
};
var $ = function (elem) {
    return document.querySelectorAll(elem);
}
var on = function (elem, type, callback) {
    elem.addEventListener(type, function (e) {
        callback(e);
    });
}

var indexToPos = function (index) {
    return {
        x: index % 4,
        y: Math.floor(index / 4),
    }
}

var getLocalStorage = function (key) {
    return localStorage[key] ?
        JSON.parse(localStorage[key]) : null;
}

var touchMoveDir = function (elem, min, callback) {
    var touchPos = {
        beforeX: 0,
        beforeY: 0,
        afterX: 0,
        afterY: 0,
    }
    var move = false;
    var dir;
    on(elem, 'touchstart', function (e) {
        touchPos.beforeX = e.touches[0].clientX;
        touchPos.beforeY = e.touches[0].clientY;
    });
    on(elem, 'touchmove', function (e) {
        move = true;
        touchPos.afterX = e.touches[0].clientX;
        touchPos.afterY = e.touches[0].clientY;
    });
    on(elem, 'touchend', function (e) {
        if (!move) return;
        var x = touchPos.beforeX - touchPos.afterX;
        var y = touchPos.beforeY - touchPos.afterY;
        log(x, y);
        if (Math.abs(x) < min && Math.abs(y) < min) {
            return;
        }
        if (Math.abs(x) > Math.abs(y)) {
            dir = x > 0 ? 0 : 2;
        } else {
            dir = y > 0 ? 1 : 3;
        }
        move = false;
        callback(dir);
    });
};



function event(game) {

    var down = false;

    var gameContainer = $('.korobka')[0];

    on(window, 'keydown', function (e) {
        if (down) return;
        down = true;
        var num = e.keyCode - 37;
        if (num >= 0 && num <= 3) {
            game.move(num);
        }
    });

    on(window, 'keyup', function () {
        down = false;
    });

    touchMoveDir(gameContainer, 15, function (dir) {
        game.move(dir);
    });

    on($('.kaitadan')[0], 'click', function (e) {
        e.preventDefault();
        game.restart();
    });

    on(window, 'resize', function () {
        game.view.resize();
    });

    // 自动测试
    var autoTest = false;

    if (autoTest) {
        (function () {
            var timer = setInterval(function () {
                var moveInfo = game.move(random(0, 3));
                if (!moveInfo) {
                    clearInterval(timer);
                }
            }, 20);
        })();
    }
}





var data = {
    score: 0,
    best: 0,
    cell: [

    ]
}
var indexs = [
    // left
    [
        [0, 1, 2, 3],
        [4, 5, 6, 7],
        [8, 9, 10, 11],
        [12, 13, 14, 15],
    ],
    // top
    [
        [0, 4, 8, 12],
        [1, 5, 9, 13],
        [2, 6, 10, 14],
        [3, 7, 11, 15],
    ],
    // right
    [
        [3, 2, 1, 0],
        [7, 6, 5, 4],
        [11, 10, 9, 8],
        [15, 14, 13, 12],
    ],
    // bottom
    [
        [12, 8, 4, 0],
        [13, 9, 5, 1],
        [14, 10, 6, 2],
        [15, 11, 7, 3],
    ]
]




on(window, 'load', function () {
    var view = new View();
    var game = new Game();
    game.init(view);
    event(game);
});

var View = (function () {

    var tileContainer = $('.tile-container')[0];
    var scoreContainer = $('.ball')[0];
    var scoreDom = $('.ball .score')[0];
    var scoreAddition = $('.score-addition')[0];
    var bestDom = $('.otvet .score')[0];
    var failureContainer = $('.fail')[0];
    var winningContainer = $('.win')[0];
    var View = function () {

    };

    View.prototype = {
        setup: function () {
            failureContainer.classList.remove('action');
            winningContainer.classList.remove('action');
            this.updateScore(data.score);
            this.updateBest();
        },
        restart: function () {
            tileContainer.innerHTML = "";
        },
        resize: function () {
            var _this = this;
            data.cell.forEach(function (el, index) {
                var tile = _this.getTile(index);
                if (!tile) return;
                var pos = _this.getPos(indexToPos(index));
                _this.setPos(tile, pos);
            });
        },
        failure: function () {
            failureContainer.classList.add('action');
        },
        winning: function () {
            winningContainer.classList.add('action');
        },
        restoreTile: function () {
            var _this = this;
            data.cell.forEach(function (el, index) {
                if (el.val !== 0) {
                    _this.appear(index);
                }
            });
        },
        addScoreAnimation: function (score) {
            if (!score) return;
            scoreAddition.innerHTML = '+' + score;
            scoreAddition.classList.add('action');
            setTimeout(function () {
                scoreAddition.classList.remove('action');
            }, 500);
        },
        updateScore: function (score) {
            scoreDom.innerHTML = data.score;
            this.addScoreAnimation(score);
        },
        updateBest: function () {
            bestDom.innerHTML = data.best;
        },
        setInfo: function (elem, pos, index) {
            elem.style.left = pos.left + 'px';
            elem.style.top = pos.top + 'px';
            elem.setAttribute('data-index', index);
        },
        getTile: function (index) {
            return $(`.tile[data-index='${index}']`)[0];
        },
        getPos: function (pos) {
            var gridCell = $(`.lin:nth-child(${pos.y+1}) .uia:nth-child(${pos.x+1})`)[0];
            return {
                left: gridCell.offsetLeft,
                top: gridCell.offsetTop,
            }
        },
        setPos: function (elem, pos) {
            elem.style.left = pos.left + 'px';
            elem.style.top = pos.top + 'px';
        },
        createTileHTML: function (obj) {
            var tile = document.createElement('div');
            tile.className = obj.classNames;
            tile.innerHTML = obj.val;
            tile.setAttribute('data-index', obj.index);
            tile.setAttribute('data-val', obj.val);
            this.setPos(tile, obj.pos);
            return tile;
        },
        appear: function (index) {
            var last = data.cell[index];
            var pos = this.getPos(indexToPos(index));
            var newTile = this.createTileHTML({
                val: last.val,
                pos: pos,
                index: index,
                classNames: " tile new-tile",
            });
            tileContainer.appendChild(newTile);
        },
        remove: function (index) {
            var tile = this.getTile(index);
            tile.parentElement.removeChild(tile);
        },
        move: function (old_index, index) {
            var tile = this.getTile(old_index);
            var pos = this.getPos(indexToPos(index));
            this.setInfo(tile, pos, index);
        },
        updateVal: function (index) {
            var tile = this.getTile(index);
            var val = data.cell[index].val;
            tile.setAttribute('data-val', val);
            tile.innerHTML = val;
            tile.classList.add('addition');
            setTimeout(function () {
                tile.classList.remove('addition');
                tile.classList.remove('new-tile');
            }, 300);
        },
    }

    return View;

})();