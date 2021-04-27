const move = new Moveable(document.body, {
  draggable: true,
  resizable: true,
  rotatable: true,
  keepRatio: false,
  origin: false,
  edge: true,
  throttleDrag: 0,
  throttleResize: 0,
  throttleRotate: 5,
});

let layer_array = [];

function rgbToHex(r, g, b) {
  function componentToHex(c) {
    let hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }
  r = Number(r);
  g = Number(g);
  b = Number(b);
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function arrayRemove(arr, value) {
  layer_array = arr.filter(function (ele) {
    return ele != value;
  });
}

function loadData(data) {
  let orig_w = data['data']['width'];  
  let now_w = $("#collage-area").width();
  let bg_color = data['data']['background-color'];
  let bg_img = data['data']['background-image'];
  $("#collage-area").css({ "background-color": bg_color });
  $("#collage-area").css({ "background-image": bg_img });
  bg_color = bg_color.replace("rgb(","").replace(")","");
  bg_color = bg_color.split(",");
  console.log(rgbToHex(...bg_color));
  $("#bgcolor").val(rgbToHex(...bg_color));

  Object.keys(data['collage']).forEach(element => {
    $("#collage-area").append(data['collage'][element]['outerHTML']);
    layer_array.push(element);
  });
}


const frame = {
  rotate: 0,
  translate: [0, 0],
  scale: [1, 1],
};

move.on("drag", e => {
  //console.log(e);
  $(e.target).css({ left: `${e.left}px`, top: `${e.top}px` });
  //e.target.style.transform = e.transform;
});

move.on("resizeStart", ({ target, set, setOrigin, dragStart }) => {
  // Set origin if transform-orgin use %.
  setOrigin(["%", "%"]);

  const style = window.getComputedStyle(target);
  const cssWidth = parseFloat(style.width);
  const cssHeight = parseFloat(style.height);
  set([cssWidth, cssHeight]);

  dragStart && dragStart.set(frame.translate);
}).on("resize", ({ target, width, height, drag }) => {
  target.style.width = `${width}px`;
  target.style.height = `${height}px`;

  frame.translate = drag.beforeTranslate;
  target.style.transform = drag.transform;
});

move.on("scaleStart", ({ set, dragStart }) => {
  set(frame.scale);

  // If a drag event has already occurred, there is no dragStart.
  dragStart && dragStart.set(frame.translate);
}).on("scale", ({ target, scale, drag }) => {
  frame.scale = scale;
  // get drag event
  frame.translate = drag.beforeTranslate;
  target.style.transform
      = `translate(${drag.beforeTranslate[0]}px, ${drag.beforeTranslate[1]}px)`
      + `scale(${scale[0]}, ${scale[1]})`;
}).on("scaleEnd", ({ target, isDrag, clientX, clientY }) => {
  console.log("onScaleEnd", target, isDrag);
});

move.on("rotateStart", ({ set }) => {
  set(frame.rotate);
}).on("rotate", ({ target, beforeRotate, transform }) => {
  frame.rotate = beforeRotate;
  target.style.transform = transform;
});

move.on("renderEnd", ({ target }) => {  
  $(target).css("transform", $(target).css("transform"));
});

$("#collage-area").on("click", function () {
  move.target = null;
  $(".target.selected").removeClass("selected");
  $("#collage-tools .moveable-buttons").addClass("d-none");
});

$("#collage-area").on("click", ".target", function (e) {
  e.stopPropagation();
  $("#collage-source").removeClass("show");
  let target = this;
  if (move.target !== target) {
    move.target = target;
    $(".target.selected").removeClass("selected");
    $(target).addClass("selected");
    $("#collage-tools .moveable-buttons").removeClass("d-none");
  }
  else {
    //move.resizable = !move.resizable;
  }
});

$("#collage-tools .source-controls").on("click", "button", function () {
  move.target = null;
  $(".target.selected").removeClass("selected");
  $("#collage-tools .moveable-buttons").addClass("d-none");
});

$("#collage-tools .source-controls button[name='collage-add']").on("click", function () {
  $("#collage-source").toggleClass("show");
});

function share_fb(canvas) {
  dataUrl = canvas.toDataURL(),
    imageFoo = document.createElement('img');
  imageFoo.src = dataUrl;

  // Style your image here
  imageFoo.style.width = '100px';
  imageFoo.style.height = '100px';

  // After you are done styling it, append it to the BODY element
  document.body.appendChild(imageFoo);
  window.open('http://www.facebook.com/sharer.php?u=' + encodeURIComponent(dataUrl) + '&t=' + encodeURIComponent(`seedingfuture`), 'sharer', 'toolbar=0,status=0,width=626,height=436');
}

$("#download-form").on("submit", function (e) {
  e.preventDefault();

  $("#collage-area").css({ "border": "0" });
  let export_data = {
    "data": {
      "width": $("#collage-area").width(),
      "height": $("#collage-area").height(),
      "background-color": $("#collage-area").css("background-color"),
      "background-image": $("#collage-area").css("background-image"),
      "email": $("#InputEmail", this).val(),
      "name": $("#InputName", this).val()
    },
    "collage": {}
  };

  html2canvas(document.body.querySelector("#collage-area")).then(function (canvas) {
    var img = canvas.toDataURL("image/png");
    var link = document.createElement('a');
    var date = new Date();
    var time = `${date.getFullYear()}-${date.getMonth()}-${date.getDay()}`;

    layer_array.forEach(element => {
      let targetDom = $(`#collage-area #${element}`);
      targetDom.css("transform", targetDom.css("transform"));

      export_data["collage"][element] = {
        "outerHTML": $(`#collage-area #${element}`).prop("outerHTML")
      };
    });

    link.download = `seedingfuture_${time}.png`;
    link.href = img;
    link.click();

    localStorage.setItem('export_data', JSON.stringify(export_data));

    console.log(export_data);
    $.ajax({
      type: "POST",
      url: "/function/submit",
      data: JSON.stringify(export_data),
      success: function (cb) {
        console.log(cb);
      },
      contentType: "application/json"
    });
  });

  $("#collage-area").css({ "border": "" });
  $(window).resize();
});

$("#collage-tools .source-controls button[name='collage-clear']").on("click", function () {
  $("#collage-area").html("");
  layer_array = [];
});

$("#source-box .source-img").on("click", function () {
  let ms = Date.now();
  let templateDom = $(`
  <div class="target" id="target-${ms}">
    <img src="">
  </div>
  `);
  $("img", templateDom).attr("src", $(this).data("src"));
  $("#collage-area").append(templateDom);
  layer_array.push("target-" + ms);
});

$("#bgModal .bg-img").on("click", function () {
  $("#collage-area").css("background-image", `url(${$(this).data("src")})`);
});

$('#bgcolor').on('input', function () {
  let bgcolor = $(this).val();
  $("#collage-area").css({ "background-color": bgcolor });
});

$(window).keydown(function (e) {
  if (e.code == 'ShiftLeft' || e.code == 'ShiftRight') {
    move.keepRatio = true;
  }
});
$(window).keyup(function (e) {
  if (e.code == 'ShiftLeft' || e.code == 'ShiftRight') {
    move.keepRatio = false;
  }
});

$(window).resize(function () {
  $("#collage-area").css({ "width": "100%", "height": "100%" });
  let c_w = $("#collage-area").width();
  let c_h = $("#collage-area").height();
  if (c_w >= c_h) {
    if (c_w > c_h * 16 / 9) {
      $("#collage-area").width(c_h * 16 / 9);
    }
    else {
      $("#collage-area").height(c_w * 9 / 16);
    }
  }
  else {
    if (c_w > c_h * 9 / 16) {
      $("#collage-area").width(c_h * 9 / 16);
    }
    else {
      $("#collage-area").height(c_w * 16 / 9);
    }
  }
});

$(document).on("click", ".moveable-buttons button[name='collage-remove']", function () {
  arrayRemove(layer_array, $(move.target).attr("id"));
  $(move.target).remove();
  move.target = null;
  $(".target.selected").removeClass("selected");
  $("#collage-tools .moveable-buttons").addClass("d-none");
});

$(document).on("click", ".moveable-buttons button[name='collage-up']", function () {
  let targetDom = $(move.target);
  let target_id = targetDom.attr("id");
  let cur_z = layer_array.indexOf(target_id);
  if (cur_z < layer_array.length - 1) {
    let next_id = layer_array[cur_z + 1];
    targetDom.insertAfter($(`#${next_id}`));

    layer_array[cur_z + 1] = target_id;
    layer_array[cur_z] = next_id;
  }
});

$(document).on("click", ".moveable-buttons button[name='collage-down']", function () {
  let targetDom = $(move.target);
  let target_id = targetDom.attr("id");
  let cur_z = layer_array.indexOf(target_id);
  if (cur_z > 0) {
    let next_id = layer_array[cur_z - 1];
    targetDom.insertBefore($(`#${next_id}`));

    layer_array[cur_z - 1] = target_id;
    layer_array[cur_z] = next_id;
  }
});

$(document).on("click", ".moveable-buttons button[name='collage-flip']", function () {
  let targetDom = $(move.target);
  let target_id = targetDom.attr("id");
  let now_trans = targetDom.css("transform")=="none"?"":targetDom.css("transform");
  targetDom.css("transform", now_trans + " scaleX(-1)");
  move.target = null;
  move.target = targetDom.get(0);
});

$(document).ready(function () {
  /*
  let controlButtonsDom = $(`  
    <div class="moveable-buttons">
      <button class="btn btn-danger mt-1 target-control" type="button" title="delete" name="collage-remove"><i class="far fa-trash-alt"></i></button>
      <button class="btn btn-secondary mt-1 target-control" type="button" title="up" name="collage-up"><i class="fas fa-arrow-up"></i></button>
      <button class="btn btn-secondary mt-1 target-control" type="button" title="down" name="collage-down"><i class="fas fa-arrow-down"></i></button>
      <button class="btn btn-secondary mt-1 target-control" type="button" title="flip" name="collage-flip"><i class="fas fa-arrows-alt-h"></i></button>
    </div>
  `);
  $(".moveable-control-box").append(controlButtonsDom);*/
  $(window).resize();

  let last_data = localStorage.getItem('export_data');
  if(last_data != undefined) {    
    loadData(JSON.parse(last_data));
  }
});