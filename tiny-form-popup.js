/*
 *	Tiny Form Popup for OpenLearning
 *	Initially written by Jenna Fox <a@creativepony.com>, 2011
 *	Makes a miniature comic bubble popup, which can contain
 *	form elements or arbitrary interactive html bits.
 *	For when a lightbox isn't light enough.
 */

(function() {
	// manufactures bubble html - takes string 'top', 'left', 'right', 'bottom', and {x, y} object
	// returns jquery wrapped html element
	var getBubble = function(edge, target, content) {
		var bubble = jQuery('<div class="tiny-form-popup active"><div class="tfp-notch"></div></div>');
		// add the edge-specific class on the notch
		bubble.addClass('tfp-' + edge + '-edge');
		bubble.find('.tfp-notch').addClass('tfp-notch-' + edge);
		bubble.css('visibility', 'hidden');
		
		// add content to our bubble
		bubble.append(content.children());
		bubble.addClass(content.removeClass('tiny-form-content').attr('class'));
		
		// add bubble to DOM
		if (edge == 'top' || edge == 'left') {
			target.before(bubble);
		} else {
			target.after(bubble);
		}
		
		// now bubble is in DOM it gains a shape, and we can lay it out
		var position = target.position();
		// figure out a centered position as well as bottom and right
		position.y = position.top + (target.outerHeight() / 2);
		position.x = position.left + (target.outerWidth() / 2);
		position.bottom = position.top + target.outerHeight();
		position.right = position.left + target.outerWidth();
		
		// figure out possible coordinates to place the bubble around this object
		var positionsForEdges = {
			top: { top:  position.bottom + 'px',
			       left: position.x + 'px' },
			
			left: { top:  position.y + 'px',
			        left: position.left + target.outerWidth() + 'px' },
			
			right: { top:  position.top + 'px',
			         left: position.left - bubble.outerWidth() + 'px' },
			
			bottom: { top:  position.top - bubble.outerHeight() + 'px',
			          left: position.left + 'px' }
		};
		
		// apply suitable positioning
		bubble.css(positionsForEdges[edge]);
		bubble.hide();
		bubble.css('visibility', '');
		
		// support css transformy stuff if jquery.transform library loaded
		if (bubble.transform) {
			bubble.css({
				origin: ['50%', '0'],
				scale: 0.0,
				opacity: 0.0,
			});
		}
		
		return bubble;
	};
	
	// setup page to support <a.tiny-form-link> elements
	var tfp = window.TinyFormPopup = function() {
		jQuery('.tiny-form-link').live('click', function(event) {
			var link = jQuery(this);
			var content = jQuery(link.attr('href')).clone(true);
			var bubble = tfp.showWithContentAndElement(content, link);
			event.preventDefault();
			event.stopImmediatePropagation();
			return false;
		});
	};
	
	// event handler to remove bubbles when clicks happen outside of them
	var bubbleDestroyerHandler = function(event) {
		var clicked = jQuery(event.target);
		if (!clicked.is('.tiny-form-popup, .tiny-form-popup *')) {
			tfp.dismiss();
		}
	};
	
	// show a popup with set content and target element
	tfp.showWithContentAndElement = function(content, element) {
		// remove any existing bubbles
		tfp.dismiss();
		
		// get a new bubble
		var bubble = getBubble('top', element, content);
		
		// watch for clicks on the document so we can ditch the bubble
		jQuery(document).bind('click', bubbleDestroyerHandler);
		
		// show the bubble
		bubble.show();
		if (bubble.transform) bubble.animate({ scale: 1.0, opacity: 1.0 }, 100);
		
		return bubble;
	};
	
	// externally exposed api to remove bubbles
	tfp.dismiss = function() {
		var forms = jQuery('.tiny-form-popup.active').removeClass('active');
		var props = { translateY: "+=8px", opacity: 0, };
		forms.animate(props, 125, 'swing', function() {
			jQuery(this).remove();
		});
		
		// don't keep watching all clicks on the document
		jQuery(document).unbind('click', bubbleDestroyerHandler);
	};
})();
