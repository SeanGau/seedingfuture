const move = new Moveable(document.body, {
  draggable: true,
  resizable: true,
  rotatable: true,
  warpable: true,
  keepRatio: false,
  origin: false,
  edge: true,
  throttleDrag: 0,
  throttleResize: 0,
  throttleRotate: 5,
});

let layer_array = [];

function arrayRemove(arr, value) {
  layer_array = arr.filter(function (ele) {
    return ele != value;
  });
}

move.on("drag", e => {
  //console.log(e);
  //$(e.target).css({ left: `${e.left}px`, top: `${e.top}px` });
  e.target.style.transform = e.transform;
});

move.on("resize", e => {
  e.target.style.width = `${e.width}px`;
  e.target.style.height = `${e.height}px`;
});

move.on("scale", ({ target, transform }) => {
  target.style.transform = transform;
});

move.on("rotate", ({ target, transform }) => {
  target.style.transform = transform;
  //console.log(transform);
});

move.on("warp", ({ target, transform, }) => {
  target.style.transform = transform;
});


$("#collage-area").on("click", function () {
  move.target = null;
  $(".target.selected").removeClass("selected");
});

$("body > div.d-flex").on("click", "button", function () {
  move.target = null;
  $(".target.selected").removeClass("selected");
});

$("#collage-area").on("click", ".target", function (e) {
  e.stopPropagation();
  let target = this;
  if (move.target !== target) {
    move.target = target;
    $(".target.selected").removeClass("selected");
    $(target).addClass("selected");
  }
  else {
    //move.resizable = !move.resizable;
  }
});

$("#collage-tools button[name='collage-add']").on("click", function () {
  $("#collage-source").toggleClass("show");
});

$("#collage-tools button[name='collage-export']").on("click", function () {
  $("#collage-area").css({ "border": "0" });
  html2canvas(document.body.querySelector("#collage-area")).then(function (canvas) {
    var img = canvas.toDataURL("image/png");
    var link = document.createElement('a');
    link.download = "seedingfuture.png";
    link.href = img;
    link.click();
  });
  $("#collage-area").css({ "border": "" });
  $(window).resize();
});

$("#collage-tools button[name='collage-clear']").on("click", function () {
  $("#collage-area").html("");
  layer_array = [];
});

$("#collage-source .source-img").on("click", function () {
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

$('#bgcolor').on('input', function () {
  let bgcolor = $(this).val();
  $("#collage-area").css({"background-color": bgcolor});
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

$(document).ready(function () {
  let controlButtonsDom = $(`  
    <div class="moveable-buttons">  
      <button class="btn btn-danger mt-1 target-control" type="button" title="delete" name="collage-remove"><i class="far fa-trash-alt"></i></button>
      <button class="btn btn-secondary mt-1 target-control" type="button" title="up" name="collage-up"><i class="fas fa-arrow-up"></i></button>
      <button class="btn btn-secondary mt-1 target-control" type="button" title="down" name="collage-down"><i class="fas fa-arrow-down"></i></button>
    </div>
  `);
  $(".moveable-control-box").append(controlButtonsDom);
  $(window).resize();
});