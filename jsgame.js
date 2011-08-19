
var jsgame = function(container) {

    var launchgame = function() {
        container.html('<canvas id="the-game" width="640" height="384">Your browser is shit, get a real one and come back.</canvas>');

        var canvas = document.getElementById("the-game");
        if (!canvas.getContext)
            return;

        var state = {screen: canvas};
        init(state);

        var pastTime = new Date();
        var show_framerate = true;
        var frames = 0;
        var framerate_counter = 0.;
        var last_framerate = "";
        var limit_framerate = null;
        var minimum_framerate = 20;
        var iteration = function() {
            var tmpTime = new Date();
            var rdeltat = (tmpTime - pastTime) / 1000.;
            var deltat = rdeltat;
            if (minimum_framerate)
                deltat = Math.min(1. / minimum_framerate, deltat);
            pastTime = tmpTime;

            loop(state, deltat);

            if (show_framerate) {
                frames ++;
                framerate_counter += rdeltat;
                if (framerate_counter >= 1) {
                    last_framerate = "" + frames; 
                    frames = 0;
                    framerate_counter -= 1;
                }
                canvas.getContext("2d").font = '15px sans-serif';
                canvas.getContext("2d").fillStyle = "rgb(255, 255, 255)";
                canvas.getContext("2d").fillText(last_framerate, 0, state.size[1]);
            }
            var timeout = 0;
            if (limit_framerate)
                timeout = Math.max(((1. / limit_framerate) - rdeltat) * 1000, 0);
            timeout *= 2; //precision compensation
            setTimeout(iteration, timeout);
        }
        iteration();
    };

    var init = function(state) {
        var unit_size = state.unit_size = [32, 32];
        state.board_size = [state.screen.width / unit_size[0], state.screen.height / unit_size[1]];

        var wall = state.wall = document.createElement("canvas");
        wall.width = unit_size[0];
        wall.heigth = unit_size[1];
        var wctx = wall.getContext("2d")
        wctx.fillStyle = "rgb(0, 0, 255)";
        wctx.fillRect(unit_size[0] / 4, unit_size[1] / 4, unit_size[0] / 2, unit_size[1] / 2);
        var round = state.round = document.createElement("canvas");
        round.width = unit_size[0];
        round.heigth = unit_size[1];
        var rctx = round.getContext("2d")
        rctx.fillStyle = "rgb(255, 255, 0)";
        rctx.beginPath();
        rctx.arc(unit_size[0] / 2, unit_size[1] / 2, unit_size[0] / 8, 0, Math.PI*2, true);
        rctx.closePath();
        rctx.fill();

        state.size = [640, 384]; 
        state.coords = [25, 25];
        state.speed = [100., 50.];
        state.current_stage_index = 0;
        update_stage(state);
    };

    var loop = function(state, deltat) {
        var coords = state.coords = _.map(_.zip(state.coords, state.speed, state.size), function(x) {return (x[0] + (x[1] * deltat)) % x[2];});

        var darea = state.screen.getContext("2d");
        darea.fillStyle = "rgb(0,0,0)";
        darea.fillRect(0,0,state.size[0],state.size[1]);

        _.each(_.range(state.board_size[0]), function(i) {
            _.each(_.range(state.board_size[1]), function(j) {
                if (state.stage[i][j] == 'x') {
                    looping_draw(state.screen, state.wall, [i * state.unit_size[0], j * state.unit_size[1]]);
                } else if (state.stage[i][j] == 'p') {
                    looping_draw(state.screen, state.round, [i * state.unit_size[0], j * state.unit_size[1]]);
                }
            });
        });
        
        looping_draw(state.screen, state.round, coords);
        
    };

    var update_stage = function(state) {
        var stagetxt = stages[state.current_stage_index];
        var stage = [[]];
        var phantoms = state.phantoms = [];
        var pac = state.pac = {};
        _.each(_.range(stagetxt.length), function(i) {
            var c = stagetxt[i];
            if (c == 'x') {
                stage[stage.length - 1].push("x");
            } else if (c == ' ') {
                stage[stage.length - 1].push("p");
            } else if (c == '\n') {
                stage.push([]);
            } else if (c == 'F') {
                stage[stage.length - 1].push('p');
                phantoms.push({rect: {coord: [stage[stage.length - 1].length -1, stage.length - 1], size: stage.unit_size}});
            } else if (c == 'S') {
                stage[stage.length - 1].push(' ');
                pac.rect = {coord: [stage[stage.length - 1].length -1, stage.length - 1], size: stage.unit_size};
            }
        });
        state.stage = _.zip.apply(_, stage);

    };

    var looping_test_collision = function(screen, r1, r2) {
        if (test_collision(r1, r2)) return true;
        var func = function(r1, r2) {
            if (test_collision(r1, {coord: [r2.coord[0], r2.coord[1] - screen.height], size: r2.size})) return true;
            if (test_collision(r1, {coord: [r2.coord[0] - screen.width, r2.coord[1]], size: r2.size})) return true;
            if (test_collision(r1, {coord: [r2.coord[0] - screen.width, r2.coord[1] - screen.height], size: r2.size})) return true;
            return false;
        }
        if (func(r1, r2)) return true;
        if (func(r2, r1)) return true;
        return false;
    };

    var test_collision = function(r1, r2) {
        if (r1.coord[1] + r1.size[1] < r2.coord[1]) return false;
        if (r1.coord[1] > r2.coord[1] + r2.size[1]) return false;
        if (r1.coord[0] + r1.size[0] < r2.coord[0]) return false;
        if (r1.coord[0] > r2.coord[0] + r2.size[0]) return false;
        return true;
    };

    var looping_draw = function(screen, image, coord) {
        var area = screen.getContext("2d");
        area.drawImage(image, coord[0], coord[1]);
        area.drawImage(image, coord[0] - screen.width, coord[1]);
        area.drawImage(image, coord[0], coord[1] - screen.height);
        area.drawImage(image, coord[0] - screen.width, coord[1] - screen.height);
    };

    var stage1 = "xxxxxx xxxxxxx xxxxx\n" +
                 "xF     x          Fx\n" +
                 "xxxx x x xxxxx xxx x\n" +
                 "x  x x x x       x x\n" +
                 "         x x x x    \n" +
                 "x xxxx x x x x xxx x\n" +
                 "x         S        x\n" +
                 "xxx xx xx xxxxxx xxx\n" +
                 "x         x        x\n" +
                 "x xxxx xxxx xx xxx x\n" +
                 "xF                Fx\n" +
                 "xxxxxx xxxxxxx xxxxx\n";

    var stages = [stage1];

    launchgame();

}


