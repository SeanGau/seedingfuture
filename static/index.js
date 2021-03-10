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

let frame = {
  translate: [0, 0],
};

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
})

$("body > div").on("click", "button", function() {
  move.target = null;
  $(".target.selected").removeClass("selected");
})

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
})

$("#collage-tools button[name='collage-add']").on("click", function () {
  $("#collage-source").toggleClass("show");
})

$("#collage-tools button[name='collage-clear']").on("click", function () {
  $("#collage-area").html("");
})

$("#collage-source .source-img").on("click", function () {
  let templateDom = $(`
  <div class="target">
    <img src="">
    <button class="btn btn-danger mt-1 d-none" type="button" title="delete" name="collage-remove"><i
            class="far fa-trash-alt"></i></button>
  </div>
  `);
  $("img", templateDom).attr("src", $(this).data("src"));
  $("#collage-area").append(templateDom);
})

$("#collage-area").on("click", ".target button[name='collage-remove']", function () {
  $(this).parents(".target").remove();
  move.target = null;
  $(".target.selected").removeClass("selected");
})

$(window).keydown(function(e){
  if (e.code == 'ShiftLeft' || e.code == 'ShiftRight') {
    move.keepRatio = true;
  }
});
$(window).keyup(function(e){
  if (e.code == 'ShiftLeft' || e.code == 'ShiftRight') {
    move.keepRatio = false;
  }
});