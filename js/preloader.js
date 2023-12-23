const tilesetImageNames = [
  "apple",
  "blank",
  "eb",
  "el",
  "er",
  "et",
  "hb",
  "ht",
  "hr",
  "hl",
  "lb",
  "lr",
  "lt",
  "rb",
  "tb",
  "tr",
];

const tilesetNames = ["lemon_beard", "pydis_snake"];

function tilesetImagePath(tileset, imageName) {
  return `./tilesets/${tileset}/${imageName}.svg`;
}

function preloadImages(e) {
  for (var i = 0; i < imageArray.length; i++) {
    var tempImage = new Image();
    tempImage.src = imageArray[i];
  }
}

function getImageNames() {
  let array = [];
  for (const tileset of tilesetNames) {
    for (const imageName of tilesetImageNames) {
      array.push(tilesetImagePath(tileset, imageName));
    }
  }
  return array;
}

imageArray = getImageNames();
this.addEventListener("DOMContentLoaded", preloadImages, true);
