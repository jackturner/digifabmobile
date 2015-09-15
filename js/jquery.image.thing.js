var ImageThing = function() {

  var OBJ = {},
      resize_timer = null,
      supports_canvas_element = !!$('<canvas />').prop('getContext')

  var go_all = function() {
    $('.image_thing').each( function() {
      go(this)
    } )
  }

  var notify_of_resize = function() {
    if(resize_timer) clearTimeout(resize_timer)
    resize_timer = setTimeout(go_all, 500)
  }

  var go = function($el, force) {
    $el = $($el)

    if($el.data('draw-once') && $el.data('state') == 'drawn') return

    if($el.data('state') == 'wait') {
      if(!force) return
      $el.data('state', 'drawn')
    }

    if($el.data('mode') != 'actual') {
      $el.css('position', 'absolute')
    }
    else {
      $el.css('overflow', 'hidden')
    }
    $el.css({
      top: 0,
      left: 0,
      width: $el.data('width') || '100%',
      height: $el.data('height') || '100%'
    })

    var $old_canvas = $el.data('canvas'),
        no_fade = $el.data('no-fade') || !$.support.opacity

    if(!no_fade) {
      var $activity = $el.activity(activity_options).children().first()
      $el.data('activity', $activity)
    }

    $('<img />').load(function() {
      var draw_params = scaling_maths({
        src_width: this.width,
        src_height: this.height,
        dest_width: $el.data('width') || $el.width()+1,
        dest_height: $el.data('height') || $el.height()+1,
        mode: $el.data('mode') || 'fill',
        h_align: $el.data('h-align') || 'center',
        v_align: $el.data('v-align') || 'middle'
      })
      if(supports_canvas_element) {
        var $canvas = $('<canvas />').attr({width: $el.width()+1, height: $el.height()+1})
        if($el.data('mode') != 'actual') {
          $canvas.css({ position: 'absolute', top: '50%', left: '50%', zIndex: 2,
                        marginTop: $el.height()/-2,
                        marginLeft: $el.width()/-2  })
        }
        $canvas.hide().appendTo($el)
        $canvas[0].getContext('2d').drawImage( this, 0, 0, this.width, this.height,
                                              draw_params.offset.x, draw_params.offset.y,
                                              draw_params.dim.width, draw_params.dim.height )
      }
      else {
        var $canvas = $('<img />').attr('src', this.src)
        if($el.data('mode') != 'actual') {
        $canvas.css({ position: 'absolute', top: '50%', left: '50%', zIndex: 2,
                      marginLeft: draw_params.offset.x + ($el.width()/-2), marginTop: draw_params.offset.y + ($el.height()/-2),
                      width: draw_params.dim.width, height: draw_params.dim.height })
        }
        $canvas.hide().appendTo($el)

      }
      $el.data('canvas', $canvas)
      $canvas.fadeIn( no_fade ? 0 : 200, function() {
        if(!no_fade) $activity.remove()
        if($old_canvas) $old_canvas.remove()
        $canvas.css('z-index', 1)
      } )
    }).attr('src', $el.data('image-src'))
  }

  var scaling_maths = function(params) {
    var scale = 1,
        ratioX = params.dest_width / params.src_width,
        ratioY = params.dest_height / params.src_height

    if(params.mode == 'fit') scale = ratioX < ratioY ? ratioX : ratioY
    else if(params.mode == 'fill') scale = ratioX > ratioY ? ratioX : ratioY

    var new_width = params.src_width * scale,
        new_height = params.src_height * scale,
        offset_x = (params.dest_width - new_width) / 2,
        offset_y = (params.dest_height - new_height) / 2
   
    if(params.h_align == 'left') offset_x = 0
    else if(params.h_align == 'right') offset_x = params.dest_width - new_width
    if(params.v_align == 'top') offset_y = 0
    else if(params.v_align == 'bottom') offset_y = params.dest_height - new_height

    return {  dim:    { width: Math.ceil(new_width, 10),
                        height: Math.ceil(new_height, 10) },
              offset: { x: Math.floor(offset_x, 10),
                        y: Math.floor(offset_y, 10) } }
  }



  $(window).load(go_all).resize(notify_of_resize)

  return {
    go: function($el) {
      $($el).each(function() {
        go(this, true)
      })
    }
  }

}()