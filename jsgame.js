
var jsgame = function(container) {

    var launchgame = function() {
        container.html('<canvas id="the-game" width="640" height="400">Your browser is pure shit, get a real one and come back.</canvas>');

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
        var rsize = state.rsize = [32, 32];
        var round = state.round = document.createElement("canvas");
        round.width = rsize[0];
        round.heigth = rsize[1];
        var rctx = round.getContext("2d")
        rctx.fillStyle = "rgb(255, 0, 0)";
        rctx.beginPath();
        rctx.arc(rsize[0] / 2, rsize[1] / 2, rsize[0] / 2, 0, Math.PI*2, true);
        rctx.closePath();
        rctx.fill();
        state.size = [640, 400]; 
        state.coords = [25, 25];
        state.speed = [100., 50.];
    };

    var loop = function(state, deltat) {
        var coords = state.coords = _.map(_.zip(state.coords, state.speed, state.size), function(x) {return (x[0] + (x[1] * deltat)) % x[2];});

        var darea = state.screen.getContext("2d");
        darea.fillStyle = "rgb(0,0,0)";
        darea.fillRect(0,0,state.size[0],state.size[1]);
        
        looping_draw(state.screen, state.round, coords);
        
    };

    var looping_draw = function(screen, image, coord) {
        var area = screen.getContext("2d");
        area.drawImage(image, coord[0], coord[1]);
        area.drawImage(image, coord[0] - screen.width, coord[1]);
        area.drawImage(image, coord[0], coord[1] - screen.height);
        area.drawImage(image, coord[0] - screen.width, coord[1] - screen.height);
    };

    launchgame();
}


