var SodaPop = function(element, frames, width, height, fps, delayStart) {

	var sp = {

		//----------------------------------------
		// Variables
		//----------------------------------------

		listeners: {},
        sodaFrame: 0,
		sodaFrameLength: frames,
		sodaWidth: width,
		sodaHeight: height,
        sodaFPS: fps,
        sodaLoop: true,
        sodaPlaying: true,
        $element: element,
        elapsedTime: 0,
        frameTime: 1000 / fps,
        logCount: 0,
        logLimit: 250,
        delay: 0,

		//----------------------------------------
		// Public Methods
		//----------------------------------------

        init: function () {

            _.bindAll(this, 'addEventListener', 'removeEventListener', 'dispatchEvent', 'next', 'previous', 'play', 'stop', 'setFPS', 'onAnimationProgress', 'onAnimationComplete', 'onAnimationFrame');

            var delay = (delayStart || 0);
            this.elapsedTime -= delay;

            AnimationFrame.addListener(this.onAnimationFrame);
        },

        /**
         *  Adds callbacks on an event type.
         */
        addEventListener: function(type, callback) {
            if(!this.listeners[type])
            {
                this.listeners[type] = [];
            }

            var index = this.listeners[type].indexOf(callback);

            if(index >= 0)
                return;

            this.listeners[type].push(callback);
        },

        /**
         *  Removes callbacks on an event type.
         */
        removeEventListener: function(type, callback) {
            if(!this.listeners[type])
                return;

            var index = this.listeners[type].indexOf(callback);

            if(index < 0)
                return;

            this.listeners[type].splice(index, 1);
        },

        /**
         *  Calls any listeners on the event type and passes along the data.
         */
        dispatchEvent: function(type, data) {

            if(!this.listeners[type])
            {
            	console.log('no listeners of that type');
                return;
            }

            for(var i = 0; i < this.listeners[type].length; i++)
            {
                var e = {type: type, target: this, data: data};
                this.listeners[type][i](e);
            }
        },

        play: function() {
            this.sodaPlaying = true;
        },

        stop: function() {
            this.sodaPlaying = false;
        },

        setFrame: function(frame)
        {
            var index = frame;

            index = MathUtils.loopIndex(0, this.sodaFrameLength-1, index);

            var pos = this.sodaHeight * index;

            this.$element.attr("style", function(index, attr) {

                return 'background-position-y: '+pos+'px;';

            });

            this.sodaFrame = index;
        },

        next: function() {
            this.setFrame(this.sodaFrame+1);
        },

        previous: function() {
            this.setFrame(this.sodaFrame-1);
        },

        setFPS: function(value) {
            this.fps = value;
            this.frameTime = 1000 / this.fps;
        },

		//----------------------------------------
		// Event Handlers
		//----------------------------------------

        onAnimationFrame: function(delta, time) {
            this.elapsedTime += delta;

            var pre = this.elapsedTime;
            var frameIncrease = 0;

            if(this.elapsedTime >= this.frameTime)
            {
                if(this.elapsedTime >= this.frameTime * 2)
                {
                    frameIncrease = Math.floor(this.elapsedTime / this.frameTime) + this.sodaFrame;
                    this.elapsedTime = this.elapsedTime % this.frameTime;

                    if(this.sodaPlaying)
                    {
                        if(frameIncrease > this.sodaFrameLength-1)
                        {
                            this.setFrame(frameIncrease);
                            this.onAnimationComplete();
                        }
                         else
                        {
                            this.setFrame(frameIncrease);
                            this.onAnimationProgress();
                        }
                    }
                        
                }
                 else
                {
                    this.elapsedTime = MathUtils.loop(0, this.frameTime-1, this.elapsedTime);

                    if(this.sodaPlaying)
                    {
                        if(this.sodaFrame + 1 > this.sodaFrameLength-1)
                        {
                            this.next();
                            this.onAnimationComplete();
                        }
                         else
                        {
                            this.next();
                            this.onAnimationProgress();
                        }
                    }   
                }
            }

            if(this.logCount < this.logLimit)
            {
                this.logCount++;
            }
            
        },

        onAnimationProgress: function() {
            // dispatch progress event
        },

		onAnimationComplete: function() {
	       // dispatch completion event
           this.elapsedTime -= this.delay;
		}

	};

	sp.init();

	return sp;
}