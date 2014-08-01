var PressControl = function(target) {

	var p = {

		//----------------------------------------
		// Variables
		//----------------------------------------

		$target: target,
		blockName: 'undefined',
		holdTimeout: 0,
		holding: false,
		pressTimeout: 0,
		pressed: false,
		pressCount: 0,
		releaseCount: 0,
		doubleTapDelay: 200,
		doubleClickDelay: 100,
		timeUntilHold: 50,
		listeners: {
			click: [],
			doubleclick: [],
			dragStart: [],
			dragUpdate: [],
			moveUpdate: [],
			dragStop: []
		},
		touch: {
			start: {
				x: 0,
				y: 0
			},
			window: {
				x: 0,
				y: 0
			},
			relative: {
				x: 0,
				y: 0
			},
			difference: {
				x: 0,
				y: 0
			}
		},
		rectangle: {
			top: 0,
			bottom: 1,
			left: 0,
			right: 1
		},


		//----------------------------------------
		// Public Methods
		//----------------------------------------

		init: function() {

			_.bindAll(this, 'click', 'doubleClick', 'dragStart', 'dragUpdate', 'dragStop', 'onMouseDown', 'onMouseMove', 'onMouseUp', 'onTouchDown', 'onTouchMove', 'onTouchUp', 'addEventListener', 'removeEventListener', 'hasBlockedTouch', 'onPressTimeout', 'onHoldTimeout', 'moveUpdate');

			if(Modernizr.touch)
			{
				document.addEventListener('touchstart', this.onTouchDown, false);
				document.addEventListener('touchmove', this.onTouchMove, false);
				document.addEventListener('touchend', this.onTouchUp, false);
			}
			 else
			{
				this.$target.bind('mousedown', this.onMouseDown);
				$(window).bind('mousemove', this.onMouseMove);
			}
			
			window.holding = false;
		},

		destroy: function() {
			this.$target.unbind('mousedown', this.onMouseDown);
			$(window).unbind('mousemove', this.onMouseMove);
		},

		addEventListener: function(type, callback) {
			if(!this.listeners[type])
				return;

			var index = this.listeners[type].indexOf(callback);

			if(index >= 0)
				return;

			this.listeners[type].push(callback);
		},

		removeEventListener: function(type, callback) {
			if(!this.listeners[type])
				return;

			var index = this.listeners[type].indexOf(callback);

			if(index < 0)
				return;

			this.listeners[type].splice(index, 1);
		},

		dispatchEvent: function(type, data) {

			if(!this.listeners[type])
			{
				return;
			}

			for(var i = 0; i < this.listeners[type].length; i++)
			{
				var e = {type: type, target: this, data: data};
				this.listeners[type][i](e);
			}
		},

		//----------------------------------------
		// Private Methods
		//----------------------------------------

		click: function() {
			this.dispatchEvent('click', {});
		},

		doubleClick: function() {
			this.dispatchEvent('doubleclick', {});
		},

		dragStart: function() {
			this.dispatchEvent('dragStart', {x: this.touch.start.x, y: this.touch.start.y});
		},

		dragUpdate: function(data) {
			this.dispatchEvent('dragUpdate', data);
		},

		dragStop: function() {
			this.dispatchEvent('dragStop', {});
		},

		moveUpdate: function(data) {
			this.dispatchEvent('moveUpdate', data);
		},

		hasBlockedTouch: function(event) {
			
			console.log(this.blockName, event.srcElement.className);
			if(event.srcElement.className.indexOf(this.blockName) > -1 || event.target.className.indexOf(this.blockName) > -1) {
				return true;
			}
			
			return false;
		},

		//----------------------------------------
		// Mouse Event Handlers
		//----------------------------------------

		onMouseDown: function(event) {

			event.preventDefault();

			if(!this.pressed)
			{
				this.pressed = true;

				this.holdTimeout = setTimeout(this.onHoldTimeout, this.timeUntilHold);

				this.touch.start.x = event.clientX;
				this.touch.start.y = event.clientY;

				this.touch.relative.x = 0;
				this.touch.relative.y = 0;
			}

			$(window).bind('mouseup', this.onMouseUp);
		},

		onMouseMove: function(event) {
			event.preventDefault();

			if(window.holding)
			{
				
				// Window
				this.touch.window.x = event.clientX;
				this.touch.window.y = event.clientY;

				var pctXW = (this.touch.window.x - this.rectangle.left) / (this.rectangle.right - this.rectangle.left);
				var pctYW = (this.touch.window.y - this.rectangle.top) / (this.rectangle.bottom - this.rectangle.top);

				pctXW = MathUtils.clamp(0, 1, pctXW);
				pctYW = MathUtils.clamp(0, 1, pctYW);

				// Relative

				var px = this.touch.relative.x;
				var py = this.touch.relative.y;

				this.touch.relative.x = this.touch.window.x - this.touch.start.x;
				this.touch.relative.y = this.touch.window.y - this.touch.start.y;

				var pctXR = (this.touch.relative.x) / (this.rectangle.right - this.rectangle.left);
				var pctYR = (this.touch.relative.y) / (this.rectangle.bottom - this.rectangle.top);

				// Difference

				this.touch.difference.x = this.touch.relative.x - px;
				this.touch.difference.y = this.touch.relative.y - py;

				var pctXD = (this.touch.difference.x) / (this.rectangle.right - this.rectangle.left);
				var pctYD = (this.touch.difference.y) / (this.rectangle.bottom - this.rectangle.top);

				this.dragUpdate({window: {x: this.touch.window.x, y: this.touch.window.y, pctX: pctXW, pctY: pctYW},
								relative: {x: this.touch.relative.x, y: this.touch.relative.y, pctX: pctXR, pctY: pctYR},
								difference: {x: this.touch.difference.x, y: this.touch.difference.y, pctX: pctXD, pctY: pctYD}});
			}
			 else
			{
				// Window
				var pctXW = (event.clientX - this.rectangle.left) / (this.rectangle.right - this.rectangle.left);
				var pctYW = (event.clientY - this.rectangle.top) / (this.rectangle.bottom - this.rectangle.top);

				pctXW = MathUtils.clamp(0, 1, pctXW);
				pctYW = MathUtils.clamp(0, 1, pctYW);

				this.moveUpdate({window: {x: event.clientX, y: event.clientY, pctX: pctXW, pctY: pctYW}});
			}
			
		},

		onMouseUp: function(event) {

			event.preventDefault();

			if(this.pressed)
			{
				
				this.pressed = false;

				clearTimeout(this.holdTimeout);
			}

			if(this.holding)
			{
				this.dragStop();
				this.holding = false;
				window.holding = false;
			}
			 else
			{
				this.click();
			}

			$(window).unbind('mouseup', this.onMouseUp);
		},

		//----------------------------------------
		// Touch Event Handlers
		//----------------------------------------

		onTouchDown: function(event) {
			

			if(this.hasBlockedTouch(event))
			{
				event.preventDefault();

				if(!this.pressed)
				{
					this.pressed = true;

					this.holdTimeout = setTimeout(this.onHoldTimeout, this.timeUntilHold);

					var touches = event.touches[0];
					this.touch.start.x = touches.pageX;
					this.touch.start.y = touches.pageY;

					this.touch.relative.x = 0;
					this.touch.relative.y = 0;
				}
			}
		},

		onTouchMove: function(event) {
			
			if(window.holding)
			{
				event.preventDefault();

				var touches = event.touches[0];
				this.touch.window.x = touches.pageX;
				this.touch.window.y = touches.pageY;

				var pctXW = (this.touch.window.x - this.rectangle.left) / (this.rectangle.right - this.rectangle.left);
				var pctYW = (this.touch.window.y - this.rectangle.top) / (this.rectangle.bottom - this.rectangle.top);

				pctXW = MathUtils.clamp(0, 1, pctXW);
				pctYW = MathUtils.clamp(0, 1, pctYW);

				// Relative

				var px = this.touch.relative.x;
				var py = this.touch.relative.y;

				this.touch.relative.x = this.touch.window.x - this.touch.start.x;
				this.touch.relative.y = this.touch.window.y - this.touch.start.y;

				var pctXR = (this.touch.relative.x) / (this.rectangle.right - this.rectangle.left);
				var pctYR = (this.touch.relative.y) / (this.rectangle.bottom - this.rectangle.top);

				// Difference

				this.touch.difference.x = this.touch.relative.x - px;
				this.touch.difference.y = this.touch.relative.y - py;

				var pctXD = (this.touch.difference.x) / (this.rectangle.right - this.rectangle.left);
				var pctYD = (this.touch.difference.y) / (this.rectangle.bottom - this.rectangle.top);

				this.dragUpdate({window: {x: this.touch.window.x, y: this.touch.window.y, pctX: pctXW, pctY: pctYW},
								relative: {x: this.touch.relative.x, y: this.touch.relative.y, pctX: pctXR, pctY: pctYR},
								difference: {x: this.touch.difference.x, y: this.touch.difference.y, pctX: pctXD, pctY: pctYD}});
			}
		},

		onTouchUp: function(event) {
			
			if(this.pressed)
			{
				event.preventDefault();

				this.pressed = false;

				clearTimeout(this.holdTimeout);
			}

			if(this.holding)
			{
				event.preventDefault();
				this.dragStop();
				this.holding = false;
				window.holding = false;
			}
			 else
			{
				this.click();
			}
		},

		//----------------------------------------
		// Delayed Event Handlers
		//----------------------------------------

		onPressTimeout: function() {

			if(this.releaseCount == 1)
			{
				this.click();
			}

			this.pressed = false;
			this.pressCount = 0;
			this.releaseCount = 0;
		},

		onHoldTimeout: function() {
			this.dragStart();
			this.holding = true;
			window.holding = true;
			this.pressed = false;

			
		}
	}

	p.init();

	return p;
}