/**
 * the semi-colon before the function invocation is a safety
 * net against concatenated scripts and/or other plugins
 * that are not closed properly.
 
 * undefined is used here as the undefined global
 * variable in ECMAScript 3 and is mutable (i.e. it can
 * be changed by someone else). undefined isn't really
 * being passed in so we can ensure that its value is
 * truly undefined. In ES5, undefined can no longer be
 * modified.
 
 * window and document are passed through as local
 * variables rather than as globals, because this (slightly)
 * quickens the resolution process and can be more
 * efficiently minified (especially when both are
 * regularly referenced in our plugin).
 */
(function(window, document, $, undefined) {

    'use strict';

    // Match home page services icons and content
    $('.leading__icon').matchHeight();

    // Switches between accordion icons
    function accordionGlyphs(collapsedIcon, openIcon) {
        $('.panel a').on('click', function() {
            if ($(this).hasClass('collapsed')) {
                $('.panel a span').removeClass(openIcon).addClass(collapsedIcon);
                $(this).find('span').removeClass(collapsedIcon).addClass(openIcon);
                $('.panel a').parent().parent().removeClass('active');
                $(this).parent().parent().addClass('active');
            } else {
                $(this).find('span').removeClass(openIcon).addClass(collapsedIcon);
                $(this).parent().parent().removeClass('active');
            }
        });
    }
    accordionGlyphs('glyphicon-triangle-right', 'glyphicon-triangle-bottom');

    // Single Element Slides
    $('.single-item').slick({
        dots: true,
        infinite: true,
        speed: 500,
        fade: true,
        cssEase: 'linear'
    });

    // Fancybox
    // $('.fancy-content').fancybox({
    //     openEffect: 'none',
    //     closeEffect: 'none',
    //     nextEffect: 'fade',
    //     prevEffect: 'fade',
    //     titlePosition: 'outside',
    //     helpers: {
    //         media: {}
    //     }
    // });


    // Homepage Banner Slider
    if ($('.banner-image-container').length) {
        $('.banner-image-container').slick({
            autoplay: true,
            autoplaySpeed: 5000,
            infinite: true,
            arrows: true,
            dots: false,
            asNavFor: '.banner-content-container'
        });
        $('.banner-content-container').slick({
            autoplay: true,
            autoplaySpeed: 5000,
            infinite: true,
            arrows: false,
            dots: false,
            asNavFor: '.banner-image-container'
        });
    }

    if ($('.gallery-sliders').length) {
        $('.gallery-sliders').slick({
            autoplay: false,
            autoplaySpeed: 5000,
            infinite: true,
            arrows: true,
            slidesToShow: 6,
            slidesToScroll: 1,
            responsive: [{
                breakpoint: 1400,
                settings: {
                    slidesToShow: 5
                }
            }, {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 4
                }
            }, {
                breakpoint: 992,
                settings: {
                    slidesToShow: 3
                }
            }, {
                breakpoint: 769,
                settings: {
                    slidesToShow: 2
                }
            }, {
                breakpoint: 481,
                settings: {
                    slidesToShow: 1
                }
            }]

        });
    }

    //match heights
    if ($(".leadin-container").length) {
        $(".leadin-container").matchHeight();
    }

    $('.fancy-video').fancybox({
        openEffect: 'none',
        closeEffect: 'none',
        width: 853,
        height: 480,
        scrolling: 'no',
        helpers: {
            media: {}
        }
    });

    //mobile menu
    $('ul.dropdown-menu [data-toggle=dropdown]').on('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        $(this).parent().siblings().removeClass('open');
        $(this).parent().toggleClass('open');
    });

    // SEO email button
    $('.btn-email-js').on('click', function() {
        _gaq.push(['_trackEvent', 'Email', 'Click', 'Header']);
    });

    /* Dealing with FOUC */
    $('html').removeClass('no-js').addClass('js');

    /**
     * Login Form Actions
     */
    if ($('#titan_ajax_login_form').length) {
        $("#titan_ajax_login_form").submit(function(e) {
            e.preventDefault();
            //reset...
            $(this).find(".alert").removeClass('alert-danger').empty();
            $(this).find(".form-group").removeClass("has-error");

            //validate
            if ($(this).find('#username').val() == "") {
                $(this).find('#username').closest('.form-group').addClass("has-error");
                $(this).find('#username').focus();
                return;
            }
            if ($(this).find('#password').val() == "") {
                $(this).find('#password').closest('.form-group').addClass("has-error");
                $(this).find('#password').focus();
                return;
            }

            //
            titan_toggle_loading(true);

            //alright lets send it to backend
            $.ajax({
                type: "POST",
                url: titan_object.ajax_url,
                data: $("#titan_ajax_login_form").serialize(),
                success: function(response) {
                    try {
                        console.log(response);
                        var obj = JSON.parse(response);
                        if (obj.result == 'success') {
                            $(".titan-loading-message").html(obj.message);
                            //reload the page
                            window.location.reload();
                        } else {
                            //error
                            $("#titan_ajax_login_form").find('.alert').addClass('alert-danger').html(obj.message);
                            titan_toggle_loading(false);
                        }
                    } catch (e) {
                        console.log(e);
                        //error
                        $("#titan_ajax_login_form").find('.alert').addClass('alert-danger').html("Opps, something went wrong, please try again.");
                        titan_toggle_loading(false);
                    }
                },
                error: function() {
                    //error
                    $("#titan_ajax_login_form").find('.alert').addClass('alert-danger').html("Opps, something went wrong, please try again.");
                    titan_toggle_loading(false);
                }
            });
        });
    }
    /**
     * Toggle the loading div
     * @param {type} visible
     * @returns {undefined}
     */
    function titan_toggle_loading(visible) {
        // Trigger loading modal popup
        if (visible) {
            jQuery.fancybox.open(jQuery('.titan-loading'), {
                modal: true,
                type: 'inline',
                maxWidth: 300,
                maxHeight: 150,
                fitToView: false,
                width: '100%',
                height: '100%',
                autoSize: false,
                openEffect: 'none',
                closeEffect: 'none',
                live: false
            });
        } else {
            jQuery.fancybox.close();
        }
    }

    /* BEGIN - IE Hack Fix */
    function isIE() {
        var ua = window.navigator.userAgent;
        var msie = ua.indexOf('MSIE ');
        var trident = ua.indexOf('Trident/');
        if (msie > 0) {
            // IE 10 or older => return version number
            var iever = parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
            // return version number if lesser than ver 9
            if (iever < 9)
                return iever;
        }
        // other browser
        return false;
    }
    if (isIE()) {
        var ie_class = '';
        for (var y = parseInt(isIE()); y < 9; y++)
            ie_class = ie_class + 'lt-ie' + (y + 1) + ' ';
        $('html').addClass(ie_class);
    }
    /* END - IE Hack Fix */
})(window, document, jQuery);
