/*
Name: c2selectbox Basic v1.1.2 (Major.Minor.Bugfix)
Date: 2012-09-07
*/

(function($){
	$.fn.c2Selectbox = function(action) {
		var c2_animation_speed = 100,
			isIE = navigator.appVersion.indexOf('MSIE') > -1,
			isIE7 = navigator.appVersion.indexOf('MSIE 7.') > -1;

		if (typeof action == 'undefined') {
			$(this).each(function() {
				if ($(this).find('option').length > 0) {
					if (!$(this).hasClass('c2-sb-enabled')) {
						$(this).addClass('c2-sb-enabled');

						var original_select = $(this);
						var html = '<div class="c2-sb-inner-wrap"><div class="c2-sb-text"></div><span class="c2-sb-button">Arrow</span></div><div class="c2-sb-list-wrap"><ul class="c2-sb-list"></ul></div>';
						var selectbox = $('<div class="c2-sb-wrap"></div>');
						selectbox.append(html);
						var first_option = $(this).find('option:eq(0)');
						var found_value = false;
						$(this).find('optgroup, option').each(function(index) {
							if ($(this).is('option')) {
								if ($(this).is(':selected')) { // only FF reports checked for the first option if none is actually checked
									$(selectbox).find('.c2-sb-text').text($(this).text());
									found_value = true;
								}
								$(selectbox).find('.c2-sb-list').append('<li class="c2-sb-list-item"><a href="#" class="c2-sb-list-item-link ' + (($(this).is(':selected')) ? 'c2-sb-list-item-link-active' : '') + ' " data-value="' + $(this).val() + '">' + $(this).text() + '</a></li>');
							} else if ($(this).is('optgroup')) {
								$(selectbox).find('.c2-sb-list').append('<li class="c2-sb-list-item"><a href="#" class="c2-sb-list-item-group">' + $(this).attr('label') + '</a></li>');
							}
						});
						if (!found_value) {
							$(selectbox).find('.c2-sb-text').text($(first_option).text());
							$(selectbox).find('.c2-sb-list-item-link[data-value="' + $(first_option).val() + '"]').addClass('c2-sb-list-item-link-active');
							found_value = true;
						}

						var width = $(this).width() + parseInt($(this).css('padding-left')) + parseInt($(this).css('padding-right')) + parseInt($(this).css('border-left-width')) + parseInt($(this).css('border-right-width'));
						$(original_select).hide().after(selectbox);

						var padding = parseInt($(selectbox).find('.c2-sb-inner-wrap').css('padding-left')) + parseInt($(selectbox).find('.c2-sb-inner-wrap').css('padding-right'));
						var button_width = parseInt($(selectbox).find('.c2-sb-button').css('width')) + parseInt($(selectbox).find('.c2-sb-button').css('padding-left')) + parseInt($(selectbox).find('.c2-sb-button').css('padding-right')) + parseInt($(selectbox).find('.c2-sb-button').css('margin-left')) + parseInt($(selectbox).find('.c2-sb-button').css('margin-right'));
						//$(selectbox).find('.c2-sb-text').width(width - padding - button_width);
						list_width = $(selectbox).width() - parseInt($(selectbox).find('.c2-sb-list-wrap').css('border-left-width')) - parseInt($(selectbox).find('.c2-sb-list-wrap').css('border-right-width'));
						$(selectbox).find('.c2-sb-list-wrap').css('min-width', list_width);

						$(selectbox).find('.c2-sb-text, .c2-sb-button').click(function() {
							var sb = $(this).closest('.c2-sb-wrap');
							var list = $(sb).find('.c2-sb-list-wrap');
							$('.c2-sb-wrap').not(sb).c2Selectbox('close');
							$(list).stop(true, true);
							if (!$(list).is(':visible')) {
								$(sb).addClass('c2-sb-open');
							} else {
								$(sb).removeClass('c2-sb-open').addClass('c2-sb-closing');
							}
							$(list).slideToggle(c2_animation_speed, function() {
								if (!$(list).is(':visible')) {
									$(sb).removeClass('c2-sb-closing');
								}
							});
							return false;
						});

						if (isIE7) {
							$(selectbox).find('.c2-sb-list-wrap').css({
								'display': 'block',
								'visbility': 'hidden'
							});
							setTimeout(function() {
								$(selectbox).find('.c2-sb-list-item-link').width($(selectbox).find('.c2-sb-list-wrap').width());
								$(selectbox).find('.c2-sb-list-wrap').css({
									'display': 'none',
									'visbility': 'visible'
								});
							}, 1);
						}

						$(selectbox).find('.c2-sb-list-item-link').click(function() {
							$(this).closest('.c2-sb-list-wrap').find('.c2-sb-list-item-link').removeClass('c2-sb-list-item-link-active');
							$(this).addClass('c2-sb-list-item-link-active');
							$(this).closest('.c2-sb-wrap').find('.c2-sb-text').text($(this).text());
							$(original_select).val($(this).attr('data-value')).change();
							$(selectbox).c2Selectbox('close');
							return false;
						});
						$(selectbox).find('.c2-sb-list-item-group').click(function() {
							return false;
						});
					}
				}
			});

			$('body').click(function(e) {
				if (!$(e.target).is('.c2-sb-wrap *')) {
					$('.c2-sb-wrap').c2Selectbox('close');
				}
				return true;
			});
		} else {
			if (action == 'close') {
				$(this).each(function() {
					var targets = [];
					if ($(this).is('.c2-sb-wrap')) {
						targets.push($(this));
					} else {
						$(this).find('.c2-sb-wrap').each(function() {
							targets.push($(this));
						});
					}
					for (var i = 0; i < targets.length; i++) {
						var t = targets[i]
						if ($(t).find('.c2-sb-list-wrap').is(':visible')) {
							$(t).removeClass('c2-sb-open');
							$(t).addClass('c2-sb-closing');
							$(t).find('.c2-sb-list-wrap').stop(true, true).slideUp(c2_animation_speed, function() {
								$(this).closest('.c2-sb-wrap').removeClass('c2-sb-closing');
							});
						}
					};
				});
			}
		}
	};
})(jQuery);